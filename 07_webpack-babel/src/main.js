// 在webpack中文件后缀可以省略，它会自动帮我们加上去
import { sum } from "./js/math"
const {priceFormat} = require('./js/format')

// 使用import引入文件，和main.js产生依赖关系
import "./js/element"

console.log(sum(20, 30))
console.log(priceFormat())

// 书写ES6代码

const message = "Hello World"
const names = ["abc", "cba", "nba"]

names.forEach(item => console.log(item))
console.log(message)