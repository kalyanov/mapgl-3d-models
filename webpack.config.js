const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = (env) => {
    const mode = env.production ? 'production' : 'development';

    return {
        mode,

        module: {
            rules: [
                {
                    test: /(\.ts|\.tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                },
            ],
        },

        resolve: {
            extensions: ['.ts', '.js'],
        },

        entry: {
            cayan: './src/cayan.ts',
        },

        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/dist',
        },

        plugins: [new ForkTsCheckerWebpackPlugin()],

        devtool: mode === 'production' ? false : 'source-map',

        devServer: {
            host: 'localhost',
            port: 3000,
            stats: {
                modules: false,
            },
            disableHostCheck: true,
            publicPath: '/dist',
        },
    };
};
