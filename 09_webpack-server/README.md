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