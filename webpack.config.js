const path = require('path');
//var fs = require('fs');
  
module.exports = (env, argv) => {
	return {
		mode: 'production',
		entry: {
			index: path.join(__dirname, 'src', 'index2.ts'),
        },
        //target: 'node',  //fs対応。この行を挿入するだけで、ブラウザにレンダリングが行われない

		output: {
			path: path.join(__dirname, 'www'),
			filename: 'test_npm.js',
			library: 'test_npm',
			libraryTarget: 'umd'
		},

		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [{ loader: 'ts-loader' }]
				}
			]
		},
		devServer: {
			contentBase: 'www',
			port: 8080
		},
		resolve: {
			extensions: ['.ts', '.js'],
			modules: [
				"node_modules"
			]
        },
        //node: {
        //    fs: 'empty'
        //}
	}
}
