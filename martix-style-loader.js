/**
 * @file Martix Style Loader
 * @author jinzhan<steinitz@qq.com>
 */
const path = require('path');
const postcss = require('postcss');
const lessSyntax = require('postcss-less');
const {getOptions} = require('loader-utils');

const martixStylePlugin = postcss.plugin('martixStylePlugin', options => {
    return css => {
        options = options || {};
        css.walkRules(rule => {
            // replace css block
            if (rule.selector && rule.selector.indexOf('-martix-env-') !== -1) {
                rule.removeAll();
                return;
            }

            // replace single line
            rule.walkDecls((decl, i) => {
                /*
                * decl.prop:   css rule prop
                * decl.value:  css rule value
                * */
                const prop = decl.prop;
                if (prop.indexOf('-martix-env-') !== -1) {
                    decl.prop = decl.prop.replace('-martix-env-', 'cool-prefix----');
                }
            });
        });
    };
});

const loader = function (css, map, meta) {
    const options = Object.assign({}, getOptions(this));
    const callback = this.async();
    Promise.resolve().then(() => {
        return postcss([martixStylePlugin])
            .process(css, options)
            .then((result) => {
                let {css, map, root, processor, messages} = result;
                callback(null, css, map, meta);
            });
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
 * martix-style-loader
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
