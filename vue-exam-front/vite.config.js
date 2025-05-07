import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import requireTransform from 'vite-plugin-require-transform'

const pathSrc = resolve(__dirname, 'src')

// https://vite.dev/config/
export default ({ command, mode }) => {
  const { VITE_APP_PORT, VITE_APP_API_URL, VITE_APP_BASE_API } = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        // Auto import functions from Vue, e.g. ref, reactive, toRef...
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue', 'pinia', 'vue-router', '@vueuse/head', '@vueuse/core'],
        dts: false
        // dts: 'src/auto-imports.d.ts' // 启动后会自动生成，在此文件中可查看不需要引入的API
      }),
      requireTransform({
        fileRegex: /.js$|.vue$/
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      nodePolyfills({
        include: [],
        exclude: [],
      }),
      {
        name: 'add-scripts-to-html',
        transformIndexHtml(html) {
          const scripts = [
            '<script src="https://bpmax.oss-cn-shanghai.aliyuncs.com/static_files/pdf.js"></script>',
            '<script src="https://bpmax.oss-cn-shanghai.aliyuncs.com/static_files/pdf.worker.js"></script>'
          ];
          return html.replace(
            /<\/head>/,
            `${scripts.join('\n  ')}\n</head>`
          );
        }
      }
    ],
    // 开发或生产环境服务的公共基础路径,此选项也可以通过命令行参数指定（例：vite build --base=/my/public/path/）
    // base: env.NODE_ENV === 'production' ? '/maas/' : '/',
    base: '/',
    // 静态资源服务的文件夹, 默认"public"
    publicDir: 'public',
    resolve: {
      alias: {
        '@': pathSrc
      },
    },
    server: {
      // 允许IP访问
      host: '0.0.0.0',
      // 应用端口 (默认:3000)
      port: Number(VITE_APP_PORT),
      // 开启本地https
      https: {
        key: fs.readFileSync(path.join(__dirname, './cert/localhost+1-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, './cert/localhost+1.pem'))
      },
      // 运行是否自动打开浏览器
      open: true,
      hotOnly: false, // 热更新（webpack已实现了，这里false即可）
      headers: {
        // 允许开发环境跨域
        // 'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        /** 代理前缀为 /dev-api 的请求  */
        [VITE_APP_BASE_API]: {
          changeOrigin: true,
          // 接口地址
          target: VITE_APP_API_URL,
          rewrite: path => path.replace(new RegExp(`^${VITE_APP_BASE_API}`), '')
        }
      }
    }
  })
}
