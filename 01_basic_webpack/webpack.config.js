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