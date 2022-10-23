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
