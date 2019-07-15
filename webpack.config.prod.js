const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (environment, options) => {
    const mode = options.mode;

    return {
        devtool: false,
        context: path.resolve(__dirname, '.'),
        entry: {
            'index': ['./src/index']
        },
        externals: {
            'jsdom': 'window',
            'cheerio': 'window',
            'prop-types': true,
            'react': true,
            'react-dom': true,
            'react/lib/ExecutionEnvironment': true,
            'react/addons': true,
            'react/lib/ReactContext': 'window',
            'url': true,
        },
        module: {
            rules: [
                {
                    loader: 'ts-loader',
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
            new CleanWebpackPlugin('dist/*'),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode)
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new ForkTsCheckerWebpackPlugin()
        ],
        resolve: {
            extensions: ['.js', '.json', '.ts', '.tsx']
        }
    }
};