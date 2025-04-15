import request from './request'

/**
 * Get list of questions
 * @param {Object} params Query parameters
 * @returns {Promise}
 */
export function getQuestionList(params) {
  return request({
    url: '/question',
    method: 'get',
    params
  })
}

/**
 * Get question details
 * @param {string} id Question ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request({
    url: `/question/${id}`,
    method: 'get'
  })
}

/**
 * Upload question Excel file
 * @param {FormData} data FormData object containing file and question information
 * @returns {Promise}
 */
export function uploadQuestionFile(data) {
  return request({
    url: '/question/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Get question template
 * @returns {Promise}
 */
export function getQuestionTemplate() {
  return request({
    url: '/question/template',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * Create new question
 * @param {Object} data Question data
 * @returns {Promise}
 */
export function createQuestion(data) {
  return request({
    url: '/question',
    method: 'post',
    data
  })
}

/**
 * Update question
 * @param {string} id Question ID
 * @param {Object} data Question data
 * @returns {Promise}
 */
export function updateQuestion(id, data) {
  return request({
    url: `/question/${id}`,
    method: 'put',
    data
  })
}

/**
 * Delete question
 * @param {string} id Question ID
 * @returns {Promise}
 */
export function deleteQuestion(id) {
  return request({
    url: `/question/${id}`,
    method: 'delete'
  })
}

/**
 * Get exam list
 * @param {Object} params Query parameters
 * @returns {Promise}
 */
export function getExamList(params) {
  return request({
    url: '/exam',
    method: 'get',
    params
  })
}

/**
 * Get exam details
 * @param {string} id Exam ID
 * @returns {Promise}
 */
export function getExamDetail(id) {
  return request({
    url: `/exam/${id}`,
    method: 'get'
  })
}

/**
 * Submit exam answers
 * @param {Object} data Exam answer data
 * @returns {Promise}
 */
export function submitExamAnswer(data) {
  return request({
    url: '/exam/submit',
    method: 'post',
    data
  })
}

/**
 * Get exam results
 * @param {string} examId Exam ID
 * @returns {Promise}
 */
export function getExamResult(examId) {
  return request({
    url: `/exam/result/${examId}`,
    method: 'get'
  })
} 