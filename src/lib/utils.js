/**
 * @file utils.js
 */

/**
 * 语法糖核心判断方法，简单的断言比较
 *
 * @param {string} expr 断言表达式
 * @param {string} env 环境变量
 * @return {boolean}
 * */
export const isMatchEnv = (expr, env) => {
    // 得到代码中配置参数和环境变量的「比较表达式」
    const assert = expr
        .replace(/([_a-zA-Z][_a-zA-Z0-9-]*)/g, '=="$1"')
        .replace(/([!=]=)/g, `'${env}'$1`);
    return new Function(`return ${assert}`)();
};