/**
 * matrix style
 * */
const postcss = require('postcss');
const matrixStyle = require('./lib/matrix-style-plugin');
const {matrixCssSelector, matrixCssSelectorAbbr} = require('./lib/config');

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