## 认识css-loader
由于`webpack`社区很强大，这个`loader`不需要我们去编写，对于`css`在社区有个很强大的`css-loader`，我们只需要使用`npm`安装上即可，同时`loader`只在**开发环境**使用安装时可以加上参数`-D`
```bash
npm install css-loader -D
```
安装了不代表就能直接使用，还需要配置

## css-loader使用方案
如何使用这个loader来加载css文件呢?有三种方式:
- 内联方式;
- CLI方式 ( webpack5中不再使用）;
- 配置方式;

1. 内联方式
由于`abc.js-->abc.css`我们可以在`abc.js`文件中配置
```js
import "css-loader!../css/abc.css"
```
注意！一定要加上，它是起分割作用的
之后打包，没有报错，但是这个样式文件没有生效，浏览器审查元素发现样式没加上去啊，其实一个`loader`还不够，我们还需要其它`loader`把样式添加到元素上面去

- 内联方式：内联方式使用较少，因为不方便管理
  - 在引入的样式前加上使用的`loader`，并且使用！分割；
- `CLI`方式
  - 在`webpack5`的文档中已经没有了`--module-bind`；
  - 实际应用中也比较少使用，因为不方便管理；
- `loader`配置方式【在我们的`webpack.config.js`文件中写明配置信息】
  - `module.rules`中允许我们配置多个`loader`(因为我们也会继续使用其他的`loader`，来完成其他文件的加载）;
  - 这种方式可以更好的表示`loader`的配置，也方便后期的维护，同时也让你对各个`Loader`有一个全局的概览;

进入`webpack.config.js`文件中配置
```js
const path = require('path')

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "main.js"
  },
  module: { // 配置module
    rules: [ // 注意rules是数组，以后会有多个规则
      {
        test: /\.css$/, // 正则表达式，由于.在正则表达式中有特殊含义，使用反斜杠转义
        // 1. loader的写法(语法糖，是use: "css-loader"的简写，use可以写字符串、对象及数组)
        // loader: "css-loader"

        // use: "css-loader"
        // use: {
        //   loader: "xxx-loader",
        //   options: xxx
        // }

        // 2. 完整的写法【数组】
        // 但是一个loader是搞不定的，use这里一般是放数组
        use: [
          // 对象写法语法格式【一般对象都是作为配置项】
          // {loader: "xxx-loader", options: xxx}
          // {loader: "css-loader"}
          // 如果loader没有其它参数配置，一般可以写下面这种
          "css-loader"
        ]
      }, // 加载css需要规则
      {}, // 加载less需要规则
      {}, // 加载js以后可能也需要规则
      {}, // 加载ts需要规则
    ]
  }
}
```
以上便是`css-loader`的最终使用方案【当然还需要其它`loader`把样式插入到`html`页面中】

## 认识style-loader
- 我们已经可以通过`css-loader`来加载`css`文件了
  - 但是你会发现这个`css`在我们的代码中并没有生效（页面没有效果)。
- 这是为什么呢?
  - 因为`css-loader`只是负责将`.css`文件进行解析，并不会将解析之后的`css`插入到页面中;
  - 如果我们希望再完成插入`style`的操作，那么我们还需要另外一个`loader`，就是`style-loader`;
- 安装`style-loader`
```bash
npm install style-loader -D
```

安装完，在`rules`中添加`style-loader`，其中的细节我已经写在注释里面了
```js
const path = require('path')

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "main.js"
  },
  module: { // 配置module
    rules: [ // 注意rules是数组，以后会有多个规则
      {
        test: /\.css$/, // 正则表达式，由于.在正则表达式中有特殊含义，使用反斜杠转义
        // 1. loader的写法(语法糖，是use: "css-loader"的简写，use可以写字符串、对象及数组)
        // loader: "css-loader"

        // use: "css-loader"
        // use: {
        //   loader: "xxx-loader",
        //   options: xxx
        // }

        // 2. 完整的写法【数组】，注意这里数组它是从后往前执行loader，而对于css应该先使用加载loader再使用插入loader，这里的执行顺序一定要注意
        // 但是一个loader是搞不定的，use这里一般是放数组
        use: [
          // 对象写法语法格式【一般对象都是作为配置项】
          // {loader: "xxx-loader", options: xxx}
          // {loader: "style-loader"},
          // {loader: "css-loader"}
          // 如果loader没有其它参数配置，一般可以写下面这种
          "style-loader",
          "css-loader"
        ]
      }, // 加载css需要规则
      {}, // 加载less需要规则
      {}, // 加载js以后可能也需要规则
      {}, // 加载ts需要规则
    ]
  }
}
```

这个`style-loader`它是怎么做的呢？
- 其实就是在`head`中创建一个`style`标签，把我们的样式给它放到`style`标签里面
- 在开发里面我们一般是把它提取到专门的css文件里面，然后给它`link`进来，后面再说，其实就是通过一个插件完成的
