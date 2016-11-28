var webpack = require('webpack');

module.exports = {
	entry: {
		scrollMonitor: __dirname + '/index.js',
	},
	output: {
		filename: '[name].js',
		libraryTarget: 'umd',
		library: 'scrollMonitor',
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015', 'stage-0'],
				plugins: ['transform-object-assign']
			}
		}]
	},
	devtool: '#sourcemap',
};
