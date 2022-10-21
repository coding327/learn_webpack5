## 如何处理less文件？
在平时开发中，我们可能会喜欢写`sass`、`less`，相比于`css`，可以说是增强了，比如定义变量、嵌套关系
这时候我们写一个`less`文件，并把它加入到依赖图里【element.js-->title.less】
我们尝试进行打包，发现报错
```bash
Module parse failed: Unexpected character '@' (2:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```

如果写个原生项目并使用过`sass`或者`less`，我们之前都是会使用工具【vscode也有这种插件，需要配置】将它们转换为原始的`css`，因为浏览器它不认识`sass`和`less`

由于有`npm`，我们可以使用`lessc`这个工具，当然有的时候也可以直接使用这个`less`，它会自己去找这个`lessc`的
`lessc`完整的应该叫`less compiler`

全局安装`lessc`工具【注意安装的虽然是`less`但是它会帮我们安装`lessc`工具】
```bash
npm install less -g
```

局部安装`lessc`工具【注意安装的虽然是`less`但是它会帮我们安装`lessc`工具】
```bash
npm install less -D
```

安装成功后，我们可以在`node_modules/.bin`找到这个`lessc`文件
我们可以在项目根目录创建一个`test.less`文件，并写一点`less`代码
```less
// 定义两个变量
@bgColor: blue;
@textDecoration: underline;

.title {
  background-color: @bgColor;
  text-decoration: @textDecoration;
}
```

然后使用`npx`命令来对这个`less`文件进行转换【使用`npx`命令，它自己会去`node_modules`下找`lessc`】
```bash
npx lessc ./test.less demo.css
```
`demo.css`是输出文件

运行完之后，项目根目录就会多一个`demo.css`文件，打开`demo.css`，其中代码就是原始`css`代码
```css
.title {
  background-color: blue;
  text-decoration: underline;
}
```

实际开发中，不可能每次都去找这个`less`文件相对路径，那么如何在`webpack`中，把`less`文件的处理和`lessc`工具结合起来呢？
这个时候需要一个`less-loader`这样的一个工具
其实在安装`less-loader`的时候，我们还需要安装`less`这个工具
它本质是依赖于`lessc`的。
局部安装`less-loader`
```bash
npm install less-loader -D
```

回到webpack.config.js文件里，配置`rules`
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
      {
        test: /\.less$/, // less文件
        use: [
          "style-loader", // 解析了css代码，但是样式并未插入到index.html中，所以还需要style-loader，把css代码插入到index.html文件中，其实就是创建style标签把css代码放里面
          "css-loader", // less代码转为了css代码，但是webpack也无法加载解析css，所以需要css-loader
          "less-loader" // lessc独立于webpack，使用less-loader它不仅处理了less文件的import依赖关系【webpack并不识别除js以外的文件，无法加载解析除js以外的文件】，同时使用lessc帮我们将less代码转换为css代码
        ]
      }, // 加载less需要规则
      {}, // 加载js以后可能也需要规则
      {}, // 加载ts需要规则
    ]
  }
}
```

对于`less`文件处理，需要安装的包有`less`和`less-loader`
```bash
npm i less less-loader -D
```