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
				presets: [['es2015', {loose: true}], 'stage-0'],
				plugins: ['transform-es3-member-expression-literals', 'transform-es3-property-literals', 'transform-object-assign']
			}
		}]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin()
	],
	devtool: '#sourcemap',
};
