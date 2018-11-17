const webpack = require("webpack")

const devMode = process.argv.indexOf('--production') === -1
const {env} = process

env.NODE_ENV = devMode ? 'development' : 'production'

module.exports = {
  entry: {
    main: "./index.ts"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
    publicPath: "/dist/"
  },
  mode: devMode ?  'development' : 'production',
  devtool: devMode ? 'source-map' : false,
  watch: devMode,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [     
      {
        test: /\.(eot|woff|woff2|ttf|gif|svg|png|jpg)$/,
        loader: {
          loader: 'file-loader',
          options: {
            regExp: /([a-z0-9]+)\/([a-z0-9\-\_]+)\/[a-z0-9\-\_]+\.[a-z]+$/i,
            name: `[2]/[1]/[name].[ext]`
          }
        }
      },    
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',/**/ 
          /*MiniCssExtractPlugin.loader,/**/ 
          "css-loader", 
          "sass-loader?outputStyle=compressed"
        ]
      }
    ]
  },
  externals: {
    // "react": "React",
    // "react-dom": "ReactDOM",
    // "socket.io-client": "io"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env.NODE_ENV),
        'USER': JSON.stringify(env.USER),
        'TERM_PROGRAM': JSON.stringify(env.TERM_PROGRAM),
        'TERM_PROGRAM_VERSION': JSON.stringify(env.TERM_PROGRAM_VERSION),
        'GDM_LANG': JSON.stringify(env.GDM_LANG)
      }
    })
  ],
};
