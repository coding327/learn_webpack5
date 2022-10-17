// import "css-loader!../css/style.css"
import "../css/style.css"
// 引入less文件
import "../css/title.less"

const divEl = document.createElement('div')
divEl.className = "title"
divEl.innerHTML = "你好啊，詹姆斯"

document.body.appendChild(divEl)
