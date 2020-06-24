const MIN_BABEL_VERSION = 7;

module.exports = api => {
    api.assertVersion(MIN_BABEL_VERSION);
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: {
                        node: '8.9.0',
                    },
                },
            ],
        ],
        comments: false,
        plugins: [
            ['@babel/plugin-transform-runtime'],
            [
                '@babel/plugin-proposal-decorators',
                {
                    legacy: true,
                },
            ],
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true,
                },
            ],
        ],
        env: {
            production: {
                presets: ['minify'],
            },
        },
    };
};
