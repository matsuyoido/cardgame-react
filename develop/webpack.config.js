
// const webpack = require('webpack');
// const saveLicense = require('uglify-save-license');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = (env, argv) => {
const isDev = (argv.mode === 'development');

return isDev ?
  {
	mode: 'development',
	devtool: "source-map",

	entry: {
		"test": "./src/main/js/main.tsx"
		// render: "./src/main/js/render.tsx",
		// card: "./src/main/js/component/card.ts",
		// deck: "./src/main/js/component/deck.ts",
		// player: "./src/main/js/component/player.ts",
	},

	plugins: [
		new HtmlWebpackPlugin({
			inlineSource: '.(js|css)$',
			template: "./src/main/index.html",
			minify: false,
		}),
		new ScriptExtHtmlWebpackPlugin({
			inline: [
				// entry の名前を選択
				'test'
			]
		})
	],
	module: {
		rules: [
		{
			test: /\.tsx?$/,
			use: [
				// ts-loader ⇒ babel-loader の下から順に実行
				{
					loader: 'babel-loader'
				},
				{
					loader: 'ts-loader',
					options: {
						// configFile: "./tsconfig.json"
					}
				}
			],
			exclude: /node_modules/
		},
		{
			test: /\.s[ca]ss$/,
			use: [
			  "style-loader", // creates style nodes from JS strings
			  {
				loader: "css-loader", // translates CSS into
				options: {
					esModule: true,
					modules: {
						exportLocalsConvention: 'dashesOnly'
					}
				}
			  },
			  "postcss-loader", // Autoprefixer
			  "sass-loader" // compiles Sass to CSS, using Node Sass by default
			],
		  }
		],
	},
	resolve: {
		extensions: [ '.ts', '.js', '.tsx', '.jsx' ]
	},

	output: {
		filename: "[name].js"
	}
  }
  :
  {
	mode: 'production',

	entry: {
		main: "./src/main/js/main.tsx"
	},

	//plugins: [
	//	new webpack..optimize.UglifyJsPlugin({
	//		sourceMap: false,
	//	})
	//],
	module: {
		rules: [
		{
			test: /\.tsx?$/,
			use: [
				{
					loader: 'babel-loader'
				},
				{
					loader: 'ts-loader',
					options: {
						configFile: "./tsconfig.json"
					}
				}
			],
			exclude: [/node_modules/],
		}
		],
	},
	resolve: {
		extensions: [ '.ts', '.js', '.tsx', '.jsx' ]
	},

	output: {
		path: path.resolve(__dirname, "./../public/"),
		filename: "react-app.js"
	}
  }
;

};