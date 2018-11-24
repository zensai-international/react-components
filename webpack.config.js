const path = require('path');
const webpack = require('webpack');

const BundleVisualizer = require('webpack-visualizer-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (environment, options) => {
    const mode = options.mode;
    const isProductionMode = options.mode == 'production';

    return {
        context: path.resolve(__dirname, '.'),
        entry: isProductionMode
            ? {
                'index': ['./src/index']
            }
            : {
                'examples/grid': ['./examples/grid'],
                'index.tests': ['./tests/index']
            },
        externals: isProductionMode
            ? {
                'jsdom': 'window',
                'cheerio': 'window',
                'prop-types': true,
                'react': true,
                'react-dom': true,
                'react/lib/ExecutionEnvironment': true,
                'react/addons': true,
                'react/lib/ReactContext': 'window',
                'url': true,
            }
            : {
                'jsdom': 'window',
                'cheerio': 'window',
                'react/lib/ReactContext': 'window',
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
                'NODE_ENV': JSON.stringify(mode)
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new ForkTsCheckerWebpackPlugin(),
            ...(isProductionMode ? [] : [new BundleVisualizer({ filename: './bundle-report.html' })])
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
};