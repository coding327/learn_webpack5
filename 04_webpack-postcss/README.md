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

## 插件autoprefixer
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
