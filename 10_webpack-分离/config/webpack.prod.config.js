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