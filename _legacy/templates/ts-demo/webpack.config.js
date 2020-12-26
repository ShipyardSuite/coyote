const path = require('path');

module.exports =
{
    entry: '{{entry-path}}',
    devtool: '{{dev-tool}}',
    module:
    {
        rules:
        [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve:
    {
        extensions:
        [
            {{extensions}}
        ]
    },
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}