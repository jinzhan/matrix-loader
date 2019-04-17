/**
 * @file Matrix Loader
 * @author jinzhan<steinitz@qq.com>
 */
const path = require('path');
const posthtml = require('posthtml');
const postcss = require('postcss');
const lessSyntax = require('postcss-less');
const {getOptions} = require('loader-utils');
const esprima = require('esprima');
const babel = require('@babel/core');
const removeAttributes = require('posthtml-remove-attributes');


// 定义全局属性

// html中的属性标识
const matrixHtmlAttribute = 'matrix';
const matrixHtmlAttributeAbbr = 'mt';
const matrixCssSelector = '-matrix-';
const matrixCssSelectorAbbr = '-mt-';
const matrixCalleeName = 'matrix';
const matrixCalleeNameAbbr = 'MT';


/**
 * 简单的断言比较
 *  __martix__('!dev',()=>{...});
 *  __martix__('dev || pre',()=>{...});
 *  __martix__('!(dev || pre)',()=>{...});
 *  __martix__("!dev",()=>{...});
 *
 * @param {string} expr 断言表达式
 * @param {string} env 环境变量
 * */
const isMatchEnv = (expr, env) => {
    // 得到代码中配置参数和环境变量的「比较表达式」
    const predicate = expr.replace(/([_a-zA-Z][_a-zA-Z0-9\-]*)/g, '=="$1"')
        .replace(/([!=]=)/g, `'${env}'$1`);
    return (new Function('return ' + predicate))();
};


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

/*
* css插件，处理matrix中的css标记
* **/
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
                // decl.prop: 属性，decl.value:属性值
                const prop = decl.prop;
                if (prop.indexOf('-matrix-env-') !== -1) {
                    decl.prop = decl.prop.replace('-matrix-env-', 'cool-prefix----');
                }
            });
        });
    };
});


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

    // esprima版本
    esprima.parseModule(source, {}, (node, meta) => {
        // 仅处理函数块
        if (!isMatrixSnippet(node)) {
            return;
        }

        hasMatrixSnippet = true;

        // 函数的第一个参数，即条件，比如：!lite
        const arg = node.arguments[0].value.trim();

        if (!isMatchEnv(arg, env)) {
            entries.push({
                start: meta.start.offset,
                end: meta.end.offset
            });
        }
    });


    // babel版本
    babel.transform(source, {}, (err, result) => {
        // todo
    });


    // 清除掉不匹配的标记
    entries.sort((a, b) => b.end - a.end)
        .forEach(n => {
            source = source.slice(0, n.start) + source.slice(n.end);
        });

    if (hasMatrixSnippet) {
        // 将matrixCalleeName统一转化为缩写
        // todo
        return `function ${matrixCalleeName}(a,b){b();};` + source;
    }

    return source;
};

const loader = function (content, map, meta) {
    const options = Object.assign({}, getOptions(this));
    const callback = this.async();
    const type = options.type;

    Promise.resolve().then(() => {
        switch (type) {
            /**
             *
             * css的标签特征：
             *
             *   -matrix-env- #id {
             *      color: red;
             *   }
             *
             *  body {
             *      -matrix-width: 100px;
             *  }
             *
             * */
            case 'css':
                return postcss([matrixStylePlugin])
                    .process(content, options)
                    .then((result) => {
                        const {css, map, root, processor, messages} = result;
                        callback(null, css, map, meta);
                    });

            /**
             *
             * js的标签特征：MT | matrix
             *
             *  \/* global matrix, MT *\/
             *   MT('someCondition',()=>{
             *       console.log('This is from __matrix__loader__');
             *   });
             *
             * */
            case 'js':
                const js = matrixScriptParser(content, options.env || '');
                callback(null, js, map, meta);
                break;


            /**
             * html的标签特征：
             *
             * 1. <div matrix="dev"></div>
             * 2. 缩写形式：<div mt="dev"></div>
             *
             * */
            case 'html':
                return posthtml()
                    .use(matrixHtmlPlugin(options))
                    .use(removeAttributes([matrixHtmlAttribute, matrixHtmlAttributeAbbr]))
                    .process(content, options)
                    .then(result => {
                        callback(null, result.html, map, meta);
                    });

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
 * @method loader
 *
 * @param {String} css Source
 * @param {Object} map Source Map
 *
 * @return {cb} cb Result
 */

module.exports = loader;


