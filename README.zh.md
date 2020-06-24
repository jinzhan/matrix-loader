
# Matrix-loader

What problem does this feature solve?

在多种端的环境下，前端代码需要根据区分不同环境下的代码，使业务变得很复杂。`Matrix-loader`提供一种方式，可以在不同的打包条件下
产出不同的代码。


## Usage

```
npm install matrix-loader --save-dev
```

## 配置

matrix-loader依赖环境变量区分环境，所以首先必须定义好环境变量，比如这样：

```
MATRIX=main node ./scripts/build.js
```

### Loader的配置

```
    {
            test: /\.(html|js|less)$/,
            use: [
                {
                    loader: 'matrix-loader',
                    options: {
                        env: MATRIX_ENV
                    },
                }
            ]
    }

```

#### 推荐将less处理放到postcss的插件中：

```

// postcss.config.js

const matrix = require('matrix-loader/style');

module.exports = {
    plugins: [
        matrix({
            env: MATRIX_ENV
        })
    ]
};

```




## Matrix Loader详细说明

### ENV（矩阵产品的标识）

- main：百度App主版
- kdd：看多多
- lite: 百度App lite版
- other：其他情况

### html模板中的使用：matrix（缩写mt）

#### Usage

```
<div mt="ENV"></div>
```

#### demo

```html
<div mt="main">此div仅仅在主版下出现</div>
```


### less中的标识-matrix-（缩写为-mt-）

#### Usage
- -matrix-ENV- cssSelector
- -matrix-ENV-property

#### single line

```

-matrix-ENV-width: 100px;

```

### css block

```
-matrix-ENV- {
    .classname {
        color: red;
    }
}

```


#### 示例

```

// index.less

-matrix-kdd- .test {
    color: red;
}

-matrix-main- .test {
    color: green;
}

.demo {
    -matrix-main-width: 100px;
    -matrix-kdd-width: 90px;
}

```

#### 产出(看多多)

```

.test {
    color: red;
}

.demo {
    width: 90px;
}
```


#### 产出(主版)

```

.test {
    color: green;
}

.demo {
    width: 100px;
}
```

### 示例2

```
// 仅仅在看多多下生效

-mt-kdd- .test {
    color: red;
}

.test {
    -matrix-kdd-color: green;
}

```

### js中的函数名称标识matrix（缩写MT）

注：在js中的mt需要使用大写MT，以避免冲突；


#### USAGE

```
MT(env, function expression)
```

#### demo

```
// 仅仅在lite版
MT('lite', () => {
    console.log(`The env is kdd`);
});

```

#### js中支持逻辑运算

```
MT('kdd',()=>{...});
MT('!kdd',()=>{...});
MT('main || kdd',()=>{...});
```


### demo


```

martix('kdd', () => {
    console.log(`The env is kdd`);
});

martix('kdd', () => {
    console.log(`The env is main`);
});

```

#### 产出(看多多)

```

console.log(`The env is kdd`);

```


#### 产出(主版)

```
console.log(`The env is main`);

```


