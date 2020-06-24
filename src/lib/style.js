/**
 * @file style.js
 * 处理css、less的插件，编译css中的语法糖
 */

export default ({
    env
}, {
    matrixCssSelector,
    matrixCssSelectorAbbr
}) => {
    const cssSelectorReg = new RegExp(`${matrixCssSelector}(\\w+)-\\s*`);
    const cssPropReg = new RegExp(`${matrixCssSelector}(\\w+)-`);
    const cssSelectorRegAbbr = new RegExp(
        `${matrixCssSelectorAbbr}(\\w+)-\\s*`
    );
    const cssPropRegAbbr = new RegExp(`${matrixCssSelectorAbbr}(\\w+)-`);
    return css => {
        css.walkRules((rule) => {
            // 处理样式块
            const hasMatrixStyle = rule.selector && (cssSelectorReg.test(rule.selector) || cssSelectorRegAbbr.test(rule.selector));

            if (hasMatrixStyle) {
                const isMatch = RegExp.$1 === env;
                if (!isMatch) {
                    rule.removeAll();
                    return;
                }
                rule.selector = rule.selector
                    .replace(cssSelectorReg, '')
                    .replace(cssSelectorRegAbbr, '');
            }

            // 处理单行样式
            rule.walkDecls((decl, i) => {
                // decl.prop: 属性 decl.value:属性值
                const {
                    prop
                } = decl;

                if (cssPropReg.test(prop) || cssPropRegAbbr.test(prop)) {
                    const isMatch = RegExp.$1 === env;
                    if (isMatch) {
                        decl.prop = decl.prop
                            .replace(cssPropReg, '')
                            .replace(cssPropRegAbbr, '');
                    } else {
                        decl.remove();
                    }
                }
            });
        });
    };
};
