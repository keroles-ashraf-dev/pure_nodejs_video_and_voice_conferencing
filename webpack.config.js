const path = require('path');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, 'dist/public/asset/index.js'),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public/asset'),
    },
};