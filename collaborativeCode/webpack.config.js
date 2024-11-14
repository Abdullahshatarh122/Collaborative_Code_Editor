// collaborative-editor/webpack.config.js

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
        projects: './src/project_panel.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../src/main/resources/static/collaborative-editor'),
        publicPath: '/collaborative-editor/',
    },
    resolve: {
        extensions: ['.js'],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MonacoWebpackPlugin({
            languages: ['java', 'python'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new HtmlWebpackPlugin({
            template: './src/login.html',
            filename: 'login.html',
        }),

    ],
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
        historyApiFallback: true,
    },
};
