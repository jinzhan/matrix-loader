/**
 * @file matrix-postcss.js，可以作为插件的方式提供给postcss使用
 * */

const loader = require('./matrix.postcss');

module.exports = loader.default;
