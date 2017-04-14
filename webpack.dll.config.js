/*
 * @Author: nlwy
 * @Date:   2017-03-28 11:26:30
 * @Last Modified by:   nlwy
 * @Last Modified time: 2017-03-28 11:42:24
 */

'use strict';
var webpack = require('webpack');
var venders = [
	'./app/lib/js/zepto.min.js'
];
module.exports = {
	output: {
		path: __dirname + '/build',
		filename: "js/[name].[hash:8].js",
		library: 'js/[name].[hash:8]'
	},
	entry: {
		vendor: venders,
	},
	plugins: [
		new webpack.DllPlugin({
			path: 'manifest.json',
			name: '[name].[chunkhash:8]',
			context: __dirname,
		}),
	]
};