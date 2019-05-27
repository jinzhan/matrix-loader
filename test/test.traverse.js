/*
 * @file: simple test
 * @author jinzhan 
 * @mail steinitz@qq.com
 */

const assert = require('assert');
const matrixScriptParser = require('../dist/lib/matrix-script-plugin');

const source = `
import {Component} from 'san';
import './app.css';

@isTestable(true)
class MyClass { }

function isTestable(value) {
    return function decorator(target) {
        target.isTestable = value;
    }
}


let a = do {
  if(x > 10) {
    'big';
  } else {
    'small';
  }
};

export default class App extends Component {
    constructor(opts) {
        super(opts);
        console.log(...opts);
        console.log(typeof (() => {
                    console.log('I am a function');
                }));
    }
    static template = '<h1>Hello, World~</h1>';
}

export v from 'mod';
`;

describe('ScriptParser', function() {
    describe('#es6', function() {
        it('es6代码转换不会报错', function() {
            const result = matrixScriptParser(source, 'main');
            assert.equal(typeof result, 'string');
        });
    });
});