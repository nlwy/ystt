/*
 * @Author: nlwy
 * @Date:   2017-04-07 12:41:29
 * @Last Modified by:   nlwy
 * @Last Modified time: 2017-04-11 11:36:42
 */
'use strict';
const path = require('path'),
	precss = require('precss'),
	cssnano = require('cssnano'),
	webpack = require('webpack'),
	autoprefixer = require('autoprefixer'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	ImageminPlugin = require('imagemin-webpack-plugin').default,
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');
/**
 * [vendors 需要单独打包的库]
 * @type {Array}
 */
const vendors = [
		'./app/lib/js/zepto.min.js', //zepto库
		'./app/lib/js/zepto.plug.js', //zepto扩展库
		'./app/lib/js/ystt.js', //养生头条公共库
		'fastclick', //fastclick库 用来解决click 300ms延迟问题
	]
	/**
	 * [plugins 需要用到的插件集合]
	 * @type {Array}
	 */
const plugins = [
		//使用html模板
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "app/index.tmpl.html"), //new 一个这个插件的实例，并传入相关的参数
			//压缩html
			minify: {
				collapseWhitespace: true,
				collapseInlineTagWhitespace: true,
				removeRedundantAttributes: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeComments: true
			}
		}),
		/**
		 * [output 压缩生成的代码包括css和js]
		 * @type {Object}
		 */
		new webpack.optimize.UglifyJsPlugin({
			// 最紧凑的输出
			beautify: false,
			// 删除所有的注释
			comments: false,
			compress: {
				// 在UglifyJs删除没有用到的代码时不输出警告
				warnings: false,
				// 删除所有的 `console` 语句
				// 还可以兼容ie浏览器
				drop_console: true,
				// 内嵌定义了但是只用到一次的变量
				collapse_vars: true,
				// 提取出出现多次但是没有定义成变量去引用的静态值
				reduce_vars: true
			}
		}),
		/**
		 * [NODE_ENV 开发模式]
		 * @type {[type]}
		 */
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV)
			}
		}),
		/**
		 * [verbose 清理编译后的文件不叠加生成]
		 * @type {[type]}
		 */
		new CleanWebpackPlugin(
			['build'], {
				verbose: true
			}
		),
		//第三方库单独打包
		new webpack.optimize.CommonsChunkPlugin({
			names: ['vendors', 'manifest'],
			minChunks: Infinity
		}),
		new webpack.optimize.AggressiveMergingPlugin(), //合并相似chunk
		new webpack.optimize.OccurrenceOrderPlugin(), //为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
		new webpack.NoEmitOnErrorsPlugin(), //保证编译不能出错
		//单独抽出css
		new ExtractTextPlugin("css/[name].[hash:8].css?[contenthash:8]"),
		new webpack.LoaderOptionsPlugin({
			options: {
				htmlLoader: {
					ignoreCustomFragments: [/\{\{.*?}}/],
					root: path.resolve(__dirname, 'build'),
					attrs: ['img:src', 'link:href', 'img:data-src']
				}
			}
		}),
		//压缩图片
		new ImageminPlugin({ test: 'images/**' })
	]
	/**
	 * [loaders css加载器]
	 * @type {Array}
	 */
const loaders = [{
		loader: 'css-loader'
	}, {
		loader: 'postcss-loader',
		options: {
			plugins: () => {
				return [precss, cssnano, autoprefixer];
			}
		}
	}, {
		loader: 'sass-loader'
	}]
	/**
	 * [modules 加载器模块配置]
	 * @type {Object}
	 */
const modules = {
		rules: [{
			test: require.resolve('./app/lib/js/zepto.min.js'),
			use: "imports-loader?this=>window"
		}, {
			test: /\.scss|.css$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: loaders,
				publicPath: '../'
			}),
		}, {
			test: /\.ttf|.eot|.woff|.svg/,
			use: 'url-loader?limit=8192&name=fonts/[name].[hash:8].[ext]'
		}, {
			test: /\.(png|jpg|gif)$/,
			use: 'file-loader?limit=8192&name=images/[name].[hash:8].[ext]'
		}, {
			test: /\.html$/,
			use: [{
				loader: "html-loader",
				options: {
					minimize: true,
					removeComments: false,
					collapseWhitespace: false
				}
			}]
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			use: 'babel-loader'
		}]
	}
	/**
	 * [config webpack核心配置]
	 * @type {Object}
	 */
const config = {
	//入口
	entry: {
		index: path.resolve(__dirname, 'app/main.js'),
		vendors: vendors
	},
	//输出路径
	output: {
		path: path.resolve(__dirname, "build"),
		publicPath: '',
		filename: "js/[name].[hash:8].js",
		chunkFilename: "[name].[chunkHash:8].js",
	},
	//用到的插件
	plugins: plugins,
	//用到的loader
	module: modules
};

module.exports = config;