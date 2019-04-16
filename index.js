/**
 * @file Matrix Loader
 * @author jinzhan<steinitz@qq.com>
 */
const path = require('path');
const postcss = require('postcss');
const lessSyntax = require('postcss-less');
const {getOptions} = require('loader-utils');
const esprima = require('esprima');

const matrixStylePlugin = postcss.plugin('matrixStylePlugin', options => {
    return css => {
        options = options || {};
        css.walkRules(rule => {
            // 处理样式块
            const hasMatrixStyle = rule.selector && rule.selector.indexOf('-matrix-env-') !== -1;

            if (hasMatrixStyle) {
                rule.removeAll();

                // todo: 如果符合规范要把内容抽出来，放到父级里面去
                return;
            }

            // 处理单行样式
            rule.walkDecls((decl, i) => {
                /*
                * decl.prop:   css属性
                * decl.value:  css属性值
                * */
                const prop = decl.prop;
                if (prop.indexOf('-matrix-env-') !== -1) {
                    decl.prop = decl.prop.replace('-matrix-env-', 'cool-prefix----');
                }
            });
        });
    };
});

/**
 * 基于ast语法树，获取到为「函数块」的代码
 * @param {Object} node 代码节点
 * */
const isMatrixSnippet = node => {
    return node.type === 'CallExpression'
        && node.callee.type === 'Identifier'
        && node.callee.name === '__matrix__';
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

    let hasMatrixSnippet = false;

    esprima.parseModule(source, {}, (node, meta) => {
        // 仅处理函数块
        if (!isMatrixSnippet(node)) {
            return;
        }

        hasMatrixSnippet = true;

        // 得到函数的第一个参数，比如：!lite
        const arg = node.arguments[0].value.trim();

        // 得到代码中配置参数和环境变量的「比较表达式」
        const predicate = arg.replace(/([_a-zA-Z][_a-zA-Z0-9\-]*)/g, '=="$1"')
            .replace(/([!=]=)/g, `'${env}'$1`);

        if (!eval(predicate)) {
            entries.push({
                start: meta.start.offset,
                end: meta.end.offset
            });
        }
    });

    entries.sort((a, b) => b.end - a.end)
        .forEach(n => {
            source = source.slice(0, n.start) + source.slice(n.end);
        });

    return hasMatrixSnippet ? 'function __matrix__(a,b){b();};' + source : source;
};

const loader = function (content, map, meta) {
    const options = Object.assign({}, getOptions(this));
    const callback = this.async();
    const type = options.type;

    Promise.resolve().then(() => {
        switch (type) {
            case 'css':
                return postcss([matrixStylePlugin])
                    .process(content, options)
                    .then((result) => {
                        const {css, map, root, processor, messages} = result;
                        callback(null, css, map, meta);
                    });
                break;
            case 'js':
                const js = matrixScriptParser(content, options.env || '');
                callback(null, js, map, meta);
                break;
            default:
                callback(new SyntaxError('matrix-loader: type options is require'));
        }
    })
        .catch((err) => {
            if (err.file) {
                this.addDependency(err.file);
            }
            return err.name === 'CssSyntaxError'
                ? callback(new SyntaxError(err))
                : callback(err)
        });

};

/**
 * matrix-style-loader
 *
 *
 * @method loader
 *
 * @param {String} css Source
 * @param {Object} map Source Map
 *
 * @return {cb} cb Result
 */

module.exports = loader;
