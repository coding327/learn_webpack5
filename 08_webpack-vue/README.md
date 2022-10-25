## webpack-vue篇
前面我们已经对于`js`代码进行打包了，其实我们编写的`vue`代码也是属于`js`代码
在`webpack`中，我们是通过**模块**去安装`vue`来使用它，这和`CDN`引入或者说把`vue`下载到本地，通过`script`再引入使用有点不同
因为在`webpack`我们是通过模块的方式来使用`vue`，所以这里我们安装一下`vue`核心代码包
```bash
# vue3已经是默认版本了，所以这里没指定版本号，另外-S可以省略是因为npm5.0+开始默认会加入到生产环境
# 这里解释一下生产环境，最终打包部署到静态服务器，用户下载的时候还是需要vue相关的核心代码的
npm install vue
```

接着进入`src/main.js`文件中，去使用`vue`
```js
// 在webpack中文件后缀可以省略，它会自动帮我们加上去
import { sum } from "./js/math"

// 从vue中引入createApp
import { createApp } from "vue"

const { priceFormat } = require('./js/format')

// 使用import引入文件，和main.js产生依赖关系
import "./js/element"

console.log(sum(20, 30))
console.log(priceFormat())

// 由于已经拿到createApp，这里我们就可以使用了
// 编写vue代码
const app = createApp({
  template: `<h2>Hello World</h2>`,
  data() {
    return {
      message: "Hello World"
    }
  }
})
// 由于index.html中已经有咱们的挂载容器了，直接放选择器在里面
app.mount("#app")
```
我们写的这一系列`vue`代码是写在**`js`文件**【先不说`vue`文件】中的，它本质也是`js`代码，所以应该是可以打包的
来打包测试一下，运行咱们打包文件夹里的`index.html`，并没有把我们模板里的`Hello World`给渲染出来，但是打包没有报错，也就是说渲染显示有问题
然后打开浏览器控制台再来看一下，发现有两条信息，
报错信息如下：
![10179](https://s1.ax1x.com/2022/10/24/x2KMND.png)

这里直接说一下第一个并不是主要原因，先看第二个有`warn`的警告信息
大概意思就是：组件提供了模板选项，但是`runtime compilation`不支持打包的`vue`，然后需要配置
个人解释：我们编写的代码里面有个`template`，`Vue`源代码会对其进行解析，其实`Vue`源代码给我们提供了特别多的这个版本，所有的版本又把它分为了以下两类：
- `Vue`版本一：**`runtime+compiler`**
- `Vue`版本二：**`runtime-only`**

这个版本一中的`compiler`它的功能就是对`template`来做编译的，但是它默认用的是版本二，这个`runtime-only`不包含对`template`的编译

关于它`Vue`的这个源代码打包后，它可不止两个版本，这个我们可以去`node_modules/vue`下找到这个打包的`dist`文件夹，里面就有很多不同的版本
## Vue源代码打包后不同版本解析
- **`vue(.runtime).global(.prod).js`** :
  - 通过浏览器中的`<script src= ".”>`直接使用【`vue.global.js`】;
  - 我们之前通过`CDN`引入和下载的`Vue`版本就是这个版本【`vue.global.js`】;
  - 会暴露一个全局的`Vue`来使用;
  - 关于`(.runtime)`即`vue.runtime.global.js`，`(.runtime)`可有可无，本来的包是`vue.global.js`，但是如果你只想用`runtime`的版本不包含`compiler`【不需要对`template`做编译】，打包的时候它就会更小一点，到时候引入【`vue.runtime.global.js`】;
  - 关于`(.prod)`即`vue.global.prod.js`，`(.prod)`可有可无，`prod`表示的是`production`版本，它是做过压缩的 ;
- **`vue(.runtime).esm-browser(.prod).js`** :
  - 用于通过原生`ES`模块导入使用(在浏览器中通过`<script type="module">`来使用) ;
- **`vue(.runtime).esm-bundler.js`** :
  - 用于`webpack`，`rollup`和`parcel`等构建工具 ;
  - 构建工具中默认是`vue.runtime.esm-bundler.js` ;
  - 如果我们需要解析模板`template`，那么需要手动指定`vue.esm-bundler.js` ;
- **`vue.cjs(.prod).js`** :
  - 服务器端渲染使用 ;
  - 通过`require()`在`Node.js`中使用 ;

这里我们就去指定版本，回到`main.js`文件中
```js
// 从vue中引入createApp，这里指定一下版本
import { createApp } from "vue/dist/vue.esm-bundler"
```

这时我们再重新打包运行一下，发现咱们的模板就显示出来了

## 运行时+编译器 vs 仅运行时
- 在`Vue`的开发过程中我们有**三种方式**来编写`DOM`元素︰
  - 方式一: `template`模板的方式(之前经常使用的方式);
  - 方式二: `render`函数的方式，使用`h`函数来编写渲染的内容;
  - 方式三: 通过`.vue`文件中的`template`来编写模板;
- 它们的模板分别是如何处理的呢?
  - 方式二中的`h`函数可以直接返回一个**虚拟节点**，也就是`Vnode`节点;
  - 方式一和方式三的`template`都需要有**特定的代码**来对其进行解析∶
    - 方式三`.vue`文件中的`template`可以通过在**`vue-loader`**对其进行编译和处理
    - 方式一中的`template`我们必须要**通过源码中一部分代码**来进行编译;
- 所以，`Vue`在让我们选择版本的时候分为**运行时+编译器 vs 仅运行时**
  - **运行时+编译器**包含了对`template`模板的编译代码，更加完整，但是也更大一些;
  - **仅运行时**没有包含对`template`版本的编译代码，相对更小一些;

> 真实开发中，我们是不可能在配置项里的`template`中写很多代码的，既没有代码高亮，太多堆积在配置项中也不好

所以这里我们先尝试把这个`template`中的这么多模板代码转移到`public/index.html`中
```html
<!DOCTYPE html>
<html lang="">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X一UA-Compatible" content="TE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="icon" href="<%= BASE_URL %>favicon.ico">
  <title><%= htmlWebpackPlugin.options.title %></title>
</head>

<body>
  <noscript>
    <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
  </noscript>
  <div id="app"></div>
  <template id="my-app">
    <h2>Hello World</h2>
    <h2>{{message}}</h2>
  </template>
  <!-- built files will be auto injected-->
</body>

</html>
```

接着我们还要做一个绑定，回到`main.js`文件中
```js
...
// 由于已经拿到createApp，这里我们就可以使用了
// 编写vue代码
const app = createApp({
  // template: `<h2>Hello World</h2>`,
  template: "#my-app", // 把上面模板代码抽到index.html中，同时做绑定
  data() {
    return {
      message: "Hello World"
    }
  }
})
// 由于index.html中已经有咱们的挂载容器了，直接放选择器在里面
app.mount("#app")
```

接着进行打包，打包成功，浏览器运行也没有什么问题
但是它还是有弊端，一个是在`html`文件里面，一个是在`main.js`文件里面，这个源代码相当于分开的，当我们在数据仓库中添加数据时，还要跑到另外一个文件中去编写，并且当我们组件比较多时，还要在`html`文件中写一大堆`template`，结构就会太混乱了

之前也说过`createApp`里的配置项就是个**组件**【并且它还是个**根组件**】，我们想把这个根组件里的模板，加上逻辑，以及样式，把这三个整合到一个文件里面，也就是`.vue`文件，这个文件也称为`SFC`文件【`single-file-components`(单文件组件)】

## VSCode对SFC文件的支持
- 在前面我们提到过，真实开发中多数情况下我们都是使用`SFC` ( `single-file components`(单文件组件) )
- 我们先说一下`VSCode`对`SFC`的支持:
  - 插件一: `Vetur`，从`Vue2`开发就一直在使用的`VSCode`支持`Vue`的插件 ;
  - 插件二: `Vue Language Features(Volar)`，官方推荐的插件（后续会基于`Vue Language Features(Volar)`开发官方的`VSCode`插件）;

> 补充几个插件使用注意事项：
`Vetur`、`Vuter`和`Vue Language Features(Volar)`插件
`vue2`我们使用的插件是`vetur`或`vuter`，`vue3`使用的是`Vue Language Features(Volar)`这个插件，注意使用哪个`vue`版本就使用哪个插件

我们在`src`下创建一个`vue`文件夹，接着创建一个`App.vue`文件，在这里面可以编写模板(`template`)、逻辑(`script`)、样式(`style`)
把代码转移到这个`vue`文件中:
1. 把我们`index.html`之前写的模板中的内容移到`App.vue`文件中；
2. 把`main.js`文件中`data`配置项移到`App.vue`文件中；

`App.vue`代码如下：
```vue
<template>
  <h2>Hello World</h2>
  <h2>{{ message }}</h2>
</template>

<script>
  export default {
    data() {
      return {
        message: "Hello World"
      }
    },
    methods: {

    }
  }
</script>

<style>
  h2 {
    color: red;
  }
</style>
```

3. `main.js`导入根组件并作为配置项传入`createApp`中；
```js
// 在webpack中文件后缀可以省略，它会自动帮我们加上去
import { sum } from "./js/math"

// 从vue中引入createApp，这里指定一下版本
import { createApp } from "vue/dist/vue.esm-bundler"

// 导入根组件【注意后缀名.vue不要掉】
import App from "./vue/App.vue"

...

const app = createApp(App)
// 由于index.html中已经有咱们的挂载容器了，直接放选择器在里面
app.mount("#app")
```

重新打包，发现报错，其实我们也能想明白，你现在是一个`.vue`文件，`webpack`肯定是不识别的，就像之前`css`文件，也就是需要`loader`，就是`vue-loader`

## 关于vue-loader
安装`vue-loader`
```bash
npm install vue-loader -D
```

安装完`vue-loader`，就需要去配置`rules`，回到`webpack.config.js`文件中
```js
{
  test: /\.vue$/,
  loader: "vue-loader"
}, // 加载vue所需规则
```

再次打包，发现如下报错信息
`vue-loader was used without the corresponding plugin. Make sure to include VueLoaderPlugin in your webpack config.`

大致意思是说，确保你的`webpack`配置中包含`VueLoaderPlugin`插件
这里我们需要从`vue-loader`里面引入这个插件，并使用这个插件，回到`webpack.config.js`文件中
```js
...
// 引入VueLoaderPlugin插件，插件贯穿于整个webpack生命周期，它可以帮助vue-loader做一些事情
const { VueLoaderPlugin } = require("vue-loader/dist/index")
...
module.exports = {
  ...
  module: { // 配置module
    rules: [ // 注意rules是数组，以后会有多个规则
      ...
      {
        test: /\.vue$/,
        loader: "vue-loader"
      }, // 加载vue所需规则
      {}, // 加载ts需要规则
      // {
      //   test: /\.(css|less)$/,
      //   use: [
      //     "style-loader",
      //     "css-loader",
      //     "less-loader"
      //   ]
      // }, // css、less合并写法
    ]
  },
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      title: "巧克力真美味" // 模板里的htmlWebpackPlugin.options.title中的htmlWebpackPlugin是new出来的对象，options就是传入的配置项，title就是我们这里配置的title
    }), // 可以传入一个指定模板【不指定它有个默认模板】
    new DefinePlugin({
      BASE_URL: '"./"'
    }), // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public", // 从哪个文件夹里复制
          to: "./", // 复制到哪个文件夹【注意它是在打包文件夹基础上，这里也可以不写，默认就是打包文件夹】
          globOptions: {
            ignore: [
              "**/index.html" // 注意这两个**表示当前public文件夹下index.html以及子文件夹下的index.html
            ]
          } // globOptions.ignore忽略某个文件，可以过滤掉某些不需要复制的文件如index.html模板
        }
      ] // patterns匹配的意思
    }), // 复制功能插件
    new VueLoaderPlugin() // vue-loader插件，帮助vue-loader做一些事情
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

然后重新打包就能成功了，浏览器运行显示正常

真实开发是按照组件化开发，这里我们可以接着在`vue`文件夹参创建一个`HelloWorld`组件，注意组件名要使用大驼峰，编写一点代码

> 我打算把它先作为全局组件：

```vue
<template>
<!-- 使用 scoped 后，父组件的样式将不会渗透到子组件中。不过，子组件的根节点会同时被父组件的作用域样式和子组件的作用域样式影响。 -->
  <div>
    <h2>Hello World，我是全局组件</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  }
}
</script>

<style scoped>

</style>
```
接着我们选择全局注册
- 全局注册是在`main.js`文件中，需要使用到`app`应用实例的扩展方法
```js
// 导入根组件【注意后缀名.vue不要掉】
import App from "./vue/App.vue"

// 导入HelloWorld组件
import HelloWorld from "./vue/HelloWorld.vue"

const app = createApp(App)
// 注册全局组件
app.component("HelloWorld", HelloWorld)
// 由于index.html中已经有咱们的挂载容器了，直接放选择器在里面
app.mount("#app")
```

在`App.vue`根组件中使用，注意官方文档有说过，大驼峰命名的组件在使用组件标签时是可以使用短横线连接的
```vue
<template>
  <h2>Hello World</h2>
  <h2>{{ message }}</h2>
  <hello-world></hello-world>
</template>

...
```
重新打包，在浏览器运行正常

> 在到`vue`文件夹中创建一个`NavBar.vue`组件，来作为局部组件

```vue
<template>
  <!-- 使用 scoped 后，父组件的样式将不会渗透到子组件中。不过，子组件的根节点会同时被父组件的作用域样式和子组件的作用域样式影响。 -->
  <div>
    <h2>Hello World，我是局部组件</h2>
  </div>
</template>

<script>
  export default {
    data() {
      return {

      }
    }
  }
</script>

<style>

</style>
```

在`App.vue`文件中进行局部注册并使用
```vue
<template>
  <h2>Hello World</h2>
  <h2>{{ message }}</h2>
  <hello-world></hello-world>
  <NavBarVue />
</template>

<script>
import NavBarVue from './NavBar.vue';

export default {
  components: {
    NavBarVue
  },
  data() {
    return {
      message: "Hello World"
    }
  },
  methods: {

  }
}
</script>

<style scoped>
h2 {
  color: red;
}
</style>

```
重新打包，在浏览器运行正常

## 最后，还有一个问题，就是浏览控制台一直有一个警告，如下
```
Feature flags __VUE_OPTIONS_API__, __VUE_PROD_DEVTOOLS__ are not explicitly defined.
You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.
```

通过他给的链接，我们可以了解到：
`Bundler` 构建功能标志
从 `3.0.0-rc.3` 开始，`esm-bundler`构建现在公开了可以在编译时覆盖的全局功能标志：
- `__VUE_OPTIONS_API__`（启用/禁用选项 `API` 支持，默认值`true`：）
- `__VUE_PROD_DEVTOOLS__`（在生产中启用/禁用 `devtools` 支持，默认值`false`：）

该构建将在不配置这些标志的情况下工作，但是强烈建议正确配置它们以便在最终捆绑包中获得正确的 `tree-shaking`。要配置这些标志：
- `webpack`：使用`DefinePlugin`
- 汇总：使用`@rollup/plugin-replace`
- `Vite`：默认配置，但可以使用`define`选项覆盖
注意：替换值必须是布尔值，不能是字符串，否则捆绑器/压缩器将无法正确评估条件。

`__VUE_OPTIONS_API__`：它是来对`vue2`做适配的，其实现在写的`template`和`data`都是`options api`，在`vue3`写的比较少，用的是`setup`，那么在我们项目里面到底有没有这个东西呢，它默认情况下是`true`，即是有这个东西的，那么到时候`vue`源代码里面是有一部分来做这个`options api`解析的代码的，但是如果你`vue3`写的都是`setup`代码，我就不需要`options api`这部分代码了，它推荐我们可以设置为`false`，它到时候可以做`tree-shaking`，警告里面有这个词，`tree-shaking`它在真正打包的时候可以把我们这部分代码本来是有的但是我发现你不需要有这个东西，它就会把我们这部分代码从我们源代码里面删除掉，那我们代码就可以变得更小一点

`__VUE_PROD_DEVTOOLS__`：生产环境要不要做`devtool`，它其实是一个`vue`调试工具，调试工具一般在开发阶段使用，生产环境一般是不需要让它生效的，它刚好默认值就是`false`，如果你想要生产环境生效就设置为`true`

怎么去除这个警告呢？
其实它上面也有写，`webpack`：使用`DefinePlugin`，这个`DefinePlugin`之前我们有给`index.html`设置`BASE_URL`即`favicon.ico`，这里回到`webpack.config.js`文件中配置
```js
...
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")

module.exports = {
  ...
  plugins: [
    ...
    new DefinePlugin({
      BASE_URL: '"./"',
      __VUE_OPTIONS_API__: true, // 这个就是开启options api，如果都是setup，vue3代码，可以关闭，减小vue源码体积
      __VUE_PROD_DEVTOOLS__: false // 这个默认就是false，可以不用设置
    }), // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
    ...
}
```

这时候我们再次打包就发现警告消除了

## 小细节说一下
在我们以`.vue`文件书写模板时，`template`不再是那种原先的配置项中的属性了【它原先解析还需要依靠特定的版本】，这种`.vue`文件最主要的是，他那个`vue-loader`会依赖一个`@vue/compiler-sfc`它会去解析`template`标签及里面的内容，所以在打包我们的源代码时，它加载就已经做了解析，就不再需要再多做一次解析了，所以从`vue`引入`createApp`那里可以改一下了
`main.js`文件`diff`如下：
```js
...
// 从vue中引入createApp，这里指定一下版本
// import { createApp } from "vue/dist/vue.esm-bundler"
// 加载.vue文件可以直接从vue中引入，因为它不需要上面那个做解析，自己使用vue-loader依赖的@vue/compiler-sfc做解析
import { createApp } from "vue"

...
```

重新打包，浏览器运行显示正常，控制台也没有报错