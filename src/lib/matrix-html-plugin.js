/**
 * @file matrixScriptPlugin.js
 * css插件，处理matrix中的js标记
 */

const {isMatchEnv} = require('./utils');
const {matrixHtmlAttribute, matrixHtmlAttributeAbbr} = require('./config');

const matrixHtmlPlugin = options => {
    return tree => {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(tree)) {
                reject(new Error('tree is not Array'));
            }

            if (tree.length === 0) {
                resolve(tree);
            }

            resolve(tree.walk(
                node => {
                    const attrs = node.attrs;
                    const expr = attrs && (attrs[matrixHtmlAttribute] || attrs[matrixHtmlAttributeAbbr]);

                    if (!expr) {
                        return node;
                    }

                    if (!isMatchEnv(expr, options.env)) {
                        node.tag = false;
                        node.content = [];
                    }

                    return node;
                })
            );
        });
    };
};

export default matrixHtmlPlugin;