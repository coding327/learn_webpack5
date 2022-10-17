// 在webpack中文件后缀可以省略，它会自动帮我们加上去
import { sum } from "./js/math"
const {priceFormat} = require('./js/format')

console.log(sum(20, 30))
console.log(priceFormat())