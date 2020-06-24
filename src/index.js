/**
 * @file Matrix Loader
 * @author jinzhan<steinitz@qq.com>
 */

import posthtml from 'posthtml';
import postcss from 'postcss';
import {
    getOptions
} from 'loader-utils';
import removeAttributes from 'posthtml-remove-attributes';

import {
    matrixCssSelector,
    matrixCssSelectorAbbr,
    matrixHtmlAttribute,
    matrixHtmlAttributeAbbr,
} from './lib/config';
import matrixStylePlugin from './lib/style';
import matrixScriptParser from './lib/script';
import matrixHtmlPlugin from './lib/html';

export default function (content, map, meta) {
    const options = Object.assign({}, getOptions(this));
    const callback = this.async();

    // 获取文件类型
    const type = options.type || this.resourcePath.split('.').pop();

    Promise.resolve()
        .then(() => {
            switch (type) {
                /**
                 *
                 * demo: css的标签特征：
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
                case 'less': {
                    const postcssOptions = Object.assign({
                            from: null,
                        },
                        options
                    );
                    return postcss()
                        .use(
                            matrixStylePlugin(options, {
                                matrixCssSelector,
                                matrixCssSelectorAbbr,
                            })
                        )
                        .process(content, postcssOptions)
                        .then(result => {
                            callback(null, result.css, result.map, meta);
                        });
                }

                /**
                 *
                 * demo: js的标签特征：MT | matrix
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
                 * demo: html的标签特征：
                 *
                 * 1. <div matrix="dev"></div>
                 * 2. 缩写形式：<div mt="dev"></div>
                 *
                 * */
                case 'html':
                    return posthtml()
                        .use(matrixHtmlPlugin(options))
                        .use(
                            removeAttributes([
                                matrixHtmlAttribute,
                                matrixHtmlAttributeAbbr,
                            ])
                        )
                        .process(content, options)
                        .then((result) => {
                            callback(null, result.html, map, meta);
                        });

                default:
                    callback(
                        new SyntaxError(
                            'matrix-loader: type options is require'
                        )
                    );
            }
            return {};
        })
        .catch((err) => {
            if (err.file) {
                this.addDependency(err.file);
            }
            return err.name === 'CssSyntaxError' ? callback(new SyntaxError(err)) : callback(err);
        });
};
