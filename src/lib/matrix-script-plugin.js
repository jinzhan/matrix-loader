/**
 * @file matrixScriptPlugin.js
 * css插件，处理matrix中的js标记
 */

const babel = require('@babel/core');
const traverse = require('babel-traverse').default;

const {isMatchEnv} = require('./utils');

const {matrixCalleeName, matrixCalleeNameAbbr} = require('./config');

/**
 * 基于ast语法树，获取到为「函数块」的代码
 * @param {Object} node 代码节点
 * */
const isMatrixSnippet = node => {
    const callee = node.callee;
    return node.type === 'CallExpression'
        && callee.type === 'Identifier'
        && (callee.name === matrixCalleeName || callee.name === matrixCalleeNameAbbr);
};

/**
 * 解析js代码
 *
 * @param {string} source script代码
 * @param {string} env 环境匹配字符
 * */
const matrixScriptParser = (source, env) => {
    env = env.trim();

    if (!env) {
        console.error('matrix loader: env required!');
        return;
    }
    const entries = [];

    const {code, map, ast} = babel.transformSync(source, {ast: true});

    traverse(ast, {
        enter(path) {
            const node = path.node;

            // 仅处理函数块
            if (!isMatrixSnippet(node)) {
                return;
            }

            // 函数的第一个参数，即条件，比如：!lite
            const arg = node.arguments[0].value.trim();

            const code = node.arguments[1];

            if (code.type !== 'FunctionExpression') {
                throw new Error('matrix loader: FunctionExpression required!');
            }

            const expr = source.slice(code.start, code.end);

            // 清除掉不匹配的标记
            const content = isMatchEnv(arg, env) ? `(${expr})();` : '';

            entries.push({
                start: node.start,
                end: node.end,
                content
            });
        }
    });

    entries.sort((a, b) => b.end - a.end)
        .forEach(n => {
            source = source.slice(0, n.start) + n.content + source.slice(n.end);
        });

    return source;
};

export default matrixScriptParser;