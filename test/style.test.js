import fs from 'fs';
import path from 'path';

import postcss from 'postcss';

import postcssMatrixPlugin from '../src/matrix.postcss.cjs';

describe('loader', () => {
    it('should clear all css when env not match', async () => {
        const csspath = path.resolve(__dirname, './fixtures/css.css');
        const css = fs.readFileSync(csspath);
        postcss([postcssMatrixPlugin()])
            .process(css, {
                from: undefined,
            })
            .then((result) => {
                expect(result.css).not.toMatch(new RegExp('color: red;'));
            });
    });

    it('should keep the css when env match', async () => {
        const csspath = path.resolve(__dirname, './fixtures/css.css');
        const css = fs.readFileSync(csspath);
        postcss([
            postcssMatrixPlugin({
                from: undefined,
                env: 'main',
            }),
        ])
            .process(css)
            .then((result) => {
                expect(result.css).toMatch(new RegExp('color: blue;'));
            });
    });
});
