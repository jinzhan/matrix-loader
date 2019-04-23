/**
 * matrix style
 * */
const postcss = require('postcss');
const matrixStyle = require('./lib/matrix-style-plugin');

// css中的选择符或者前缀标识
const matrixCssSelector = '-matrix-';
const matrixCssSelectorAbbr = '-mt-';

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