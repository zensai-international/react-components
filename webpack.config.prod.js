var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: './index',
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
        loaders: [
            { loader: 'ts-loader', test: /\.tsx?$/ }
        ]
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'umd',
        path: './dist'
    },
    plugins: [
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify('production')
        }),
        new webpack.NoErrorsPlugin(),
        /*new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()*/],
    resolve: {
        alias: {
            'react$': path.resolve(__dirname, './node_modules/react/dist/react-with-addons'),
            'react-dom$': path.resolve(__dirname, './node_modules/react-dom/dist/react-dom'),
            'react-addons-test-utils$': path.resolve(__dirname, './node_modules/react-addons-test-utils/index'),
            'sinon': 'sinon/pkg/sinon'
        },
        extensions: ['', '.js', '.json', '.ts', '.tsx']
    },
    resolveLoader: {
        modulesDirectories: ['./node_modules']
    },
    ts: {
        'compilerOptions': {
            'declaration': true,
            'outDir': 'types'
        }
    }
}