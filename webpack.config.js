var path = require('path');
var webpack = require('webpack');
var commonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var providePlugin = webpack.ProvidePlugin;
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
    entry: {
        'app': './src/client/main.ts',
        'vendor': './src/client/vendor.ts'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist/client')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                use: "source-map-loader"
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: './src/client/tsconfig.json'
                        }
                    },
                    {
                        loader: 'angular-router-loader'
                    },
                    {
                        loader: 'angular2-template-loader'
                        // options: {
                        //     keepUrl: true
                        // }
                    },
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: ['raw-loader', 'sass-loader']
            },
            { 
                test: /\.(html|css)$/, 
                loader: 'raw-loader'
            },
        ]
    },
    plugins: [
        new providePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
            'window.jquery': 'jquery',
            Tether: 'tether',
            'window.Tether': 'tether',
        }),
        new commonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new uglifyJsPlugin()
    ]
};
