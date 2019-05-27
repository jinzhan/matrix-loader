/**
 * @file Matrix Loader
 * @author jinzhan<steinitz@qq.com>
 */
import posthtml from 'posthtml';
import postcss from 'postcss';
import {getOptions} from 'loader-utils';
import removeAttributes from 'posthtml-remove-attributes';
import {
    matrixCssSelector,
    matrixCssSelectorAbbr,
    matrixHtmlAttribute,
    matrixHtmlAttributeAbbr
} from './lib/config';

import matrixStylePlugin from './lib/matrix-style-plugin';
import matrixScriptParser from './lib/matrix-script-plugin';
import matrixHtmlPlugin from './lib/matrix-html-plugin';

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
                    .use(matrixStylePlugin(options, {matrixCssSelector, matrixCssSelectorAbbr}))
                    .process(content, options)
                    .then(result => {
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
            case 'js': {
                const js = matrixScriptParser(content, options.env || '');
                callback(null, js, map, meta);
                break;
            }

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
 * matrix-loader
 *
 * @method loader
 *
 * @param {String} css Source
 * @param {Object} map Source Map
 *
 * @return {cb} cb Result
 */

export default loader;
