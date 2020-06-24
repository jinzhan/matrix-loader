/**
 * @file script.js
 * 处理script的插件，编译script中的语法糖
 */

import * as babel from '@babel/core';
import traverse from '@babel/traverse';

import {
    isMatchEnv
} from './utils';
import {
    matrixCalleeName,
    matrixCalleeNameAbbr
} from './config';

/**
 * 基于ast语法树，获取到为「函数块」的代码
 *
 * @param {Object} node 代码节点
 * @return {boolean}
 * */
const isMatrixSnippet = (node) => {
    const {
        callee
    } = node;
    return node.type === 'CallExpression'
        && callee.type === 'Identifier'
        && (callee.name === matrixCalleeName || callee.name === matrixCalleeNameAbbr);
};

/**
 * 解析js代码
 *
 * @param {string} source script代码
 * @param {string} env 环境匹配字符
 *
 * @return {string}
 * */

export default (source, env) => {
    env = env.trim();

    if (!env) {
        throw new Error('Matrix loader: env required!');
        return;
    }
    const entries = [];
    const {
        // code,
        // map,
        ast,
    } = babel.transformSync(source, {
        ast: true,
        // reference: https://github.com/babel/babel/blob/master/packages/babel-preset-stage-0/README.md
        plugins: [
            [
                '@babel/plugin-proposal-decorators',
                {
                    legacy: true,
                },
            ],
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true,
                },
            ],
            '@babel/plugin-proposal-do-expressions',
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-proposal-optional-catch-binding',
        ],
    });

    traverse(ast, {
        enter(path) {
            const {
                node
            } = path;

            // 仅处理函数块
            if (!isMatrixSnippet(node)) {
                return;
            }

            // 函数的第一个参数，即条件，比如：!lite
            const arg = node.arguments[0].value.trim();

            const code = node.arguments[1];

            if (!/^(Arrow)?FunctionExpression$/.test(code.type)) {
                throw new Error('matrix loader: FunctionExpression required!');
            }

            const expr = source.slice(code.start, code.end);

            // 清除掉不匹配的标记
            const content = isMatchEnv(arg, env) ? `(${expr})();` : '';

            entries.push({
                start: node.start,
                end: node.end,
                content,
            });
        },
    });

    entries
        .sort((a, b) => b.end - a.end)
        .forEach((n) => {
            source = source.slice(0, n.start) + n.content + source.slice(n.end);
        });

    return source;
};
