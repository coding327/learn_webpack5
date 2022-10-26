## webpack5初识
> 在学习之前确保你已经有`node`环境，并且推荐`node`版本在14.xx.xx即可
像`vue【vue-cli】`、`react【create-react-app】`和`angular【angular-cli】`它们的脚手架都是基于`webpack`开发的，所以学习`webpack`更方便我们了解脚手架

## 为什么需要webpack?
1. 解决作用域问题【方便可读性和可维护性】
  - 因为原生项目加载太多脚本会导致网络瓶颈。同时如果你不小心更改了`JavaScript`文件的加载顺序，这个项目可能要崩溃
2. 解决代码拆分问题【webpack支持模块】
  - `CommonJS` 没有浏览器支持。没有 `live binding(实时绑定)`。循环引用存在问题。同步执行的模块解析加载器速度很慢。虽然 `CommonJS` 是 `Node.js` 项目的绝佳解决方案，但浏览器不支持模块

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
关于`webpack`打包默认入口文件和出口文件，它是有一个入口文件的，从你当前项目根目录下去找`src`下的`index.js`文件，对它`index.js`依赖的其它文件也会和它自己一起打包输出到出口文件中]进行打包，如果你改成`main.js`或者其它文件名就会报错，出口默认打包到项目根目录下的`dist`下的`main.js`文件中

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
  }, // css、less合并写法
```

## webpack资源篇
[webpack5资源模块](https://webpack.docschina.org/guides/asset-modules/)
在我们真实开发中，`src`目录下肯定还要有`img`目录，里面存放图片，当然资源肯定还包括音频、视频、字体图标等等

## 图片的处理
在项目中，使用图片方式：
1. 通过`css`的`background-image: url('路径')`
2. 通过`img`标签的`src`属性

## webpack5之前需要loader
> 由于最新的`webpack5`已经内置资源模块，而不再需要`loader`，这里扩展一下`file-loader`和`url-loader`

## 认识file-loader
- 要处理`jpg`、`png`等格式的图片，我们也需要有对应的`loader`：**`file-loader`**
  - `file-loader`的作用就是帮助我们处理`**import/require()/url()**`方式引入的一个文件资源，并且会将它放到我们**输出的文件夹**中;
  - 当然我们待会儿可以学习如何修改它的名字和所在文件夹;

## 局部安装file-loader
```bash
npm install file-loader -D
```

## 配置rules
`webpack.config.js`中的图片配置如下：
```js
{
  test: /\.(jpe?g|png|gif|svg)$/,
  use: "file-loader"
}, // 图片资源【webpack5之前借助file-loader】
```

- 在`src/js/element.js`文件中，创建一个`div`标签，再打包一下，这样这个元素就先创建好了
- 接着在`src/css`目录下创建一个`image.css`文件，输入以下代码：

```css
.image-bg {
  background: url('../img/img1.jpg') no-repeat center center/contain;
  width: 200px;
  height: 200px;
}
```

把`image.css`加入依赖图中【webpack才会去打包这个文件】，这里`element.js-->image.css`，所以直接用`import`导入到`element.js`文件中
```js
// 引入背景图css【把image.css加入依赖图中】
import "../css/image.css"
```
接着进行打包，会发现并没有报错，图片资源成功打包，同时浏览器也能成功运行显示图片

> 以上我们使用图片的方式是`background-image: url(路径)`
接下来我们使用第二种`img`的`src`来使用图片，`element.js`代码如下：
```js
// import "css-loader!../css/style.css"
import "../css/style.css"
// 引入less文件
import "../css/title.less"
// 引入背景图css【把image.css加入依赖图中】
import "../css/image.css"

const divEl = document.createElement('div')
divEl.className = "title"
divEl.innerHTML = "你好啊，詹姆斯"

// 设置背景图片
const bgDivEl = document.createElement('div')
bgDivEl.className = "image-bg"

// 设置img元素的src
const imgEl = document.createElement('img')
imgEl.src = "../img/img2.png"

document.body.appendChild(divEl)
document.body.appendChild(bgDivEl)
document.body.appendChild(imgEl)
```

接着打包，并未报错，但是浏览器无法显示图片，其实通过审查元素我们能发现，这个`img`标签确实被插入到`index.html`中，但是它的`src`却还是用着之前相对路径，而之前相对路径是我们在`element.js`文件中使用的，两个文件层级就不同，`index.html`通过这个相对路径并不能找到图片

还有一个问题，在打包文件夹中，也没找到这个打包的图片，其实通过`img`这种`src`赋值一个相对路径，它右边赋的值是个字符串，那么这个`src`就永远是一个字符串，如果是相对路径就永远都是这个相对路径，它并不会根据我们的这个路径找到这个图片资源所在的位置的
为了让它根据我们的这个路径去找到这个图片资源所在的位置，我们就需要像一个模块一样去使用它，而这个模块对应的就是那个图片资源
当我们使用`import/require`时就会把它当成模块使用
进入`element.js`文件中，使用`import`引入图片模块
```js
// 导入图片模块
import img2 from '../img/img2.png'

// 重新赋值
imgEl.src = img2
```

重新打包，打包文件夹打包了该图片，同时浏览器显示正常

> 考虑到打包后的图片名字特别长同时和打包的js文件混在一块，为了解决这个问题我们来了解一下文件命名规则

文件的命名规则
- 有时候我们处理后的**文件名称**按照一定的规则进行显示∶
  - 比如保留原来的**文件名**、**扩展名**，同时为了防止重复，包含一个**`hash值`**等;
- 这个时候我们可以使用`PlaceHolders`来完成，`webpack`给我们提供了大量的`PlaceHolders`来显示不同的内容:
  - [PlaceHolders链接地址](https://webpack.js.org/loaders/file-loader/#placeholders)
  - 我们可以在文档中查阅自己需要的`placeholder`;
- 我们这里介绍几个最常用的`placeholder`:
  - `[ext]`：处理文件的扩展名净
  - `[name]`：处理文件的名称【记录原来文件的名字】;
  - `[hash]`：文件的内容，使用`MD4`的散列函数处理，生成的一个128位的`hash值`(32个十六进制);
  - `[contentHash]`：在`file-loader`中和`[hash]`结果是一致的（在`webpack`的一些其他地方不一样，后面会提到）
  - `[hash:<length>]`：截取`hash`的长度，默认32个字符太长了;
  - `[path]`：文件相对于`webpack`配置文件的路径;
  - `[folder]`：文件所在的原来的文件夹

进入`webpack.config.js`重新配置`rules`
```js
{
  test: /\.(jpe?g|png|gif|svg)$/,
  use: {
    loader: "file-loader",
    options: {
      // outputPath: "img", // 输出目录
      // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      name: "img/[name]_[hash:6].[ext]" // outputPath可以省略【简写】
    }
  }
}, // 图片资源【webpack5之前借助file-loader】
```

重新打包，打包文件夹打包了该图片，同时文件夹及文件名和扩展名都和原来保持一致

## 认识url-loader
`url-loader`和`file-loader`的工作方式是相似的，但是它可以将较小的文件，转成**`base64`的`URI`**

在说这个`base64`之前，首先我们打包好的`main.js`、图片1、图片2、`index.html`【这里我们还没做处理】，这四个文件最终是要放到服务器上去的，然后浏览器访问我们服务器上的资源，请求到`index.html`，然后是`main.js`、接着是`background`的`url`请求图片1，最后`img`标签的`src`请求图片2，一共会发送4次请求，那么与`base64`有什么联系呢？
在我们实际开发中图片肯定是非常非常多的，比如说有几十张小的图片，如果这些图片都是分开的，那么我们万一要去请求这些图片【相当于是几十次请求】对于服务器是有很大压力的【高并发，在同一事件能应付的并发请求数是有限的】，这种情况我们的解决方法：
1. 使用精灵图、雪碧图【相当于只发一次请求，之后再通过背景定位来显示不同的内容就行了】；
2. 使用字体图标【相当于下载下来一个字体，使用这个字体，然后直接设置class即可，显示这个图片，而且对应的是矢量图】
3. 对于小的图片进行编码-->`base64`的`URI`，【这个`URI`会被嵌入到打包好的`main.js`中，如果图片提取到`css`就会在`css`里面，没有就在打包好的`main.js`中，不管是否提取，它都会随着之前请求打包的`main.js`一起加载，而浏览器可以直接解析`base64`的，最后通过解析直接把这个图片显示出来】
以上这三种其实都是对服务器一种高并发的性能上的优化

## 局部安装url-loader
```bash
npm install url-loader -D
```

## 使用url-loader，配置rules
由于`url-loader`和`file-loader`差不多，其实只需要在`file-loader`基础上改一下使用的`loader`名字即可
接着就是配置一个`base64`编码限制，超过多少的不进行`base64`编码，直接进行打包，一般大的图片，我们不会对其进行`base64`编码，因为编码之后也很大，影响这个浏览器加载这个打包的`main.js`文件【如果你不做这个限制，那么它就会把这个所有图片都进行`base64`编码，这个可以自己试一下就知道了】
```js
{
  test: /\.(jpe?g|png|gif|svg)$/,
  use: {
    loader: "url-loader",
    options: {
      // outputPath: "img", // 输出目录
      // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      name: "img/[name]_[hash:6].[ext]", // outputPath可以省略【简写】
      limit: 100 * 1024 // 这个limit是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
    }
  }
}, // 图片资源【webpack5之前借助url-loader】
```

然后打包，发现`img1`是被编码了，而`img2`并没有被编码，浏览器上显示也没有问题

## webpack5开始内置资源模块
官方文档描述：
最新的`webpack5`已经内置资源模块，而不再需要`loader`
资源模块(`asset module`)是一种模块类型，它允许使用资源文件（字体，图标等）而无需配置额外 `loader`。
在 `webpack5` 之前，通常使用：
  - `raw-loader` 将文件导入为字符串
  - `url-loader` 将文件作为 `data URI` 内联到 `bundle` 中
  - `file-loader` 将文件发送到输出目录
资源模块类型(`asset module type`)，通过添加 **4** 种新的模块类型，来替换所有这些 `loader`：
  - `asset/resource` 发送一个单独的文件并导出 `URL`。在这之前通过使用 `file-loader` 实现。
  - `asset/inline` 导出一个资源的 `data URI`。之前通过使用 `url-loader` 实现。
  - `asset/source` 导出资源的源代码。之前通过使用 `raw-loader` 实现。
  - `asset` 在导出一个 `data URI` 和发送一个单独的文件之间自动选择。之前通过使用 `url-loader`，并且配置资源体积限制实现。

上面`asset`其实是我们实际开发中用的最多的
所有图片包括自定义文件名如下配置`webpack.config.js`：
```js
{
  test: /\.(jpe?g|png|gif|svg)$/,
  type: 'asset', // 这个其实是我们实际开发中用的最多的
  generator: {
    filename: "img/[name]_[hash:6][ext]" // 注意在这个内置模块里[ext]是包含了.而file-loader和url-loader不包含.
  },
  parser: {
    dataUrlCondition: {
      maxSize: 100 * 1024 // 这个maxSize是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
    }
  } // 做限制需要在parser里面有个数据url条件，配置最大限制
}, // 图片资源【webpack5开始内置资源模块】
```

然后打包，测试一下发现`img1`是被编码了，而`img2`并没有被编码，浏览器上显示也没有问题

这个自定义文件名还有一种写在`output`里面但是很少，了解一下即可：
```js
module.exports = {
  //...
  output: {
    assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: 'asset', // 这个其实是我们实际开发中用的最多的
        parser: {
          dataUrlCondition: {
            maxSize: 100 * 1024 // 这个maxSize是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
          }
        } // 做限制需要在parser里面有个数据url条件，配置最大限制
      }, // 图片资源【webpack5开始内置资源模块】
    ],
  },
};
```

然后打包，测试一下发现`img1`是被编码了，而`img2`并没有被编码，浏览器上显示也没有问题

## 字体文件的处理
加载字体文件
- 如果我们需要使用某些**特殊的字体或者字体图标**，那么我们会引入很多**字体相关的文件**，这些文件的处理也是一样的。

这里我从阿里图标库中下载了几个字体图标，在`src`文件夹下创建一个`font`文件夹，把字体图标文件放里面

回到`element.js`文件中，来创建一个`i`标签，通过类名方式来使用这个字体图标
```js
// i元素，字体图标
const iEl = document.createElement('i')
iEl.className = "iconfont icon-dianshijiB"

document.body.appendChild(iEl)
```

注意把字体图标的css样式文件放入依赖图里面即`iconfont.css`，而这个文件里依赖的其它字体文件如`ttf`、`woff2`也会加入依赖图，根据这个依赖`webpack`就会去打包这些资源
`element.js`引入`iconfont.css`
```js
// 引入字体文件
import "../font/iconfont.css"
```

这个时候我们尝试打包，是可以打包成功的，但是之前这个`woff2`其实是无法进行模块解析的，也会让我们使用一个`loader`，当然它这里应该是内置了，这个`loader`，我们可以学习一下，`webpack4`可能会使用

## webpack5之前关于字体打包
回到`webpack.config.js`文件中配置`rules`
```js
      {
        test: /\.(eot|ttf|woff2?)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "font/[name]_[hash:6].[ext]" // 注意这里是name，如果写成filename它不会去读文件夹【输出这个文件夹】
          }
        }
      }, // 字体资源【webpack5开始内置这个资源模块】
```

以上打包就能成功，当然这是`webpack5`之前的方案

## webpack5开始关于字体打包
`webpack5`已经内置，其实就是一种`asset module type`
重新配置一下字体文件的规则
```js
{
  test: /\.(eot|ttf|woff2?)$/,
  type: 'asset/resource',
  generator: {
    filename: 'font/[name]_[hash:6][ext]', // 注意内置模块得filename里得[ext]包含.
  }
}, // 字体资源【webpack5开始内置这个资源模块】
```
下方其实一直会有个警告，关于`limit`即做`base64`编码，这个**一般**字体文件是不需要做编码的，当然具体得看公司


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
前面我们演示的过程中，每次修改了一些配置，重新打包时，都需要**手动删除打包文件夹**:
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

## webpack-babel篇
> 这里我们先引入一个工具`babel`

[babel官网](https://babeljs.io)

- 事实上，在开发中我们很少直接去接触`babel`，但是**`babel`对于前端开发**来说，目前是**不可缺少的一部分**:
  - 开发中，我们想要使用**`ES6+`**的语法，想要使用**`TypeScript`**，开发**`React`项目**，它们**都是离不开`Babel`**的;
  - 所以，**学习`Babel`**对于我们理解代码从编写到线上的转变过程至关重要;
- 那么，`Babel`到底是什么呢?
  - `Babel`是一个**工具链**，主要用于旧浏览器或者环境中将**ECMAScript 2015+**代码转换为向后兼容版本的**JavaScript**;
  - 包括:语法转换、源代码转换等;
```js
  [1,2,3].map((n) =>n+ 1);

  [1，2，3].map(function(n) {
    return n + 1;
  });
```

## Babel命令行使用[不推荐]
- `babel`本身可以作为一个独立的工具（和`postcss`一样)，不和`webpack`等构建工具配置来单独使用。
- 如果我们希望在命令行尝试使用`babel`，需要安装如下库:
  - `@babel/core`: `babel`的核心代码，必须安装;
  - `@babel/cli`: 可以让我们在**命令行【如果是在webpack中配置使用是不需要安装的】**使用`babel`;
- 使用`babel`来处理我们的源代码:
  - `src`∶ 是源文件的目录;
  - `--out-dir`: 指定要输出的文件夹`dist`;
  - `--out-file`: 指定要输出的文件如`demo.js`


安装以上两个库
```bash
npm install @babel/core @babel/cli -D
```

我们在项目根目录下创建一个`demo.js`文件，在里面写点`ES6`代码
```js
// 书写ES6代码

const message = "Hello World"
const names = ["abc", "cba", "nba"]

names.forEach(item => console.log(item))
```

这里我们想用`babel`把以上`ES6`代码转换为`ES5`代码，局部安装`babel`，它是在咱们的`node_modules/.bin`下的
```bash
npx babel demo.js --out-dir dist
```

但是会发现`dist`下的`demo.js`依旧还是之前`ES6`代码
主要是因为在我们使用`babel`的时候，如果你想要把我们的某些语法做一个转化，这个时候的话你必须对应的使用一个插件

## babel工具插件的使用
比如我们需要转换箭头函数，那么我们就可以使用箭头函数转换相关的插件:
```bash
npm install @babel/plugin-transform-arrow-functions -D
```

使用该插件：
```bash
npx babel demo.js --out-dir dist --plugins=@babel/plugin-transform-arrow-functions
```

这时候我们再去看`dist`下的`demo.js`，发现箭头函数就被转换为`ES5`代码了
但是`const`没有做转换，这时候我们也可以使用以下这个插件【转换let、const这种块级作用域的定义的关键字】来做转换
```bash
npm install @babel/plugin-transform-block-scoping -D
```

使用该插件：
```bash
# 多个插件用,隔开
npx babel demo.js --out-dir dist --plugins=@babel/plugin-transform-arrow-functions,@babel/plugin-transform-block-scoping
```

这时我们就发现转换成功了

> 但是`ES6`语法这么多还有`ES7`、`ES8`、`ES9`、`ES10`等等，一个一个插件安装太费劲了
正是因为麻烦，所以`babel`它给我们提供了另外一个东西**`preset`**

## babel的预设preset
把我们常用的那些插件相当于集合到了一起
安装`@babel/preset-env`预设:
```bash
npm install @babel/preset-env -D
```

使用预设：
```bash
# 预设可能是有多个的，所以后面会有个s，像react的预设或者ts的预设，它们都有对应的预设的
npx babel demo.js --out-dir dist --presets=@babel/preset-env
```
为了方便观察，可以把`dist`删掉，再执行，发现转换成功

## Babel的底层原理
`babel`是如何做到将我们的**一段代码(`ES6`、`TypeScript`、`React`)**转成**另外一段代码(`ES5`)**的呢?
  - 从一种**源代码（原生语言）**转换成**另一种源代码（目标语言）**，这是什么的工作呢?
  - 就是**编译器**，事实上我们可以将`babel`看成就是一个编译器。
  - `Babel`编译器的作用就是**将我们的源代码**，转换成浏览器可以直接识别的**另外一段源代码**;
**`Babel`也拥有编译器的工作流程:**
  - 解析阶段(`Parsing`)
  - 转换阶段(`Transformation`)
  - 生成阶段(`Code Generation`)

## Babel编译器执行原理
> `Babel`的执行阶段

![10176](https://s1.ax1x.com/2022/10/22/xcxyMn.png)

> 当然，这只是一个简化版的编译器工具流程，在每个阶段又会有自己具体的工作:

![10177](https://s1.ax1x.com/2022/10/22/xcxcq0.png)


## webpack中如何配置babel
## 认识babel-loader
> webpack并没有将我们的ES6代码转为ES5代码

这里我们可以验证一下：
把之前`demo.js`文件里的代码添加到`main.js`文件中
```js
// 书写ES6代码

const message = "Hello World"
const names = ["abc", "cba", "nba"]

names.forEach(item => console.log(item))
console.log(message)
```

然后我们打包试一下，在打包文件夹下找到`main.js`文件，直接搜索`message`就能找到，发现仍然是ES6代码，`webpack`并没有帮我们做转换
因为这不属于`webpack`的工作，`webpack`是一个**模块化**的打包工具，它是不负责语法转换这个工作的，但是它负责每个文件当成一个模块，支持`esmodule`、`commonjs`、`amd`
这个时候我们就需要使用`babel`，将`ES6`及以上的语法转换为`ES5`代码
那么什么时候使用`babel`呢？
很显然就是在`webpack`解析【加载】我们的`js`代码时，使用这个`babel-loader`

安装`babel-loader`
```bash
npm install babel-loader -D
```

回到`webpack.config.js`配置文件中，配置`rules`
```js
{
  test: /\.js$/,
  use: {
    loader: "babel-loader",
    options: {
      plugins: [
        "@babel/plugin-transform-arrow-functions",
        "@babel/plugin-transform-block-scoping",
      ]
    }
  }
}, // 加载js所需要规则【配置项未抽离版】
```

然后再打包，就发现语法转换成功
但是有个弊端，每次写插件过于麻烦，我们可以使用预设`preset`
```js
{
  test: /\.js$/,
  use: {
    loader: "babel-loader",
    options: {
      // plugins: [
      //   "@babel/plugin-transform-arrow-functions",
      //   "@babel/plugin-transform-block-scoping",
      // ]
      presets: [
        "@babel/preset-env"
        // ["@babel/preset-env", {
        //   // 配置项
        // }] // 这个写法是补充的，因为有可能在其它地方需要传入配置项
      ]
    }
  }
}, // 加载js所需要规则【配置项未抽离版】
```

重新打包发现也是转换成功了

之前`postcss`我们把配置可以**抽离**到独立的文件里，`babel`也是可以的
## Babel的配置文件
像之前一样，我们可以将`babel`的配置信息放到一个独立的文件中，`babel`给我们提供了两种配置文件的编写︰
  - `babel.config.json`（或者`js` ，`.cjs` , `.mjs` )文件;
  - `.babelrc.json`(或者`.babelrc` , `.js` , `.cjs` , `.mjs` )文件;
以上第二个多个`rc`，这个`rc`可以理解为`runtime compiler`，运行时编译

它们两个有什么区别呢﹖目前很多的项目都采用了多包管理的方式( `babel`本身、`element-plus`、`umi`等);
  - `.babelrc.json` ( 早期 ): 早期使用较多的配置方式，但是对于配置`Monorepos`项目是比较麻烦的;
  - `babel.config.json` ( `babel7`开始 ): 可以直接作用于`Monorepos`项目的子包，更加推荐;

## 编写babel的配置文件
在项目根目录下新建`babel.config.js`文件，当然也可以是`json`后缀名，个人比较喜欢`js`写
```js
module.exports = {
  presets: [
    "@babel/preset-env"
  ]
}
```

回到`webpack.config.js`文件中重新进行配置，由于配置被抽离出去了，只需要使用`loader`即可
```js
{
  test: /\.js$/,
  loader: "babel-loader" // 这里没写use用loader让阅读性更强
}, // 加载js所需要规则【配置项抽离版】
```
再次打包，发现转换成功


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

const {priceFormat} = require('./js/format')

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


## webpack-server篇
> 为什么要搭建本地服务器?

这里我先补充一下，`vscode`要安装一个`live server`插件，因为它不需要我们去刷新页面，我们将它与`webpack`搭配使用
我们每次修改了源代码，比如在`main.js`中多了一行打印，我们还要再次手动打包，在浏览器中打开，这样很麻烦

通过搭建`server`我们想达到的效果：
  - `src`为咱们源代码文件夹，其中源代码是随时都可能进行修改，当它修改后我希望实时的能够在浏览器上看到对应的效果;
  - 那么我打算对这个源代码做一个实时的更新，一旦你代码发生改变的时候，`webpack`可以自动的来做一个编译，并且立马给我反应到浏览器上
> 搭建`server`

为了完成自动编译，`webpack`提供了几种可选的方式:
  - `webpack watch mode` ;
  - `webpack-dev-server`(常用）;
  - `webpack-dev-middleware` ;

## Webpack watch【真实开发使用不多】
`webpack`给我们提供了`watch`模式:
  - 在该模式下，`webpack`依赖图中的所有文件，只要有一个发生了更新，那么代码将被重新编译;
  - 我们**不需要手动**去运行`npm run build`指令了;

如何开启`watch`呢?两种方式:
  - 方式一︰ 在启动`webpack`的命令中，添加`--watch`的标识 ;
  - 方式二︰ 在导出的配置中，添加`watch: true` ;

1. 演示方式一
回到`package.json`文件中，我们需要给打包执行的脚本添加`--watch`的标识
```json
{
  ...
  "scripts": {
    "build": "webpack --watch"
  },
  ...
}
```
当你添加上这个`--watch`的标识后，它会被`webpack-cli`处理，把这个选型变成一个配置，就是导出的`watch: true`
然后进行打包，使用`live server`打开`index.html`文件，运行正常，这时我们再到`main.js`文件中编写一行打印`123`，发现浏览器也更新
其实我们也能发现`--watch`相当于监听源代码，而`live server`不需要我们再刷新页面，它其实是在监听打包后的代码【`live server`本身就是监听你所打开的文件】

2. 演示方式二
这里我们先把`package.json`里的`--watch`去掉，回到`webpack.config.js`文件中，添加配置选项
```js
...
module.exports = {
  ...
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  watch: true, // 监听源代码是否发生改变，改变就重新进行编译，而不需要再手动打包
  ...
}
```

然后再次打包，测试一下，正常

## webpack-dev-server【推荐】
关于`watch`上面的方式可以监听到文件的变化，但是事实上它本身是没有自动刷新浏览器的功能的:
  - 当然，目前我们可以在`VSCode`中使用`live-server`来完成这样的功能;
  - 但是，我们希望在不使用`live-server`的情况下，可以具备`live reloading`(实时重新加载）的功能;
  - 另外一方面我使用`watch`感觉它有延迟，并且监听不及时，效率不高;
安装`webpack-dev-server`
```bash
npm install webpack-dev-server -D
```

在我们早期`webpack3`之前的时候，启动`webpack`的时候是需要从`webpack-dev-server`中启动，但是现在有了`webpack-cli`，启动不需要从`webpack-dev-server`中启动

如果你做过`vue`或者`react`开发的话，我们一般情况下会在这个`package.json`文件中有两个脚本：
  - `build`: 对我们当前代码来打包，最终交付给部署人员上线用;
  - `serve`或者`dev`: 给我们开启一个本地服务，方便进行本地开发的;

目前在我们的脚本里面就一个`build`，现在我们可以在它下面添加一个脚本
```json
{
  ...
  "scripts": {
    "build": "webpack",
    "serve": "webpack serve"
  },
  ...
}
```

最终它内部是会找到这个`dev-server`，帮助我们启动本地服务
执行这个新脚本`npm run serve`，我的终端显示成功，并且它给了一个运行地址，浏览器上运行正常，但是`build`文件夹下没有任何文件【为什么没文件，后面细节里会专门谈到】，然后在终端发现有如下警告：
`No need to use the 'serve' command together with '{ watch: true }' configuration, it does not make sense.`

意思是：现在如果使用`serve`这个东西，不需要和我们`watch`一起来使用，所以把我们之前在`webpack.config.js`文件中配置的`watch`选项移除掉【当然这里我是注释掉了】

重新再来运行一下`npm run serve`，也是给了个地址，运行正常，也能实时更新

我们访问的这个地址`localhost:8080`不再是`live server`帮助我们开启的，而是我们当前`dev-server`自动给我们搭建了一个本地服务器，其实是基于`express`框架搭建的一个本地服务器，相当于去访问我们这个地址的时候，它就会来到框架搭建的这个服务器里面，去找到我们刚才打包的这些静态资源，把这些静态资源返回给我们的浏览器，浏览器对这些静态资源做一个展示

## 关于dev-server一些细节
1. 我们当前`dev-server`是没有做任何的配置，我们只是在`webpack`后面加了个`serve`参数，它就能自动启动了，这个自动启动其实也是通过我们的`webpack-cli`发现有这么一个`serve`参数，就会利用`dev-server`帮助我们启动一个本地服务了

2. 由于会利用这个`dev-server`启动本地服务，这个`dev-server`不会对我们源代码打包之后生成我们的目标代码的，打开这个`build`打包文件夹里面没有任何内容，就意味着对于源代码打包之后并没有输出打包文件，那我们静态资源是如何进行访问呢？
其实`webpack-dev-server`他也依然是有对于我们的源代码进行编译和打包的，只是它没有做文件输出【文件写入】，而这个打包好的文件它其实是放在内存里面，通过`express`服务器去访问我们之前打包到内存里的这些静态资源，从浏览器访问它也是从内存里面直接去读取我们对应的一个资源，然后再返回给浏览器的

3. 它不做输出主要是因为假如说我们现在打包完之后，先给它输出到`build`文件夹里面了，如果用户进行访问了，你得让`express`服务器先从文件系统里面把我们对应的资源读取到内存里面再转化为一些数据流再返回给浏览器，但是`webpack-dev-server`为了提高开发效率，它会直接把打包之后对应得资源直接放到内存里面，相当于少了一个从文件读取到内存的一个过程，这样提供服务的一个服务器效率更高一点

4. 它保存到内存中实际上用了一个库叫`memfs`(`memory-fs`, `webpack`自己写的)

## 关于dev-server的配置
[dev-server官方文档](https://webpack.js.org/guides/development/#using-webpack-dev-server)

## static配置项
1. 第一个配置项是`static`，以前是`contentBase`但是已经被废弃了
做这个配置，回到`webpack.config.js`文件中
```js
...
module.exports = {
  ...
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到的文件就会访问这个文件夹里的内容
  }, // 注意这个是没有先后顺序，个人习惯写在这里
  ...
}
```

这个`static`主要作用是之前`public`文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的`public`到时候服务访问不到就访问这个文件夹里的内容

如果把复制功能插件注释掉，运行服务，肯定是有些内容无法显示，如`favicon.ico`，但是配置了`static: "./public"`再运行服务，就能正常显示了，因为它会去指定的这个`public`文件夹下找对应的文件

## 认识模块热替换(HMR)
> 什么是`HMR`呢?

- `HMR`的全称是 **`Hot Module Replacement`**，翻译为**模块热替换** ;
- 模块热替换是指在**应用程序运行过程中，替换、添加、删除模块**，而**无需重新刷新整个页面** ;

> 为什么需要热替换？

- 像之前的配置，其实每次修改源代码之后，`dev-server`它都会帮我们刷新页面，但如果是登陆状态【实际开发这种状态是很多的】，我想保持这个登陆状态，而去修改其它地方源代码，那么它肯定会刷新，这个登陆状态不就相当于重置了吗，所以需要热替换
- 性能问题，我修改的仅是一处，如果项目比较大，那么就需要浏览器去加载我们整个页面里面所有的内容，那肯定非常消耗性能

`HMR`通过如下几种方式，来提高开发的速度:
  - 不重新加载整个页面，这样可以保留某些应用程序的状态不丢失;
  - 只更新需要变化的内容，节省开发的时间;
  - 修改了`css`、`js`源代码，会立即在浏览器更新，相当于直接在浏览器的`devtools`中直接修改样式;

> 如何使用`HMR`呢?

- 默认情况下，`webpack-dev-server`已经支持`HMR`，我们只需要开启即可;
- 在不开启`HMR`的情况下，当我们修改了源代码之后，整个页面会自动刷新，使用的是`live reloading`;

回到`webpack.config.js`文件中进行配置：
```js
...
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  ...
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到的文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般放最上面】
  }, // 注意这个是没有先后顺序，个人习惯写在这里
  ...
}
```

重新运行一下服务，这里我们先注意一下我们控制台里面有这样一个`log`
```txt
[HMR] Waiting for update signal from WDS...
```
`HMR`正在等待更新信号从`webpack-dev-server`
这时候我们在`element.js`文件里添加个打印123，正常打印123，接着我们在把这个123修改为456，也是没问题
那么它是通过`HMR`做了个替换呢，还是刷新整个浏览器了？
其实它是刷新整个浏览器了，这里我们可以通过打印就能判断出，因为打印123消失了，控制台没有，这是原因之一，同时，在我们更改打印的值时，我们可以快速切换至浏览器，观察发现它其实是有一个刷新的效果的

明明设置了热替换，为什么没有其起效果呢？
`webpack`默认情况下，它不知道对哪些模块做热替换，相当于它认为现在所有模块改变都是要刷新浏览器的，有某个模块你想要做模块热替换，导入这个模块的时候你还需要使用一个`accept`方法也指定这个模块，比如`element.js`这个模块，我想做模块热替换，我们需要在`main.js`文件中处理
```js
...
// 使用import引入文件，和main.js产生依赖关系
import "./js/element"
// 对element.js模块做模块热替换【module是全局的对象】
if (module.hot) { // 判断有没有开启模块热替换
  module.hot.accept("./js/element.js", () => {
    // 模块更新的时候会触发这个回调，你可以做一些自己想做的事情
    console.log("element.js模块发生更新了")
  })
}
...
```

重新运行服务，修改打印的值，就可以看到控制台留下很多之前打印的值，并且`HMR`也有手动信号
```txt
[HMR] Checking for updates on the server...
```
那么其它模块也要做替换呢？
```js
...
// 使用import引入文件，和main.js产生依赖关系
import "./js/element"
// 【module是全局的对象】
if (module.hot) { // 判断有没有开启模块热替换
  // 对element.js模块做模块热替换
  module.hot.accept("./js/element.js", () => {
    // 模块更新的时候会触发这个回调，你可以做一些自己想做的事情【也可以不传递回调】
    console.log("element.js模块发生更新了")
  })
  // 对xx模块做模块热替换
  // module.hot.accept("xxx", () => {
  //   // 模块更新的时候会触发这个回调，你可以做一些自己想做的事情【也可以不传递回调】
  // })
}
...
```

但是在真实开发里面不可能这么麻烦，写这么多热替换代码

## 框架的HMR
有一个问题: 在开发其他项目时，我们是否需要经常手动去写入`module.hot.accept`相关的`API`呢?
  - 比如开发`Vue`、`React`项目，我们修改了组件，希望进行热更新，这个时候应该如何去操作呢?
  - 事实上社区已经针对这些有很成熟的解决方案了;
  - 比如`vue`开发中，我们使用`vue-loader`，此`loader`支持`vue`组件的`HMR`，提供开箱即用的体验;
  - 比如`react`开发中，有`React Hot Loader`，实时调整`react`组件（目前`React`官方已经弃用了，改成使用`react-refresh` );

接下来我们来演示一下`Vue`实现一下`HMR`功能
重新运行服务，我们去`App.vue`中，更改`message`，浏览器控制台是有这么几条打印的结果的
```txt
[HMR]  - ./src/vue/App.vue?vue&type=script&lang=js
log.js:24 [HMR]  - ./src/vue/App.vue?vue&type=script&lang=js
log.js:24 [HMR]  - ./src/vue/App.vue
log.js:16 [HMR]  - ./src/vue/App.vue?vue&type=template&id=5e019a2f&scoped=true
log.js:24 [HMR]  - ./src/vue/App.vue?vue&type=template&id=5e019a2f&scoped=true
log.js:16 [HMR]  - ./src/vue/App.vue?vue&type=style&index=0&id=5e019a2f&scoped=true&lang=css
log.js:24 [HMR] App is up to date.
```

这就是`vue`的模块热替换，其实它是被`vue-loader`已经内置了，开箱即用

## HMR的原理
那么`HMR`的原理是什么呢?如何可以做到只更新一个模块中的内容呢?
  - `webpack-dev-server`会创建两个服务∶提供静态资源的服务(`express`)和`Socket`服务(`net.Socket`);
  - `express server`负责直接提供静态资源的服务(打包后的资源直接被浏览器请求和解析);

`HMR Socket Server`，是一个`socket`的长连接:
  - 长连接有一个最好的好处是建立连接后双方可以通信（服务器可以直接发送文件到客户端);
  - 当服务器监听到对应的模块发生变化时，会生成两个文件`.json`(`manifest`文件)和`.js`文件(update chunk)
  - 通过长连接，可以直接将这两个文件主动发送给客户端(浏览器);
  - 浏览器拿到两个新的文件后，通过`HMR runtime`机制，加载这两个文件，并且针对修改的模块进行更新;

## HMR的原理图
![HMR的原理图](https://s1.ax1x.com/2022/10/25/xWAV2t.jpg)

- 一旦开启`HMR`，它会另外开启一个`HMR Server`模块热替换的服务，这个服务的本质是`Socket Server`，它主要是用于建立长连接的，一般用于即使通信【微信、直播里的聊天、送礼物】

- 一般`Http`服务器建立的是`Http`连接，也称为短连接，短连接一般有这么一个过程，客户端发送`http`请求-->和服务器建立连接-->服务器做出响应-->断开连接，为什么断开连接呢？
因为我们服务器一般能承受的连接数是有限的，如果同一时刻有很多的连接向我们的服务器请求资源，服务器的压力太大了，所以一般情况下就会断开连接

## hotOnly、host配置项
`host`设置主机地址:
  - 默认值是`localhost` ;
  - 如果希望其他地方也可以访问，可以设置为`0.0.0.0`;

`localhost`和`0.0.0.0`的区别:
  - `localhost`: 本质上是一个域名，通常情况下会被解析成`127.0.0.1`;
  - `127.0.0.1`: 回环地址(`Loop Back Address`)，表达的意思其实是我们主机自己发出去的包，直接被自己接收;
    - 正常的数据库包经常应用层–传输层–网络层–数据链路层–物理层;
    - 而回环地址，是在网络层直接就被获取到了，是不会经常数据链路层和物理层的;
    - 比如我们监听`127.0.0.1`时，在同一个网段下的主机中，通过`ip`地址是不能访问的;
  - `0.0.0.0`∶ 监听`IPV4`上所有的地址，再根据端口找到不同的应用程序;
    - 比如我们监听`0.0.0.0`时，在同一个网段下的主机中，通过`ip`地址是可以访问的;

将`webpack`中的`host`配置成`0.0.0.0`的好处是访问项目既可以使用 `localhost` 又能使用`ip`访问，这样不需要来回修改`host`，因为给别人访问时，必须使用`ip`才行，这样不限定`ip`能让团队每个开发都保持一致

这里我和下面端口号一起演示，只要配置一下`host`即可，一般我们都是不设置就用默认的`localhost`
主要是因为`webpack`最新版本不需要设置`host: '0.0.0.0'`，默认就用`localhost`，这个`0.0.0.0`是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置`'0.0.0.0'`也能在另外一个台电脑上访问】

## port、open、compress配置项
`port`设置监听的端口，默认情况下是`8080`
`open`是否打开浏览器:
  - 默认值是`false`，设置为`true`会打开浏览器;
  - 也可以设置为类似于`Google Chrome`等值;
  - 这个值还可以设置在脚本中，即`"serve": "webpack serve --open"`，当然类似这种参数都会被`webpack-cli`解析为`dev-server`的配置项
`compress`是否为静态文件开启`gzip compression`:
  - 默认值是`false`，可以设置为`true` ;
  - `bundle.js`【我这里是`main.js`】做一个`gzip`压缩【`index.html`没有做压缩】，浏览器请求到后他识别到是`gzip`就会对其解压，把我们解压之后的内容做一个展示，做了这个压缩会让它传输更快一点

回到`webpack.config.js`把以上配置项配置一下：
```js
...
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  ...
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上通过ip来访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
  }, // 注意这个是没有先后顺序，个人习惯写在这里
  ...
}
```

浏览器控制台我们来查看一下是否有做`gzip`压缩：
![gzip压缩](https://s1.ax1x.com/2022/10/25/xWAZxP.png)

## Proxy代理配置项
`proxy`是我们开发中非常常用的一个配置选项，它的目的设置代理来解决跨域访问的问题:
  - 比如我们的一个`api`请求是`http://localhost:8888`，但是本地启动服务器的域名是`http://localhost:8000`，这个时候发送网络请求就会出现跨域的问题;
  - 那么我们可以将请求先发送到一个代理服务器，代理服务器和`API`服务器没有跨域的问题，就可以解决我们的跨域问题了;

跨域：在我们当前页面发送请求`axios`，比如`http://localhost:7777`向`http://localhost:8000`发送请求端口号不一样，肯定会出现跨域，不会响应数据，报错跨域
解决方法：
- 可以把我们当前页面静态资源和`api`服务器部署到一块去，比如都是同一个`tomcat`服务器、`express`服务器、`koa`服务器
- 服务器可能为了安全起见，就不会在同一个服务器，我们后端人员可以设置允许哪些来源跨域访问
- 可以搞个`nginx`代理，我们静态资源或者`api`都是通过这个`nginx`访问，再由`nginx`去访问我们静态资源和`api`
- 以上解决方法都需要后端人员配合的，但在开发阶段，可能后端不会帮我们解决，我们会使用`proxy`

为了方便演示，这里安装一个`axios`库，用它来发请求
```bash
npm install axios -S
```

进入`main.js`中，发请求
```js
...
// 导入axios
import axios from "axios"
...

axios.get("http://localhost:8888/comment").then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})
```

当我们这样去请求，肯定会报跨域错误
```txt
Access to XNLHttpRequest at 'http://localhost:8888/comments' from origin 'http://localhost:7777' has been blocked by CORS policy:No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

配置`proxy`，回到`webpack.config.js`文件中在`devServer`中配置
```js
...
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  ...
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上通过ip来访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    // compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
    proxy: {
      "/api": "http://localhost:8888", // "/api"是个映射，如果现在请求的是/api，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是/api/comments，但是这个字符串写法会有问题
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
  ...
}
```

关于这个`devServer`就是一个本地服务，它就是一个`express`服务器，当服务器向另外一台服务器发送请求是没有跨域问题的，因为跨域问题最主要还是浏览器的一个同源策略限制，等到另外一台服务器把数据给我返回回来，再由我们这个`devServer`的`express`服务器，再返回给我们浏览器
当然这是开发阶段，最终部署阶段肯定还是要和后端开发人员商定的

接着说上面代理，其中`/api`是个映射，如果现在请求的是`/api`，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是`/api/comments`，但是这个字符串写法会有问题
项目运行一下，可以发现浏览器控制台跨域报错已经没有了，但是却发现另外一个报错，资源加载不到当前服务响应是`404`
加载不到的原因是由于这个请求做了代理，我们发请求的地址`/api/comments`会因为映射的原因，最终是会与代理的地址做拼接的，变成`http://localhost:8888/api/comments`，很显然中间多了个`/api`，这个官方文档也有说明，而这个地址最终本地服务器会向这个地址发请求

[proxy配置项官方文档](https://webpack.js.org/configuration/dev-server/#devserverproxy)

![devServerProxy官方文档截图](https://s1.ax1x.com/2022/10/25/xWAmKf.png)

所以在开发中，我们应该像下面这样写，去掉其中的`/api`
```js
proxy: {
  "/api": {
    target: "http://localhost:8888",
    pathRewrite: {
      "^/api": "" // 这个主要是去掉映射时拼接的地址中间多个/api
    },
    secure: false, // 默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
    changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址
  }
} // 配置代理
```

额外补充两个参数：
  - `secure`: false; 默认情况下不接收转发到`https`的服务器上，如果希望支持，可以设置为`false` ;
  - `changeOrigin`: true; 它表示是否更新代理后请求的`headers`中`host`地址【服务器会做校验，请求的源(协议域名端口号)恢复到header中，防止拿的是源代码里的请求地址源，源代码里的请求地址是`http://localhost:7777/api/comments`，本地服务器拿这个地址源肯定会失败，设置为true，更新为代理地址`http://localhost:8888/comments`的源就没问题了，因为服务器地址就是`http://localhost:8888`】，源码它是这样实现的，判断设置为true，直接就拿target放到header中 ;

以上代理就设置成功了，运行一下，数据也能成功接收
这里我说一个细节，做了代理后，我们可以在浏览器控制台看到请求地址`http://localhost:7777/api/comments`，当前页面地址是`http://localhost:7777`，它们都来自于本地服务器，自然没有跨域问题，请求地址实际上是本地服务器帮我们做的拼接


## historyApiFallback配置项
- `historyApiFallback`是开发中一个非常常见的属性，它主要的作用是解决`SPA`页面在路由跳转之后，进行页面刷新时，返回404的错误。
- `boolean`值: 默认是`false`
  - 如果设置为`true`，那么在刷新时，返回404错误时，会自动返回`index.html`的内容;
- `object`类型的值，可以配置`rewrites`属性（了解）∶
  - 可以配置`from`来匹配路径，决定要跳转到哪一个页面;
- 事实上`devServer`中实现`historyApiFallback`功能是通过`connect-history-api-fallback`库的∶
  - 可以查看[connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback/blob/main/README.md)文档

## 以上devServer就差不多结束了

## resolve模块解析
`resolve`用于设置模块如何被解析∶
  - 在开发中我们会有各种各样的模块依赖，这些模块可能来自于自己编写的代码，也可能来自第三方库;
  - `resolve`可以帮助`webpack`从每个`require/import`语句中，找到需要引入到合适的模块代码﹔
  - `webpack`使用`enhanced-resolve`来解析文件路径﹔

`webpack`能解析三种文件路径:
  - 绝对路径: 由于已经获得文件的绝对路径，因此不需要再做进一步解析。
  - 相对路径
    - 在这种情况下，使用`import`或`require`的资源文件所处的目录，被认为是上下文目录
    - 在`import/require`中给定的相对路径，会拼接此上下文路径，来生成模块的绝对路径;
  - 模块路径
    - 在`resolve.modules`中指定的所有目录检索模块;
    - 默认值是`['node_modules']`，所以默认会从`node_modules`中查找文件;
    - 我们可以通过设置别名的方式来替换初识模块路径，具体后面讲解`alias`的配置;

回到webpack.config.js文件配置：注意它与`devServer`同级
```js
  resolve: {
    modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
  }, // 配置模块解析
```

## extensions配置项确定文件还是文件夹
如果是一个文件:
  - 如果文件具有扩展名，则直接打包文件;
  - 否则，将使用`resolve.extensions`选项作为文件扩展名解析;
如果是一个文件夹:
  - 会在文件夹中根据`resolve.mainFiles`配置选项中指定的文件顺序查找;
    - `resolve.mainFiles`的默认值是`['index']`;
    - 再根据`resolve.extensions`来解析扩展名;

之前提到过，在导入时，`js`文件的后缀名是可以不用跟上的，但是`vue`文件的后缀名必须跟上【默认`extensions`数组里面没有`.vue`】，主要是因为`js`文件它会使用使用`resolve.extensions`选项作为文件扩展名解析，`extensions`就是个数组，里面放的是文件扩展名，从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配

回到`webpack.config.js`文件中配置，注意它是`resolve`的属性
```js
  resolve: {
    // modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
    // extensions: [".js", ".json", ".wasm"], // 从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配【我这里写的也是它默认的，不写，它其实就是这个数组】
    extensions: [".js", ".json", ".wasm", ".vue", ".ts", ".jsx", ".tsx"], // 这样导入这些文件时就都不用添加后缀名
  }, // 配置模块解析
```

如果是文件夹时，我们在`src`文件夹下创建一个`util`文件夹，里面创建个`index.js`文件，然后在`main.js`文件中以如下方式导入，不需要跟上`index.js`文件
```js
import "./util"
```

因为`webpack`里面的库它提供一个功能，它会自动的去找我们的`mainFiles`里面，这个我们一般不配置，它已经有个默认值了，它就会找到`index`，然后再根据上面`extensions`，相当于再加上后缀名，即`index.js`

回到`main.js`文件中，把`.vue`后缀名去掉，重新运行一下，浏览器显示正常

## alias配置项起别名
这个依旧是在`resolve`中配置，避免文件层级太深，路径写起来太长
```js
  resolve: {
    // modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
    // extensions: [".js", ".json", ".wasm"], // 从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配【我这里写的也是它默认的，不写，它其实就是这个数组】
    extensions: [".js", ".json", ".wasm", ".vue", ".ts", ".jsx", ".tsx"], // 这样导入这些文件时就都不用添加后缀名
    alias: {
      "@": path.resolve(__dirname, "./src"), // 一般用@来代表src
      "js": path.resolve(__dirname, "./src/js")
    } // 起别名
  }, // 配置模块解析
```

我们可以在`main.js`文件中路径替换一下，运行测试也是没有问题的

## 结语
> 至此，`webpack5`的配置差不多说完了，配置过程中发现了有些地方`webpack5`还是有一点点小的问题，但是它并不影响我们开发项目，个人认为还是比较稳定的！

下一篇应该就是最后一篇了，环境的分离~~~

## webpack-完结篇
> 应该是`webpack5`最后一篇了，主要来说一下环境分离

对于我们的项目，主要被分为开发环境和生产环境，运行我们目前的项目的时候有一个弊端，当我们进行打包【生产环境】时，它会加载`webpack.config.js`文件，但是这个文件里面也有很多时是开发环境的配置，如`mode`为`development`，`devtool`，那么相当于他也会跑一遍，当我们运行本地服【开发环境】时也有一些配置不合适，如清除打包的插件，复制功能插件
所以我们应该对**开发环境**和**生产环境**做一个分离
在项目根目录创建一个`config`文件夹，然后分别创建三个文件夹即：
  - `webpack.dev.config.js`: 开发环境配置文件;
  - `webpack.prod.config.js`: 生产环境配置文件;
  - `webpack.comm.config.js`: 公共配置文件;

回到package.json中，针对不同环境指定不同的配置文件
```json
{
  ...
  "scripts": {
    "build": "webpack --config ./config/webpack.prod.config.js",
    "serve": "webpack serve --config ./config/webpack.dev.config.js"
  },
  ...
}
```

接着就是分离文件内容了，首先我会把原来的`webpack.config.js`文件里的内容复制，粘贴到`webpack.comm.config.js`文件中，注意把所以的功能都先打开，这里我们之前注释的复制功能插件给它取消注释，然后从导出的对象里面开始读，哪些是公共的就留着，不是公共的就剪切掉【注意不是删除啊！！！】，剪切后放到对应环境的配置文件中，注意写个`module.exports = {}`，把它放到要导出的这个对象里面；接着判断另外i一个环境是否需要，需要这个配置项就粘贴到另外一个环境中，更改为该环境的配置即可【不需要就不用粘贴】，注意也要写个`module.exports = {}`，把它放到要导出的这个对象里面。剩下的配置项都是这么一系列操作，最后把这些配置项需要的模块要导入进来。
`webpack.comm.config.js`文件代码如下：
```js
const path = require('path')
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")
// 引入VueLoaderPlugin插件，插件贯穿于整个webpack生命周期，它可以帮助vue-loader做一些事情
const { VueLoaderPlugin } = require("vue-loader/dist/index")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  // watch: true, // 监听源代码是否发生改变，改变就重新进行编译，而不需要再手动打包
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  resolve: {
    // modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
    // extensions: [".js", ".json", ".wasm"], // 从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配【我这里写的也是它默认的，不写，它其实就是这个数组】
    extensions: [".js", ".json", ".wasm", ".vue", ".ts", ".jsx", ".tsx"], // 这样导入这些文件时就都不用添加后缀名
    alias: {
      "@": path.resolve(__dirname, "./src"), // 一般用@来代表src
      "js": path.resolve(__dirname, "./src/js")
    } // 起别名
  }, // 配置模块解析
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
          "css-loader",
          // {
          //   loader: "postcss-loader", // 这个比较特殊，它使用了autoprefixer插件，需要做配置项
          //   options: {
          //     postcssOptions: {
          //       plugins: [
          //         require("autoprefixer")
          //       ]
          //     }
          //   }
          // }
          // postcss-loader简便写法，把options抽离出去
          "postcss-loader"
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
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]" // outputPath可以省略【简写】
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助file-loader】
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "url-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]", // outputPath可以省略【简写】
      //       limit: 100 * 1024 // 这个limit是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助url-loader】
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: 'asset', // 这个其实是我们实际开发中用的最多的
        generator: {
          filename: "img/[name]_[hash:6][ext]" // 注意在这个内置模块里[ext]是包含了.而file-loader和url-loader不包含.
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 这个maxSize是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
          }
        } // 做限制需要在parser里面有个数据url条件，配置最大限制
      }, // 图片资源【webpack5开始内置资源模块】
      // {
      //   test: /\.(eot|ttf|woff2?)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "font/[name]_[hash:6].[ext]" // 注意这里是name，如果写成filename它不会去读文件夹【输出这个文件夹】
      //     }
      //   }
      // }, // 字体资源【webpack5开始内置这个资源模块】
      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name]_[hash:6][ext]', // 注意内置模块得filename里得[ext]包含.
        }
      }, // 字体资源【webpack5开始内置这个资源模块】
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       // plugins: [
      //       //   "@babel/plugin-transform-arrow-functions",
      //       //   "@babel/plugin-transform-block-scoping",
      //       // ]
      //       presets: [
      //         "@babel/preset-env"
      //         // ["@babel/preset-env", {
      //         //   // 配置项
      //         // }] // 这个写法是补充的，因为有可能在其它地方需要传入配置项
      //       ]
      //     }
      //   }
      // }, // 加载js所需要规则【配置项未抽离版】
      {
        test: /\.js$/,
        loader: "babel-loader" // 这里没写use用loader让阅读性更强
      }, // 加载js所需要规则【配置项抽离版】
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
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      title: "巧克力真美味" // 模板里的htmlWebpackPlugin.options.title中的htmlWebpackPlugin是new出来的对象，options就是传入的配置项，title就是我们这里配置的title
    }), // 可以传入一个指定模板【不指定它有个默认模板】
    new DefinePlugin({
      BASE_URL: '"./"',
      __VUE_OPTIONS_API__: true, // 这个就是开启options api，如果都是setup，vue3代码，可以关闭，减小vue源码体积
      __VUE_PROD_DEVTOOLS__: false // 这个默认就是false，可以不用设置，控制调试工具生产环境是否开启【一般不开启】
    }), // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
    new VueLoaderPlugin() // vue-loader插件，帮助vue-loader做一些事情
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

`webpack.dev.config.js`文件代码如下：
```js
module.exports = {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "development", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  // 设置source-map，建立js映射文件，方便调试代码和错误
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上通过ip来访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    // compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
    proxy: {
      // "/api": "http://localhost:8888", // "/api"是个映射，如果现在请求的是/api，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是/api/comments，但是这个字符串写法会有问题【不这样写】
      "/api": {
        target: "http://localhost:8888",
        pathRewrite: {
          "^/api": "" // 这个主要是去掉映射时拼接的地址中间多个/api
        },
        secure: false, // 默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
        changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址
      }
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
}
```

`webpack.prod.config.js`文件代码如下：
```js
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 复制功能copy-webpack-plugin插件
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "production", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
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
  ]
}
```

以上就完成了将一个配置文件分离为三个配置文件，但是我们还得把公共的合并到开发、生产配置文件中
这里我们可以使用`webpack`官方提供的一个合并插件：`webpack-merge`
安装该插件
```bash
npm install webpack-merge -D
```

进入`webpack.dev.config.js`文件中，做合并：
```js
// 注意webpack是运行在node环境下，使用require导入merge函数【commonJS规范】
const { merge } = require("webpack-merge")

// 导入公共配置
const commonConfig = require("./webpack.comm.config")

// 注意使用merge函数合并一下
module.exports = merge(commonConfig, {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "development", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  // 设置source-map，建立js映射文件，方便调试代码和错误
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上通过ip来访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    // compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
    proxy: {
      // "/api": "http://localhost:8888", // "/api"是个映射，如果现在请求的是/api，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是/api/comments，但是这个字符串写法会有问题【不这样写】
      "/api": {
        target: "http://localhost:8888",
        pathRewrite: {
          "^/api": "" // 这个主要是去掉映射时拼接的地址中间多个/api
        },
        secure: false, // 默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
        changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址
      }
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
})
```

进入`webpack.prod.config.js`文件中，做合并：
```js
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 复制功能copy-webpack-plugin插件
const CopyWebpackPlugin = require("copy-webpack-plugin")

// 注意webpack是运行在node环境下，使用require导入merge函数【commonJS规范】
const { merge } = require("webpack-merge")

// 导入公共配置
const commonConfig = require("./webpack.comm.config")

// 注意使用merge函数合并一下
module.exports = merge(commonConfig, {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "production", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
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
  ]
})
```

配置完，然后就是路径问题了，除了`entry`【这个会专门拿出来说一下】、`BASE_URL`、`HtmlWebpackPlugin`模板路径、复制功能插件【这个是赋值】和`static`等几个特殊的路径不用改动，其余基本上，路径都会有所变动

这里关于`entry`，引入一个入口文件解析

## 入口文件解析
我们之前编写入口文件的规则是这样的: `/src/index.js`，但是如果我们的配置文件所在的位置变成了`config`目录，我们是否应该变成`../src/index.js`呢?
  - 如果我们这样编写，会发现是报错的，依然要写成`./src/index.js` ;
  - 这是因为入口文件其实是和另一个属性是有关的`context` ;

`context`的作用是用于解析入口( `entry point` )和加载器( `loader` ) :
  - 官方说法︰ 默认是当前路径（但是经过测试，默认应该是`webpack`的启动目录)
  - 另外推荐在配置中传入一个值;
```js
// context是配置文件所在目录
  module.exports = {
  context: path.resolve(__dirname, "./"),
  entry: "../src/index.js"
}
```

所以说`entry`其实是和webpack启动目录即`package.json`所在目录有关，不需要改动路径

接着重新打包测试，浏览器正常显示
本地服务运行，浏览器也显示正常
> 由于路径改动，这里我也把三个文件路径改动后的配置代码放在下方

## `webpack.comm.config.js`文件代码如下
```js
const path = require('path')
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")
// 引入VueLoaderPlugin插件，插件贯穿于整个webpack生命周期，它可以帮助vue-loader做一些事情
const { VueLoaderPlugin } = require("vue-loader/dist/index")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  // watch: true, // 监听源代码是否发生改变，改变就重新进行编译，而不需要再手动打包
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  resolve: {
    // modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
    // extensions: [".js", ".json", ".wasm"], // 从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配【我这里写的也是它默认的，不写，它其实就是这个数组】
    extensions: [".js", ".json", ".wasm", ".vue", ".ts", ".jsx", ".tsx"], // 这样导入这些文件时就都不用添加后缀名
    alias: {
      "@": path.resolve(__dirname, "../src"), // 一般用@来代表src
      "js": path.resolve(__dirname, "../src/js")
    } // 起别名
  }, // 配置模块解析
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
          "css-loader",
          // {
          //   loader: "postcss-loader", // 这个比较特殊，它使用了autoprefixer插件，需要做配置项
          //   options: {
          //     postcssOptions: {
          //       plugins: [
          //         require("autoprefixer")
          //       ]
          //     }
          //   }
          // }
          // postcss-loader简便写法，把options抽离出去
          "postcss-loader"
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
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]" // outputPath可以省略【简写】
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助file-loader】
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "url-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]", // outputPath可以省略【简写】
      //       limit: 100 * 1024 // 这个limit是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助url-loader】
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: 'asset', // 这个其实是我们实际开发中用的最多的
        generator: {
          filename: "img/[name]_[hash:6][ext]" // 注意在这个内置模块里[ext]是包含了.而file-loader和url-loader不包含.
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 这个maxSize是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
          }
        } // 做限制需要在parser里面有个数据url条件，配置最大限制
      }, // 图片资源【webpack5开始内置资源模块】
      // {
      //   test: /\.(eot|ttf|woff2?)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "font/[name]_[hash:6].[ext]" // 注意这里是name，如果写成filename它不会去读文件夹【输出这个文件夹】
      //     }
      //   }
      // }, // 字体资源【webpack5开始内置这个资源模块】
      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name]_[hash:6][ext]', // 注意内置模块得filename里得[ext]包含.
        }
      }, // 字体资源【webpack5开始内置这个资源模块】
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       // plugins: [
      //       //   "@babel/plugin-transform-arrow-functions",
      //       //   "@babel/plugin-transform-block-scoping",
      //       // ]
      //       presets: [
      //         "@babel/preset-env"
      //         // ["@babel/preset-env", {
      //         //   // 配置项
      //         // }] // 这个写法是补充的，因为有可能在其它地方需要传入配置项
      //       ]
      //     }
      //   }
      // }, // 加载js所需要规则【配置项未抽离版】
      {
        test: /\.js$/,
        loader: "babel-loader" // 这里没写use用loader让阅读性更强
      }, // 加载js所需要规则【配置项抽离版】
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
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      title: "巧克力真美味" // 模板里的htmlWebpackPlugin.options.title中的htmlWebpackPlugin是new出来的对象，options就是传入的配置项，title就是我们这里配置的title
    }), // 可以传入一个指定模板【不指定它有个默认模板】
    new DefinePlugin({
      BASE_URL: '"./"',
      __VUE_OPTIONS_API__: true, // 这个就是开启options api，如果都是setup，vue3代码，可以关闭，减小vue源码体积
      __VUE_PROD_DEVTOOLS__: false // 这个默认就是false，可以不用设置，控制调试工具生产环境是否开启【一般不开启】
    }), // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
    new VueLoaderPlugin() // vue-loader插件，帮助vue-loader做一些事情
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}
```

## `webpack.dev.config.js`文件代码如下
```js
// 注意webpack是运行在node环境下，使用require导入merge函数【commonJS规范】
const { merge } = require("webpack-merge")

// 导入公共配置
const commonConfig = require("./webpack.comm.config")

// 注意使用merge函数合并一下
module.exports = merge(commonConfig, {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "development", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  // 设置source-map，建立js映射文件，方便调试代码和错误
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上通过ip来访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    // compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
    proxy: {
      // "/api": "http://localhost:8888", // "/api"是个映射，如果现在请求的是/api，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是/api/comments，但是这个字符串写法会有问题【不这样写】
      "/api": {
        target: "http://localhost:8888",
        pathRewrite: {
          "^/api": "" // 这个主要是去掉映射时拼接的地址中间多个/api
        },
        secure: false, // 默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
        changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址
      }
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
})
```

## `webpack.prod.config.js`文件代码如下
```js
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 复制功能copy-webpack-plugin插件
const CopyWebpackPlugin = require("copy-webpack-plugin")

// 注意webpack是运行在node环境下，使用require导入merge函数【commonJS规范】
const { merge } = require("webpack-merge")

// 导入公共配置
const commonConfig = require("./webpack.comm.config")

// 注意使用merge函数合并一下
module.exports = merge(commonConfig, {
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "production", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  plugins: [
    new CleanWebpackPlugin(), // 格式：根据CleanWebpackPlugin类创建出对象
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./public", // 从哪个文件夹里复制
          to: "./", // 复制到哪个文件夹【注意它是在打包文件夹基础上，这里也可以不写，默认就是打包文件夹】
          globOptions: {
            ignore: [
              "**/index.html" // 注意这两个**表示当前public文件夹下index.html以及子文件夹下的index.html
            ]
          } // globOptions.ignore忽略某个文件，可以过滤掉某些不需要复制的文件如index.html模板
        }
      ] // patterns匹配的意思
    }), // 复制功能插件
  ]
})
```

## 结语
> 至此，`webpack5`告一段落了❤
