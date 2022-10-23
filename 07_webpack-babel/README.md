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
