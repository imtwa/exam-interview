import { ApiService } from './apiService'

/**
 * 上传 API 服务
 * 处理上传相关的 API 调用
 */
export class UploadService extends ApiService {
  protected static baseUrl: string = '/upload'

  /**
   * 更新&上传求职者简历
   * @param file 文件对象
   * @returns Promise 对象
   */
  static async uploadResume(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post('/resume', formData)
  }
}
