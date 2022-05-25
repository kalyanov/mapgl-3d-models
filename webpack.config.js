const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

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
                    },
                },
            ],
        },

        resolve: {
            extensions: ['.ts', '.js'],
        },

        entry: {
            cayan: './src/cayan.ts',
            dubaiMunicipality: './src/dubaiMunicipality.ts',
            dubaiMunicipalitySliced: './src/dubaiMunicipalitySliced.ts',
            dubaiMunicipalitySliced2: './src/dubaiMunicipalitySliced2.ts',
        },

        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'public'),
        },

        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new CopyPlugin({ patterns: ['static'] })
        ],

        devtool: mode === 'development' ? 'source-map' : false,

        devServer: {
            host: 'localhost',
            port: 3000,
        },
    };
};
