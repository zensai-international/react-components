var path = require('path');
var webpack = require('webpack');

var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    cache: true,
    entry: {
        'examples/grid': ['./examples/grid'],
        'tests/components/grid': ['./tests/components/grid'],
        'tests/infrastructure/expressions/expression-converter': ['./tests/infrastructure/expressions/expression-converter'],
        'tests/infrastructure/css-class-name-builder': ['./tests/infrastructure/css-class-name-builder'],
        'tests/infrastructure/css-class-name-generator': ['./tests/infrastructure/css-class-name-generator'],
        'tests/infrastructure/comparer': ['./tests/infrastructure/comparer'],
        'tests/infrastructure/data/data-source': ['./tests/infrastructure/data/data-source'],
        'tests/infrastructure/data/data-source-pager': ['./tests/infrastructure/data/data-source-pager'],
        'tests/infrastructure/uri': ['./tests/infrastructure/uri']
    },
    module: {
        rules: [
            {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                },
                test: /\.tsx?$/
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify('production')
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require("./dist/vendors-manifest.json")
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
    resolve: {
        alias: {
            'react$': path.resolve(__dirname, './node_modules/react/dist/react-with-addons'),
            'react-dom$': path.resolve(__dirname, './node_modules/react-dom/dist/react-dom'),
            'react-addons-test-utils$': path.resolve(__dirname, './node_modules/react-addons-test-utils/index'),
            'sinon': 'sinon/pkg/sinon'
        },
        extensions: ['.js', '.json', '.ts', '.tsx']
    }
}