const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [ 'file-loader' ]
            },
            {
                test: /\.(glsl|vertex|fragment|vs|fs)$/,
                use: 'ts-shader-loader'
            },
            {
                test: /\.wasm$/,
                loader: 'file-loader',
                type: 'javascript/auto',
                options: {
                    publicPath: 'dist/'
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-env' ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.js', '.ts', '.tsx' ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'WebGL Fluid Simulation',
            template: 'src/index.html'
        })
    ],
    optimization: {
        usedExports: true
    },
    devServer: {
        port: 4000,
        compress: true
    },
    target: 'web',
    node: {
        __dirname: false,
        fs: 'empty',
        Buffer: false,
        process: false
    }
};
