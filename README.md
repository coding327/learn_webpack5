## webpack5初识
> 在学习之前确保你已经有`node`环境，并且推荐`node`版本在14.xx.xx即可
像`vue【vue-cli】`、`react【create-react-app】`和`angular【angular-cli】`它们的脚手架都是基于`webpack`开发的，所以学习`webpack`更方便我们了解脚手架

## webpack安装
> 全局安装【不推荐全局安装，实际开发中，每个项目对应的`webpack`版本是不同的，推荐局部安装】
```bash
npm i webpack webpack-cli -g
```
> 局部安装【注意打包工具是安装开发环境即可-->大写D】
```bash
npm i webpack webpack-cli -D
```

## webpack使用
> 在**项目根目录**输入以下命令，它会去你的全局安装下找`webpack`，而不是你局部安装的`webpack`
```bash
webpack
```

> `webpack`包局部安装在`node_modules/.bin/webpack`，那么可以执行它，它就会为我们打包
```bash
./node_modules/.bin/webpack
```

> 但是这样很麻烦，还要找到它安装位置，`npm`为我们提供了一个`npx`，当执行`npx webpack`时，它就会去`node_modules`下找`webpack`
```bash
npx webpack
```

> 除了以上这种做法，其实我们在项目中，一般是在`package.json`编写`scripts`脚本，它也会去`node_modules`下找`webpack`
```json
"scripts": {
  "build": "webpack"
}
```
接着我们只需要使用`npm run build`运行脚本即可

## 问题：以上打包我们并没有指定入口文件，它为什么就可以打包了呢？难道有默认入口？
关于`webpack`打包默认入口文件和出口文件，它是有一个入口文件的，从你当前项目根目录下去找`src`下的`index.js`文件，对它[`index.js`依赖的其它文件也会和它自己一起打包输出到出口文件中]进行打包，如果你改成`main.js`或者其它文件名就会报错，出口默认打包到项目根目录下的`dist`下的`main.js`文件中

## 指定打包的入口文件和出口文件
一般项目中结构是`src/main.js`，打包目录个人经常会用`build`
```bash
npx webpack --entry ./src/main.js --output-path ./build
```

当然以上方法我们也可以在脚本中指定
```json
"scripts": {
  "build": "webpack --entry ./src/main.js --output-path ./build"
}
```

但是我们发现命令太长了，而且`webpack`配置肯定不是一个或者两个，而是会有一大堆的配置的，把所有配置信息写到命令后面肯定不太现实，不方便做管理；
所以真实开发中，不建议在上面写上入口文件和出口文件，我们会在当前项目根目录下创建一个`webpack.config.js`文件，默认文件名就叫这个，当然也可以改，但是需要做额外配置
这个文件它其实会被`webpack`默认读取，这样打包时入口出口我们只需要在其中进行配置
```js
const path = require('path')

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "main.js"
  }
}
```
这其中的入口、出口文件名都是可以自己指定的

这里我们来修改`webpack.config.js`文件名，如改为`abc.config.js`，那么我们就需要做额外配置
回到`package.json`文件中，指定`webpack`配置文件
```json
"scripts": {
  "build": "webpack --config abc.config.js"
}
```

然后`npm run build`即可
但是一般不建议修改，默认使用`webpack.config.js`文件名即可

## webpack的依赖图
> `webpack`到底是如何对我们的项目进行打包的呢?
1. 事实上`webpack`在处理应用程序时，它会根据命令或者配置文件找到入口文件;
2. 从入口开始，会生成一个**依赖关系图**，这个**依赖关系图**会包含应用程序中所需的所有模块（比如js文件、css文件、图片、字体等）；
3. 然后遍历图结构，打包一个个模块（根据文件的不同使用不同的loader来解析)；
![webpack的依赖图](https://s1.ax1x.com/2022/10/17/xDVdM9.png)

为了和我们打包`main.js`产生依赖关系，样式文件或其它`js`文件，可以直接使用`import '文件相对路径'`
这样它就会帮我们打包【从强关联角度，如果样式是为了添加到其它`js`文件的，可以通过`import '文件相对路径'`引入到对应的`js`文件中，也是可以打包的-->其依赖关系为`main.js-->abc.js-->abc.css`】

> 然后我们再次打包，发现报错了
```bash
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```
以上报错信息说模块解析失败，你可能需要一个合适的`loader`来加载这个`css`文件，但是`loader`是什么呢？
- `loader`可以用于对**模块的源代码**进行转换【解析】;
- 我们可以**将`css`文件也看成是一个模块**，我们是**通过`import`来加载这个模块**的;
- 在加载这个模块时，**`webpack`其实并不知道如何对其进行加载**，我们必须制定对应的`loader`来完成这个功能;

## css-loader
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
        // 1. loader的写法(语法糖，是use: "css-loader"的简写)
        // loader: "css-loader"

        // use: "css-loader"

        // 2. 完整的写法
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
        // 1. loader的写法(语法糖，是use: "css-loader"的简写)
        // loader: "css-loader"

        // use: "css-loader"

        // 2. 完整的写法，注意这里数组它是从后往前执行loader，而对于css应该先使用加载loader再使用插入loader，这里的执行顺序一定要注意
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
        // 1. loader的写法(语法糖，是use: "css-loader"的简写)
        // loader: "css-loader"

        // use: "css-loader"

        // 2. 完整的写法，注意这里数组它是从后往前执行loader，而对于css应该先使用加载loader再使用插入loader，这里的执行顺序一定要注意
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

## 认识PostCSS工具
> 什么是PostCSS呢?
- PostCSS是一个通过JavaScript来转换样式的工具;
  - 这个工具可以帮助我们进行一些CSS的转换和适配，比如自动添加浏览器前缀、css样式的重置;
  - 但是实现这些功能，我们需要借助于PostCSS对应的插件;
- 如何使用PostCSS呢?主要就是两个步骤︰
  - 第一步:查找PostCSS在构建工具中的扩展，比如webpack中的postcss-loader;
  - 第二步:选择可以添加你需要的PostCSS相关的插件;

## 命令行使用postcss
- 当然，我们能不能也直接在终端使用`PostCSS`呢?
  - 也是可以的，但是我们需要单独安装一个工具`postcss-cli`;
- 我们可以安装一下它们:`postcss`、`postcss-cli`

```bash
npm install postcss postcss-cli -D
```

- 我们编写一个需要添加前缀的`css`:
  - https://autoprefixer.github.io/
  - 我们可以在上面的网站中查询一些添加`css`属性的样式;

```css
:fullscreen {
  color: red;
}

.content {
  user-select: none;
}
```

## autoprefixer插件
`autoprefixer`自动添加浏览器前缀的插件
- 因为我们需要添加前缀，所以要安装`autoprefixer`:
```bash
npm install autoprefixer -D
```
- 直接使用使用`postcss`工具，并且制定使用`autoprefixer`
```bash
npx postcss --use autoprefixer -o end.css ./src/css/style.css
```
`--use`是使用什么插件
`-o`输出到哪里
最后一个是入口文件

我们可以在项目根目录创建一个`test.css`文件，并输入如下需要添加浏览器前缀的代码：
```css
.title {
  /* 这个代码是需要添加浏览器前缀的 */
  user-select: none;
}
```
局部安装`postcss`、`postcss-cli`
```bash
npm install postcss postcss-cli -D
```
经过一系列转换，最终要输出为有浏览器前缀的代码
`postcss`这个工具还需要一个自动添加浏览器前缀的`plugins`插件-->autoprefixer

局部安装自动添加浏览器前缀`autoprefixer`插件
```bash
npm install autoprefixer -D
```

在终端使用：
```bash
npx postcss --use autoprefixer -o demo.css test.css
```

`demo.css`中代码如下：
```css
.title {
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
```

为了方便接下来测试，我们进入`src/css/style.css`文件中添加`user-select: none;`代码，这个代码其实是需要添加浏览器前缀的
```css
.title {
  color: red;
  font-weight: 700;
  font-size: 30px;
  /* 这个代码是需要添加浏览器前缀的 */
  user-select: none;
}
```

> 实际开发肯定不是这样在终端里面还要输入文件路径，很麻烦，那么在`webpack`中应该怎么使用`postcss`呢？
同样也是需要使用一个`loader`工具-->postcss-loader
主要是`webpack`它也不识别`postcss`，安装这个插件`webpack`就能使用`postcss`
局部安装`postcss-loader`
```bash
npm install postcss-loader -D
```

和之前一样，安装完这个插件肯定还需要配置`rules`
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
        // 1. loader的写法(语法糖，是use: "css-loader"的简写)
        // loader: "css-loader"

        // use: "css-loader"

        // 2. 完整的写法，注意这里数组它是从后往前执行loader，而对于css应该先使用加载loader再使用插入loader，这里的执行顺序一定要注意
        // 但是一个loader是搞不定的，use这里一般是放数组
        use: [
          // 对象写法语法格式【一般对象都是作为配置项】
          // {loader: "xxx-loader", options: xxx}
          // {loader: "style-loader"},
          // {loader: "css-loader"}
          // 如果loader没有其它参数配置，一般可以写下面这种
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader", // 这个比较特殊，它使用了autoprefixer插件，需要做配置项
            options: {
              postcssOptions: {
                plugins: [
                  require("autoprefixer")
                ]
              }
            }
          }
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

最后`npm run build`，在浏览器上运行，通过审查元素，我们可以快速找到样式，发现浏览器前缀已经成功添加上了
```html
<style>.title {
  color: red;
  font-weight: 700;
  font-size: 30px;
  /* 这个代码是需要浏览器前缀的 */
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}</style>
```

但是我们发现这个`postcss-loader`需要额外配置有一大堆，那么有没有其它简便方式呢？
把配置信息抽取出去：
- 首先我们在`webpack.config.js`文件中依旧像之前一样使用字符串语法糖写法
- 其实我们还可以在项目根目录创建一个`postcss.config.js`，然后在其中输入以下代码
```js
module.exports = {
  // 把插件抽离到这里
  plugins: [
    require("autoprefixer")
  ]
}
```

然后重新打包，运行咱们文件，审查元素，发现浏览器前缀依旧添加成功
> 那么它是如何做到的呢？
其实它默认是会在`webpack.config.js`的那个`postcss-loader`那里先看看有没有配置信息，如果没有它就会在当前项目根目录去找这个`postcss.config.js`，接着会查看这个文件有没有导出对象，如果有它就会把这个导出的对象当成配置信息

以上其实我们只需要安装如下几个插件，`postcss-cli`其实并不需要，那个是测试我们在终端使用`postcss`命令
```bash
npm install postcss postcss-loader autoprefixer -D
```

## postcss-preset-env插件
- 事实上，在配置`postcss-loader`时，我们配置插件并不需要使用`autoprefixer`
- 我们可以使用另外一个插件：`postcss-preset-env`
  - `postcss-preset-env`也是一个`postcss`的插件;
  - 它可以帮助我们将一些现代的`CSS`特性，转成大多数浏览器认识的`CSS`，并且会根据目标浏览器或者运行时环境添加所需的`polyfill`;
  - 也包括会自动帮助我们添加`autoprefixer`(所以相当于已经内置了`autoprefixer`) ;

## 局部安装插件
```bash
npm install postcss-preset-env -D
```

由于`postcss-preset-env`插件已经内置`autoprefixer`我们可以去`postcss.config.js`文件中`require`这个`postcss-preset-env`插件即可
```js
module.exports = {
  // 把插件抽离到这里
  plugins: [
    // require("autoprefixer")
    require("postcss-preset-env")
  ]
}
```
然后打包，我们可以在浏览器发现浏览器前缀是添加成功了的

接着测试它是否能把`css`新特性转换为大多数浏览器认识的`css`，进入`src/css/style.css文件中`，添加css颜色8位写法
```css
.title {
  /* color: red; */
  /* css新特性支持8位，最后两位是透明度 */
  color: #12345678;
  font-weight: 700;
  font-size: 30px;
  /* 这个代码是需要浏览器前缀的 */
  user-select: none;
}
```

我们重新打包，运行在浏览器，我们发现颜色由8位转为`rgba`-->大多数浏览器能识别的css代码
```css
.title {
  /* color: red; */
  /* css新特性支持8位，最后两位是透明度 */
  color: rgba(18,52,86,0.47059);
  font-weight: 700;
  font-size: 30px;
  /* 这个代码是需要浏览器前缀的 */
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
```

最后`postcss`需要安装插件归为以下几个
```bash
npm install postcss postcss-loader postcss-preset-env -D
```

最后补充一个知识点：
我们在写那个`rules`时，`test`那个正则是可以把css、less写在一块的，这样可以不用分开写
```js
  {
    test: /\.(css|less)$/,
    use: [
      "style-loader",
      "css-loader",
      "less-loader"
    ]
  }, // 合并写法
```
















