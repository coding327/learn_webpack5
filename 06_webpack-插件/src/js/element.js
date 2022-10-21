// import "css-loader!../css/style.css"
import "../css/style.css"
// 引入less文件
import "../css/title.less"
// 引入背景图css【把image.css加入依赖图中】
import "../css/image.css"
// 导入图片模块
import img2 from '../img/img2.png'
// 引入字体文件
import "../font/iconfont.css"

const divEl = document.createElement('div')
divEl.className = "title"
divEl.innerHTML = "你好啊，詹姆斯"

// 设置背景图片
const bgDivEl = document.createElement('div')
bgDivEl.className = "image-bg"

// 设置img元素的src
const imgEl = document.createElement('img')
// imgEl.src = "../img/img2.png" // 错误使用方法
imgEl.src = img2

// i元素，字体图标
const iEl = document.createElement('i')
iEl.className = "iconfont icon-dianshijiB"

// 测试错误代码
let content = []
console.log(content.length)

document.body.appendChild(divEl)
document.body.appendChild(bgDivEl)
document.body.appendChild(imgEl)
document.body.appendChild(iEl)