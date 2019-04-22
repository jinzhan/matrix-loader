/**
 * @file Matrix Loader
 * */

const babel = require('@babel/core');
const traverse = require('babel-traverse').default();

const source = `
    const matrix = (key, fuc) => {console.log({key});func();};
    matrix('kdd', () => {
    a('kddd欢迎来到看多多');
});`;


// 定义一个 babel 插件，拦截并修改 routes 的数组表达式
let visitor = {
    ArrayExpression(path) {
        const elements = path.node.elements;
        console.warn(`routes number:  ${elements.length}`);
        // 新增一个构建出来的 route 对象
        elements.push(t.objectExpression([
            t.objectProperty(t.identifier('path'), t.stringLiteral(newRoute.path)),
            t.objectProperty(t.identifier('name'), t.stringLiteral(newRoute.name)),
            t.objectProperty(t.identifier('component'), t.identifier('ListComponent'))
        ]));
    }
};

// babel版本
babel.transform(source, {
    ast: true
}, (err, result) => {
    console.log({result: JSON.stringify(result)});
});