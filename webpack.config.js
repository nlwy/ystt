/*
 * @Author: nlwy
 * @Date:   2017-04-07 12:41:29
 * @Last Modified by:   nlwy
 * @Last Modified time: 2017-04-12 18:17:39
 */
'use strict';
const path = require('path'),
	precss = require('precss'),
	webpack = require('webpack'),
	autoprefixer = require('autoprefixer'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	OpenBrowserPlugin = require('open-browser-webpack-plugin');
/**
 * [vendors 需要单独打包的库]
 * @type {Array}
 */
const vendors = [
		'./app/lib/js/zepto.js', //zepto库
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
		// new HtmlWebpackPlugin({
		// 	template: path.resolve(__dirname, "app/index.tmpl.html"), //new 一个这个插件的实例，并传入相关的参数
		// }),
		new HtmlWebpackPlugin({
			// 输出的文件名称 默认index.html 可以带有子目录
			filename: './index.html',
			// 源文件
			template: path.resolve(__dirname, "app/index.tmpl.html"),
			// 注入资源
			inject: true,
			chunks: ['index','vendors','manifest'] //指定chunks 为 index 的js
		}),
		//第三方库单独打包
		new webpack.optimize.CommonsChunkPlugin({
			names: ['vendors', 'manifest'],
			minChunks: Infinity
		}),
		//单独抽出css
		new ExtractTextPlugin("[name].[hash:8].css?[contenthash:8]"),
		new OpenBrowserPlugin({ //自动打开浏览器
			url: 'http://localhost:8080'
		}),
		new webpack.HotModuleReplacementPlugin(), //全局热加载插件
		new webpack.LoaderOptionsPlugin({
			options: {
				htmlLoader: {
					ignoreCustomFragments: [/\{\{.*?}}/],
					root: path.resolve(__dirname, 'build'),
					attrs: ['img:src', 'link:href', 'img:data-src']
				}
			}
		})
	]
	/**
	 * [loaders css加载器]
	 * @type {Array}
	 */
const loaders = [{
		loader: 'css-loader',
		options: {
			sourceMap: true
		}
	}, {
		loader: 'postcss-loader',
		options: {
			plugins: () => {
				return [precss, autoprefixer];
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
			test: require.resolve('./app/lib/js/zepto.js'),
			use: "imports-loader?this=>window"
		}, {
			test: /\.scss|.css$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: loaders
			}),
		}, {
			test: /\.ttf|.eot|.woff|.svg/,
			use: 'url-loader?limit=1024&name=[name].[hash:8].[ext]'
		}, {
			test: /\.(png|jpg|gif)$/,
			use: 'file-loader?url-loader!limit=1024&name=[name].[hash:8].[ext]'
		}, {
			test: /\.html$/,
			use: 'html-loader'
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
		filename: "[name].[hash:8].js",
		chunkFilename: "[name].[chunkHash:8].js",
	},
	//用到的插件
	plugins: plugins,
	//用到的loader
	module: modules,
	/**
	 * [devServer 本地服务器配置]
	 * @type {Object}
	 */
	devServer: {
		contentBase: path.join(__dirname, "build"), //本地服务器所加载的页面所在的目录
		port: 8080, //设置默认监听端口，如果省略，默认为”8080“
		compress: true,
		historyApiFallback: true, //不跳转
		inline: true, //实时刷新
		host: "0.0.0.0" //开启ip地址访问
	}
};

module.exports = config;