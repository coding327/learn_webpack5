const path = require('path')
// 我们需要从clean-webpack-plugin插件中取出CleanWebpackPlugin类，因为插件一般给它封装成class
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// 这个HtmlWebpackPlugin插件不需要做解构，因为它导出的就是一个类，不同的插件有不同的封装方式，而且这种第三方的很难统一规范的
const HtmlWebpackPlugin = require("html-webpack-plugin")
// `DefinePlugin`插件，这个插件是`webpack`内置的一个插件
const { DefinePlugin } = require("webpack")
// 复制功能copy-webpack-plugin插件
const CopyWebpackPlugin = require("copy-webpack-plugin")
// 引入VueLoaderPlugin插件，插件贯穿于整个webpack生命周期，它可以帮助vue-loader做一些事情
const { VueLoaderPlugin } = require("vue-loader/dist/index")

// webpack是运行在node环境下的，不要使用ES6 module导出【如果非要使用它还需要做额外配置】
// 注意出口文件中的path得是绝对路径，需要使用到path模块，做路径拼接即可，__dirname就是当前编写代码文件所在目录【绝对路径】
module.exports = {
  target: "web", // 如果是为node环境打包的就写上node,一般是为web环境打包，因为我们项目代码跑在web环境下面【与热替换搭配使用才能保证热替换没有任何问题，万无一失】
  // 设置模式
  // development 开发阶段，会设置development
  // production 准备打包上线的时候，设置production
  mode: "development", // 开发模式，我们可以看到打包的js文件里有很多eval函数，这是因为devtool默认为eval
  // 设置source-map，建立js映射文件，方便调试代码和错误
  devtool: "source-map", // 默认为eval包裹着源代码，一般我们是设置为source-map，作用是在生成打包文件时，它也会生成source-map文件，再次打包发现项目根目录多了个main.js.map文件，它其实就是个映射文件，它可以把打包的js文件映射到真实开发环境的源代码里面
  // watch: true, // 监听源代码是否发生改变，改变就重新进行编译，而不需要再手动打包
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, './build/'),
    filename: "js/main.js",
    // assetModuleFilename: 'img/[name]_[hash:6][ext][query]', // webpack5最新自定义文件名，generator.filename优先级比它高
  },
  devServer: {
    static: "./public", // 【这个一般都是public】之前public文件夹里的内容用了复制插件，复制到打包文件夹下的，但是一般在开发环境我们不使用这个复制插件，每次复制很费性能，但这样其中文件就无法访问到，而这里指定的public到时候服务访问不到某些文件就会访问这个文件夹里的内容
    hot: true, // 开启模块热替换【注意要与target搭配才是最好的，不然只开启会有点问题，target一般我习惯放在最上面】
    // host: '0.0.0.0', // webpack最新版本不需要设置host: '0.0.0.0'，默认就用localhost，这个0.0.0.0是在同一个网段下，另外一台电脑也能访问我们应用【我使用时测试了一下，不设置'0.0.0.0'也能在另外一个台电脑上访问，一般不需要配置】
    port: 7777, // 端口号，某些情况下可能出现端口号会被占用，那么可以配置其它的端口号
    open: true, // 默认打开浏览器，也可以设置为类似于`Google Chrome`等值
    // compress: true, // 默认值是false，gzip压缩，能够提高传输速度【一般不用配置，因为我们本地访问，还要压缩成本】
    proxy: {
      // "/api": "http://localhost:8888", // "/api"是个映射，如果现在请求的是/api，到时候可以代理到配置的这个地址，这也是为什么我们在发请求时里面请求地址是/api/comments，值是API服务器地址【但是这个字符串写法会有问题】
      "/api": {
        target: "http://localhost:8888", // API服务器地址
        pathRewrite: {
          "^/api": "" // 这个主要是去掉映射时拼接的地址中间多个/api
        },
        secure: false, // 默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
        changeOrigin: true, // 它表示是否更新代理后请求的headers中host地址为target【在vue-cli3中默认为true，vue-cli2默认为false，Request Headers中查看host，浏览器他不会直观给你看，始终都是本地服务的host，但其实设置生效了，在后端request.getHeader("Host")可以获取到】
      }
    } // 配置代理
  }, // 注意这个是没有先后顺序，个人习惯写在这里
  resolve: {
    // modules: ["node_modules"], // 像vue它就会从这里面找【当然这个node_modules就是默认的，我们不需要设置】
    // extensions: [".js", ".json", ".wasm"], // 从里面取出后缀名再和导入文件拼接，如果能匹配对应的文件就直接加载了，没有匹配到就把下一个后缀名加上去再匹配【我这里写的也是它默认的，不写，它其实就是这个数组】
    extensions: [".js", ".json", ".wasm", ".vue", ".ts", ".jsx", ".tsx"], // 这样导入这些文件时就都不用添加后缀名
    alias: {
      "@": path.resolve(__dirname, "./src"), // 一般用@来代表src
      "js": path.resolve(__dirname, "./src/js")
    } // 起别名
  }, // 配置模块解析
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
      {
        test: /\.vue$/,
        loader: "vue-loader"
      }, // 加载vue所需规则
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
      BASE_URL: '"./"',
      __VUE_OPTIONS_API__: true, // 这个就是开启options api，如果都是setup，vue3代码，可以关闭，减小vue源码体积
      __VUE_PROD_DEVTOOLS__: false // 这个默认就是false，可以不用设置，控制调试工具生产环境是否开启【一般不开启】
    }), // 定义BASE_URL的值，注意这个引号里还要再加个引号，有点类似eval，会把引号里面内容当js语法解析
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: "public", // 从哪个文件夹里复制
    //       to: "./", // 复制到哪个文件夹【注意它是在打包文件夹基础上，这里也可以不写，默认就是打包文件夹】
    //       globOptions: {
    //         ignore: [
    //           "**/index.html" // 注意这两个**表示当前public文件夹下index.html以及子文件夹下的index.html
    //         ]
    //       } // globOptions.ignore忽略某个文件，可以过滤掉某些不需要复制的文件如index.html模板
    //     }
    //   ] // patterns匹配的意思
    // }), // 复制功能插件
    new VueLoaderPlugin() // vue-loader插件，帮助vue-loader做一些事情
  ] // plugins是个数组【这个不用管顺序】，里面放的是一个个插件对象【其实它源码里面是拿到我们导出的这个大的对象，然后去取到我们所有的plugins，之后对它做了个for循环，for循环后对它做个注入，到时候就可以根据不同的hook的生命周期来回调这个插件里面对象的某个方法】
}