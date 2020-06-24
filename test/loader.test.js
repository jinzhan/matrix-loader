import webpack from './helpers/compiler';

describe('loader', () => {
    it('should works with JS', async () => {
        const env = 'main';
        const config = {
            loader: {
                test: /\.(css|js|html)$/i,
                options: {
                    env
                },
            },
        };

        const stats = await webpack('fixture.js', config);
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

        // TODO: 待解决，js代码中有冗余的分号
        expect(sourceReturn).toBe(env);
    });
});
