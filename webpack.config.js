const path = require('path');

module.exports = {
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'HandshakeJS.js',
        library: {
            name: 'HandshakeJS',
            type: 'umd',
        },
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            { test: /\.json$/, type: 'json' },
        ],
    },
};
