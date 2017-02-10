var path = require('path');

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
    module: {
        rules: [
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
};
