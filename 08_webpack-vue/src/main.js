// 在webpack中文件后缀可以省略，它会自动帮我们加上去
import { sum } from "./js/math"

// 从vue中引入createApp，这里指定一下版本
// import { createApp } from "vue/dist/vue.esm-bundler"
// 加载.vue文件可以直接从vue中引入，因为它不需要上面那个做解析，自己使用vue-loader依赖的@vue/compiler-sfc做解析
import { createApp } from "vue"

// 导入根组件【注意后缀名.vue不要掉】
import App from "./vue/App.vue"

// 导入HelloWorld组件
import HelloWorld from "./vue/HelloWorld.vue"

const {priceFormat} = require('./js/format')

// 使用import引入文件，和main.js产生依赖关系
import "./js/element"

console.log(sum(20, 30))
console.log(priceFormat())

// 由于已经拿到createApp，这里我们就可以使用了
// 编写vue代码
// const app = createApp({
//   // template: `<h2>Hello World</h2>`,
//   template: "#my-app", // 把上面模板代码抽到index.html中，同时做绑定
//   // data() {
//   //   return {
//   //     message: "Hello World"
//   //   }
//   // }
// })

const app = createApp(App)
// 注册全局组件
app.component("HelloWorld", HelloWorld)
// 由于模板中已经有咱们的挂载容器了，直接放选择器在里面
app.mount("#app")