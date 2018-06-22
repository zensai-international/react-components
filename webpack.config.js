var path = require('path');
var webpack = require('webpack');

var DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, '.'),
    entry: {
        'index': ['./src/index'],
        'examples/grid': ['./examples/grid'],
        'index.tests': ['./tests/index']
    },
    externals: {
        'jsdom': 'window',
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/addons': true,
        'react/lib/ReactContext': 'window'
    },
    module: {
        rules: [
            {
                loader: 'ts-loader',
                // options: {
                //     transpileOnly: true
                // },
                test: /\.tsx?$/
            }
        ]
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, './dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify('production')
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new ForkTsCheckerWebpackPlugin()
    ],
    resolve: {
        alias: {
            'react-addons-test-utils$': path.resolve(__dirname, './node_modules/react-dom/test-utils'),
            'sinon': 'sinon/pkg/sinon',
            'url': path.resolve(__dirname, './node_modules/url/url'),
        },
        extensions: ['.js', '.json', '.ts', '.tsx']
    }
}