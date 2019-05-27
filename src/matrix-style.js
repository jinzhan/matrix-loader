/**
 * matrix style
 * */
import postcss from 'postcss';
import matrixStyle from './lib/matrix-style-plugin';
import {matrixCssSelector, matrixCssSelectorAbbr} from './lib/config';

const defaultOpts = {matrixCssSelector, matrixCssSelectorAbbr};

export default postcss.plugin('postcss-matrix', options => {
    const opts = {...defaultOpts, ...options};
    return matrixStyle({
        env: opts.env
    }, {
        matrixCssSelector: opts.matrixCssSelector,
        matrixCssSelectorAbbr: opts.matrixCssSelectorAbbr
    });
});