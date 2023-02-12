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
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上访问，一般不需要配置】
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
        changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址为target【在vue-cli3中默认为true，vue-cli2默认为false，Request Headers中查看host，浏览器他不会直观给你看，始终都是本地服务的host，但其实设置生效了，在后端request.getHeader("Host")可以获取到】
      }
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
})