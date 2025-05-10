<template>
  <div ref="pdfWrapper" class="pdf-wrapper" v-loading="pending">
    <canvas
      :id="item.id"
      v-for="item in pages"
      :key="item.id"
      @click="handlePageClick($event, item.page)"
    ></canvas>
  </div>
</template>

<script>
import { chunk } from 'lodash'
export default {
  components: {},
  props: {
    url: String,
    isDownloadable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      id: '',
      pages: [],
      pagesImages: [],
      totalPages: 1,
      pending: false,
      pdfAllLoaded: false
    }
  },
  mounted() {
    this.id = 'pdf' + +new Date()
    this.initPdf(this.url)
    document.querySelector('.pdf-wrapper')?.addEventListener('contextmenu', function (e) {
      // console.log('右键菜单', e);
      if (e.target.tagName === 'CANVAS' || e.target.tagName === 'IMG') {
        e.preventDefault()
      }
    })
  },
  computed: {},
  methods: {
    initPdf(url = '') {
      // console.log('initPdf', url);
      // 对URL的文件名部分进行encodeURIComponent编码
      // const urlParts = url.split('/');
      // const fileName = urlParts.pop();
      // const encodedFileName = encodeURIComponent(fileName);
      // url = [...urlParts, encodedFileName].join('/');
      // Loaded via <script> tag, create shortcut to access PDF.js exports.
      const pdfjsLib = window['pdfjs-dist/build/pdf']

      // The workerSrc property shall be specified.
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

      // Asynchronous download of PDF
      const loadingTask = pdfjsLib.getDocument(url)
      loadingTask.promise.then(pdf => {
        // ('PDF loaded', pdf);
        this.totalPages = Math.min(pdf.numPages, 100)

        let k
        this.pages = []
        for (k = 1; k <= this.totalPages; k++) {
          this.pages.push({
            id: this.id + '_' + k,
            page: k
          })
        }
        if (this.pages.length === 0) {
          console.warn('pdf empty!')
          return
        }
        this.$nextTick(async () => {
          this.pagesImages = []
          const MAX_CONCURRENT_TASKS = this.pages.length // 限制最大并发任务数
          const queue = [...this.pages]
          const chunks = chunk(queue, MAX_CONCURRENT_TASKS)
          let pagesNotLoaded = queue.length
          const pagesImages = []

          for (const currentChunk of chunks) {
            await Promise.allSettled(
              currentChunk.map(async item => {
                try {
                  const page = await pdf.getPage(item.page)
                  const canvas = document.getElementById(item.id)
                  if (!canvas) throw new Error(`Canvas not found: ${item.id}`)

                  await this.renderPage(page, canvas)
                  const canvasBlob = await this.canvasToBlob(canvas, 'image/png')
                  const imageUrl = URL.createObjectURL(canvasBlob)

                  pagesImages.push({
                    imageUrl,
                    key: Number(item.id.split('_')[1])
                  })
                } catch (error) {
                  console.error(`Error processing page ${item.page}:`, error)
                } finally {
                  this.pdfAllLoaded = --pagesNotLoaded === 0
                }
              })
            )
          }

          this.pagesImages = pagesImages
          this.$emit('loaded')
        })
      })
    },
    async canvasToBlob(canvas, type) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas 转换为 Blob 失败'))
          }
        }, type)
      })
    },
    async renderPage(page, canvas) {
      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      const renderTask = page.render({
        canvasContext: context,
        viewport
      })
      await renderTask.promise
    },
    async handlePageClick(event, pageNumber) {
      // event.stopPropagation();
      // this.$emit('page-clicked', { pageIndex: pageNumber });
      if (!this.isMobile) {
        return
      }
      this.pending = true
      try {
        this.pagesImages.sort((a, b) => a.key - b.key)
        if (!this.pdfAllLoaded) {
          this.$message.info('pdf未加载完成，请稍等')
          this.pending = false
          return
        }
        const images = this.pagesImages.map(item => item.imageUrl)
        // console.log(images, 'images');
        this.$VantImagePreview({
          images,
          startPosition: pageNumber - 1,
          showIndex: true,
          closeable: true,
          isDownloadable: this.isDownloadable,
          getContainer: () => this.$refs.pdfWrapper
          // className: `${this.isDownloadable ? '' : 'pdf-reader-preview-only'}`
        })
      } catch (error) {
        console.error('打开预览时发生错误：', error)
      } finally {
        this.pending = false
      }
    }
  },
  watch: {
    url(newUrl) {
      if (newUrl) {
        this.pages = []
        this.pagesImages = []
        this.totalPages = 1
        this.id = 'pdf' + +new Date()
        this.initPdf(newUrl)
      }
    }
  }
}
</script>

<style lang="less" scoped>
canvas {
  width: 100%;
  height: 100%;
}
.is-mobile {
  // .pdf-reader-preview .van-image-preview__image {
  //   position: relative;
  //   z-index: 1;
  //   &::after {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     left: 0;
  //     width: 100%;
  //     height: 100%;
  //   }
  // }
}
</style>
