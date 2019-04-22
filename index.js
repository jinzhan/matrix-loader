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


/**
 * new Feature
 * [Todo] 1. js中支持文件名称缩写；
 * [done] 2. 内容自适应处理，type为可选项；
 * [Todo] 3. 文件的分拆，更细的粒度；[Todo]
 * [Todo] 4. postcss支持插件化（css的处理支持两种方式）；
 * [done] 4. 工程化实践；
 * [Todo] 5. 注意sourcemap的问题；
 * [Todo] 6. 使用babel/core代替esprima
 * **/

// html中的属性标识
const matrixHtmlAttribute = 'matrix';
const matrixHtmlAttributeAbbr = 'mt';

// css中的选择符或者前缀标识
const matrixCssSelector = '-matrix-';
const matrixCssSelectorAbbr = '-mt-';

// js中的函数名称标识
const matrixCalleeName = 'matrix';
const matrixCalleeNameAbbr = 'MT';


/**
 * 简单的断言比较
 *
 * @param {string} expr 断言表达式
 * @param {string} env 环境变量
 * */
const isMatchEnv = (expr, env) => {
    // 得到代码中配置参数和环境变量的「比较表达式」
    const assert = expr.replace(/([_a-zA-Z][_a-zA-Z0-9\-]*)/g, '=="$1"')
        .replace(/([!=]=)/g, `'${env}'$1`);
    return (new Function('return ' + assert))();
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

// css插件，处理matrix中的css标记
const matrixStylePlugin = options => {
    const cssSelectorReg = new RegExp(`${matrixCssSelector}(\\w+)-\\s*`);
    const cssPropReg = new RegExp(`${matrixCssSelector}(\\w+)-`);
    const cssSelectorRegAbbr = new RegExp(`${matrixCssSelectorAbbr}(\\w+)-\\s*`);
    const cssPropRegAbbr = new RegExp(`${matrixCssSelectorAbbr}(\\w+)-`);
    return css => {
        options = options || {};
        css.walkRules(rule => {
            // 处理样式块
            const hasMatrixStyle = rule.selector && (cssSelectorReg.test(rule.selector) || cssSelectorRegAbbr.test(rule.selector));

            if (hasMatrixStyle) {
                const isMatch = RegExp.$1 === options.env;
                if (!isMatch) {
                    rule.removeAll();
                    return;
                }
                rule.selector = rule.selector.replace(cssSelectorReg, '').replace(cssSelectorRegAbbr, '');
            }

            // 处理单行样式
            rule.walkDecls((decl, i) => {
                // decl.prop: 属性 decl.value:属性值
                const prop = decl.prop;

                if (cssPropReg.test(prop) || cssPropRegAbbr.test(prop)) {
                    const isMatch = RegExp.$1 === options.env;
                    if (isMatch) {
                        decl.prop = decl.prop.replace(cssPropReg, '').replace(cssPropRegAbbr, '');
                    } else {
                        decl.remove();
                    }
                }
            });
        });
    };
};


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


const fileTemplate = () => {
    return `
        {%$ua=$smarty.server.HTTP_USER_AGENT|lower%}
        
        {%if strpos($ua, 'lite baiduboxapp')%}
            {%include file="..."%}
        {%elseif strpos($ua, 'pro baiduboxapp')%}
            {%include file="..."%}
        {%elseif strpos($ua, 'info baiduboxapp')%}
            {%include file="..."%}
        {%elseif strpos($ua, 'mission baiduboxapp')%}
            {%include file="..."%}
        {%else%}
            {%include file="..."%}
        {%/if%}
    `;
};

const loader = function (content, map, meta) {
    const options = Object.assign({}, getOptions(this));

    const callback = this.async();

    // 获取文件类型
    const type = options.type || this.resourcePath.split('.').pop();

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
             *      -matrix-env-width: 100px;
             *  }
             *
             * */
            case 'css':
            case 'less':
                return postcss()
                    .use(matrixStylePlugin(options))
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
        .catch(err => {
            if (err.file) {
                this.addDependency(err.file);
            }
            return err.name === 'CssSyntaxError' ? callback(new SyntaxError(err)) : callback(err);
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


