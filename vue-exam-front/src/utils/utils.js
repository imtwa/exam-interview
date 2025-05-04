/**
 * 生成头像
 * @param {*} username
 * @returns
 */
export const generateAvatar = username => {
  if (!username) return ''

  // 根据用户名生成一个hash值
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 根据hash值生成颜色
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }

  // 使用用户名的第一个字符作为头像显示
  const char = username.charAt(0).toUpperCase()

  // 创建SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="50" fill="white" text-anchor="middle" dominant-baseline="central">
        ${char}
      </text>
    </svg>`

  // 转换为Base64 - 使用encodeURIComponent处理非ASCII字符
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}
