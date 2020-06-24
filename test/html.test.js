import webpack from './helpers/compiler';

describe('loader', () => {
    it('should works with HTML', async () => {
        const env = 'main';
        const config = {
            loader: {
                test: /\.(html)$/i,
                options: {
                    env
                },
            },
            preLoaders: {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                }
            },
        };

        const stats = await webpack('html.js', config);
        const jsonStats = stats.toJson();
        const {
            modules,
            assets
        } = jsonStats;
        const [{
            source
        }] = modules;

        // eslint-disable-next-line no-new-func
        const sourceReturn = new Function(
            'exports',
            'require',
            'module',
            '__filename',
            '__dirname',
            `'use strict'\nvar __webpack_public_path__ = '';\nreturn ${source.replace(/\n/g, '')}`
        )(exports, require, module, __filename, __dirname);

        expect(sourceReturn).toMatch(new RegExp(`<div>${env}</div>`));
        expect(sourceReturn).not.toMatch(new RegExp(`<div>lite</div>`));
        expect(sourceReturn).not.toMatch(new RegExp(`<div>kdd</div>`));
    });
});
