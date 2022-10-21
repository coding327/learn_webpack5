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