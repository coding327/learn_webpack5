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
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]" // outputPath可以省略【简写】
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助file-loader】
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/,
      //   use: {
      //     loader: "url-loader",
      //     options: {
      //       // outputPath: "img", // 输出目录
      //       // name: "[name]_[hash:6].[ext]" // 注意这里不能写死，需要了解下placeholders就懂了，[name]是文件原来的文件名，中间下划线换成短横线都行，主要是方便划分前面name和后面hash，而这个hash值是为了保证图片不会重复同时截取hash值的前6位，[ext]表示原来文件扩展名【后缀名】，补充一个[folder]表示所在的原来的文件夹
      //       name: "img/[name]_[hash:6].[ext]", // outputPath可以省略【简写】
      //       limit: 100 * 1024 // 这个limit是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
      //     }
      //   }
      // }, // 图片资源【webpack5之前借助url-loader】
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: 'asset', // 这个其实是我们实际开发中用的最多的
        generator: {
          filename: "img/[name]_[hash:6][ext]" // 注意在这个内置模块里[ext]是包含了.而file-loader和url-loader不包含.
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 这个maxSize是以字节为单位，这里我写的就是100KB，小于100KB就做base64编码，大于它的就不做base64编码，直接打包
          }
        } // 做限制需要在parser里面有个数据url条件，配置最大限制
      }, // 图片资源【webpack5开始内置资源模块】
      // {
      //   test: /\.(eot|ttf|woff2?)$/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       name: "font/[name]_[hash:6].[ext]" // 注意这里是name，如果写成filename它不会去读文件夹【输出这个文件夹】
      //     }
      //   }
      // }, // 字体资源【webpack5开始内置这个资源模块】
      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name]_[hash:6][ext]', // 注意内置模块得filename里得[ext]包含.
        }
      }, // 字体资源【webpack5开始内置这个资源模块】
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: "babel-loader",
      //     options: {
      //       // plugins: [
      //       //   "@babel/plugin-transform-arrow-functions",
      //       //   "@babel/plugin-transform-block-scoping",
      //       // ]
      //       presets: [
      //         "@babel/preset-env"
      //         // ["@babel/preset-env", {
      //         //   // 配置项
      //         // }] // 这个写法是补充的，因为有可能在其它地方需要传入配置项
      //       ]
      //     }
      //   }
      // }, // 加载js所需要规则【配置项未抽离版】
      {
        test: /\.js$/,
        loader: "babel-loader" // 这里没写use用loader让阅读性更强
      }, // 加载js所需要规则【配置项抽离版】
      {}, // 加载ts需要规则
      // {
      //   test: /\.(css|less)$/,
      //   use: [
      //     "style-loader",
      //     "css-loader",
      //     "less-loader"
      //   ]
      // }, // css、less合并写法
    ]
  },
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