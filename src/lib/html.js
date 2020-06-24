/**
 * @file html.js
 * 处理html的插件，编译html中的语法糖
 */

import {
    isMatchEnv
} from './utils';
import {
    matrixHtmlAttribute,
    matrixHtmlAttributeAbbr
} from './config';

export default (options) => {
    return (tree) => {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(tree)) {
                reject(new Error('Tree is not Array'));
                return;
            }

            if (tree.length === 0) {
                resolve(tree);
                return;
            }

            resolve(
                tree.walk((node) => {
                    const {
                        attrs
                    } = node;

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
