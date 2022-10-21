## webpack插件篇
> 经过前面一系列操作基本上大部分结构都有了，但是这里还有一些不太好的地方

1. 每次打包生成的`build`文件夹，下次打包时还要删掉原来的`build`再打包
2. 观察我们的`build`文件夹，可以看到里面有`font`、`img`、`main.js`，但是缺少`index.html`作为我们整个静态资源的入口，注意外面的`index.html`并不是的，因为最后部署的是`build`文件夹，这里的`index.html`还需要打包

> 先解决第一个问题，，每次打包时自动删除`build`文件夹

注意这里不是使用`loader`，`loader`仅是加载某个模块时候使用，这个时候需要的是`Plugin`即插件

## 认识Plugin
`Webpack`的另一个核心是`Plugin`，官方有这样一段对`Plugin`的描述:
  - `While loaders are used to transform certain types of modules, plugins can be leveraged to perform awider range of tasks like bundle optimization, asset management and injection of environment
variables.`
上面表达的含义翻译过来就是∶
  - `Loader`是用于特定的模块类型进行转换;
  - `Plugin`可以用于执行更加广泛的任务，比如打包优化、资源管理、环境变量注入等;

`Plugin`就相当于`loader`解决不了的，由`Plugin`来处理，插件功能非常强大，贯穿了整个`webpack`生命周期，很多地方都会用到插件

![认识plugin](https://s1.ax1x.com/2022/10/22/xcwpuD.png)

其实我们可以发现，浏览器审查这个`index.html`时，样式`style`是插入进去的，它也是可以通过插件把这个样式给它分离出去的【这里不细说】

## 清理打包文件夹的CleanWebpackPlugin插件
前面我们演示的过程中，每次修改了一些配置，重新打包时，都需要**手动删除dist文件夹**:
  - 我们可以借助于一个插件来帮助我们完成，这个插件就是**`CleanWebpackPlugin`**;

安装`CleanWebpackPlugin`插件
```bash
npm install clean-webpack-plugin -D
```

回到`webpack.config.js`文件中配置，注意这个配置不是在`rules`里面配置，它是在最外面引入`CleanWebpackPlugin`类，然后再到导出里面配置
```js
const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin() // 格式：根据CleanWebpackPlugin类创建出对象
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

我们可以在`build`打包文件夹里面新建个`abc.txt`文件，然后打包就可以发现`abc.txt`文件没用了，说明配置没有问题
它其实会自动去读取上下文里面的`output`找到打包文件夹从而删除掉

一句话总结`loader`和`Plugin`的区别？
- `loader`只是在加载模块的时候，它通过我们的一个`test`去匹配这个模块，然后去使用不同的`loader`来处理这个模块，这就是`loader`
- `plugin`可以在我们的`webpack`里面做任何的事情，因为它是贯穿于整个`webpack`的生命周期的

> 接着解决第二个问题

## 帮助生成HTML模板的HtmlWebpackPlugin插件
还有一个不太规范的地方:
  - 我们的`HTML`文件是编写在根目录下的，而最终打包的`build`文件夹中是没有`index.html`文件的;
  - 在进行项目部署的时，必然也是需要有对应的入口文件 `index.html` ;
  - 所以我们也需要对`index.html`进行打包处理;

对`HTML`进行打包处理我们可以使用另外一个插件: **`HtmlWebpackPlugin`** ;
安装`HtmlWebpackPlugin`插件
```bash
npm install html-webpack-plugin -D
```

当我们有了这个插件之后，我们这个项目根目录下的`index.html`可以删掉了，因为最后会把它往`build`文件夹里打包一个的，主要原因是在这个插件里面有个`EJS`模板，它会根据那个`EJS`模板自动在我们打包文件夹里生成对应的`html`的

使用`HtmlWebpackPlugin`插件，做配置
回到`webpack.config.js`文件中
```js
const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
    new HtmlWebpackPlugin()
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

然后进行打包，我们就会发现打包文件夹里会多出来一个`html`文件，而且你把这个文件在浏览器打开是可以正常显示的

我们项目根目录下发现还有个`js`文件，一般`js`文件也会单独放到一个`js`文件夹里面，所以这里我们可以对`js`文件进行优化
回到`webpack.config.js`文件中，对于打包出口文件夹`filename`添加个`js`文件夹即可
```js
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  }
  ...
}
```

再次打包，这样这个目录层次和原生的目录层次其实差别不大
上面就是`HtmlWebpackPlugin`插件基本使用，但是在真实开发里面，一般情况下，我们用的不是`HtmlWebpackPlugin`插件默认给的那个模板，而是自定义一个模板

这里就不得不说一下，`vue`或者是`react`脚手架创建的项目了，不难发现它们这些项目下面都会有个`public`文件夹，而其中有个`index.html`，没错就是这个`index.html`它就是自定义的一个模板

那么我们就来仿照它这种，在我们`webpack`创建的项目下，新建一个`public`文件夹，再新建一个`index.html`，其中的内容我们把`vue3`创建项目的`public/index.html`里的内容拿过来
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
  <!-- built files will be auto injected-->
</body>

</html>
```

那么如何去使用咱们这个模板呢？
回到`webpack.config.js`文件中
```js
const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }) // 可以传入一个指定模板【不指定它有个默认模板】
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

接着进行打包，我们发现控制台报错，报错信息如下：
```bash
ERROR in Template execution failed: ReferenceError: BASE_URL is not defined

ERROR in   ReferenceError: BASE_URL is not defined
```

大概意思是说`BASE_URL`没有定义，这个其实是我们`html`模板里面的那个`favicon`图标，我们在模板里面是有如下代码的
```html
  <link rel="icon" href="<%= BASE_URL %>favicon.ico">
```
这个其实就涉及到`webpack`的一些细节了，上面`href`里面用的是`EJS`语法填充数据，但是这个`BASE_URL`常量我们并没有在哪定义过，那么到时候它就不知道怎么填充数据，所以就报错
解决方法：
1. 把这行代码删掉，就不报错了，然后就可以正常打包【不推荐】
2. 这时候就涉及到一个`DefinePlugin`插件，这个插件是`webpack`内置的一个插件

我们这里采用方案2，进入`webpack.config.js`文件中配置，同时提前准备了一个`favicon.ico`放在`public`文件夹下【顺便把`title`配置了】
```js
const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico", // 配置favicon
      title: "巧克力真美味" // 模板里的htmlWebpackPlugin.options.title中的htmlWebpackPlugin是new出来的对象，options就是传入的配置项，title就是我们这里配置的title
    }), // 可以传入一个指定模板【不指定它有个默认模板】
    new DefinePlugin({
      BASE_URL: '"./"'
    }) // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

重新打包，我们再看看刚刚那个代码以及`title`变成了什么
```html
<link rel="icon" href="./favicon.ico">

<title>巧克力真美味</title>
```

然后在浏览器上看看效果，发现`favicon.ico`没效果，因为打包文件夹下没这个文件，但是我们发现`vue`脚手架打包，它的打包文件夹下怎么就有这个文件呢，当然网上也有别人在配置项里配置`favicon`后面配个路径，但是它会在`html`文件里添加一行`link`引入这样代码，会造成两行，可能有的人说把模板里的那个删掉，反正它自己会生成一行`link`，这也是一个办法，但我们这里主要是想看`vue`脚手架它是怎么做的！！！
这个`favicon.ico`它其实是复制过去的，在vue脚手架创建项目中，像`public`这个文件夹里的文件**除`index.html`模板外**其实最后都是会被复制到打包文件夹里，那么想实现复制这种功能就需要用到`copy-webpack-plugin`插件
其实这里我们也能慢慢发现，想要某个功能`webpack`就有，而不需要我们再去造轮子，`webpack`这个生态、社区还是相当强大的

## 复制功能copy-webpack-plugin插件
局部安装该插件
```bash
npm install copy-webpack-plugin -D
```
回到`webpack.config.js`文件中，进行配置
```js
const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")
// 复制功能copy-webpack-plugin插件
const CopyWebpackPlugin = require("copy-webpack-plugin")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  ...
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
    }) // 复制功能插件
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

然后打包，就可以看到打包文件夹下就有`favicon.ico`文件，浏览器运行正常


## webpack的mode和devtool
进入我们的打包好的`main.js`文件中，可以发现文件非常大，它其实是会出现一个警告的，我们也能在终端看到最后一个警告，它希望我们做个代码分割，这里我们可以把图片限制改为10KB，然后还有一个警告，说我们这个图片太大了，建议图片大小244KB，这个只是建议，不用管它
这个打包的`main.js`有个问题，如果我们代码出错了，那么方便调试，找到源代码吗？
进入`element.js`文件中，加上如下代码：
```js
// 测试错误代码
console.log(content.length)
```

我们重新打包一下，然后在浏览器打开，控制台报错，但是这个时候我们想知道代码哪里写的有问题，然后点进去，发现是那个打包压缩的代码，很难看懂
这个时候我们回到`webpack.config.js`文件中进行配置
```js
module.exports = {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "development", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  // 设置source-map，建立js映射文件，方便调试代码和错误
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  ...
}
```

然后重新打包，打开浏览器控制台，点击右侧报错文件，我们可以直接进入到真实开发环境的源代码里进行调试
