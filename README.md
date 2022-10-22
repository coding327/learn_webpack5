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
但是有个弊端，每次写插件过于麻烦，我们可以使用预设`preset``
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






















