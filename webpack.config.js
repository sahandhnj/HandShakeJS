module.exports = {
    entry: './src/main',
    output: {
        path: "dist",
        filename: 'plekryption.js',
        libraryTarget:  'var',
        library: "Plekryption"
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
