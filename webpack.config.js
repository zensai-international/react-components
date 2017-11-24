var path = require('path');
var webpack = require('webpack');

var DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, '.'),
    entry: {
        'index': ['./src/index'],
        'index.tests': ['./tests/index']
    },
    externals: {
        'react': {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react',
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom',
        }
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
            'react$': path.resolve(__dirname, './node_modules/react/dist/react-with-addons'),
            'react-dom$': path.resolve(__dirname, './node_modules/react-dom/dist/react-dom'),
            'react-addons-test-utils$': path.resolve(__dirname, './node_modules/react-addons-test-utils/index'),
            'sinon': 'sinon/pkg/sinon',
            'url': path.resolve(__dirname, './node_modules/url/url'),
        },
        extensions: ['.js', '.json', '.ts', '.tsx']
    }
}