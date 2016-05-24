module.exports = {
    entry: './src/main.ts',
    output: {
        path: "dist",
        filename: 'plekryption.js',
        chunkFilename: '[id].bundle.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js' , '.json']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.json$/, loader: 'json' }
        ]
    }
}
