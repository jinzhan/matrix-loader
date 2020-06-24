/**
 * @file matrix-postcss.js，可以作为插件的方式提供给postcss使用
 * */

import postcss from 'postcss';

import matrixStyle from './lib/style';

import {
    matrixCssSelector,
    matrixCssSelectorAbbr
} from './lib/config';

const defaultOpts = {
    matrixCssSelector,
    matrixCssSelectorAbbr,
};

export default postcss.plugin('postcss-matrix', (options) => {
    const opts = {
        ...defaultOpts,
        ...options,
    };

    return matrixStyle(
        {
            env: opts.env,
        },
        {
            matrixCssSelector: opts.matrixCssSelector,
            matrixCssSelectorAbbr: opts.matrixCssSelectorAbbr,
        }
    );
});
