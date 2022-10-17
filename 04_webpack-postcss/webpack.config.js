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
      {}, // 加载js以后可能也需要规则
      {}, // 加载ts需要规则
      // {
      //   test: /\.(css|less)$/,
      //   use: [
      //     "style-loader",
      //     "css-loader",
      //     "less-loader"
      //   ]
      // }, // 合并写法
    ]
  }
}