
# Matrix-loader

What problem does this feature solve?

In some cases, the front-end code needs to differentiate the code in different environments, which makes the situation complex. `Matrix-loader` provides a way to generate separated code under different conditions.


## Usage

```
npm install matrix-loader --save-dev
```

## Configuration

You need to set the env variable which could be something like:


```
MATRIX=main node ./scripts/build.js
```

### Loader Configuration

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

#### It is recommended to put `matrix-loader` processing in  post-css plugin:

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

## Code

### Abbreviation

All `matrix` below can use the abbreviation `mt`. Note that `mt` in JS needs to use uppercase `MT` to avoid conflicts.

### less

#### Usage
- -matrix-ENV-
- -matrix-ENV-

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


#### demo

```

// index.less

-matrix-demo- .test {
    color: red;
}

-matrix-main- .test {
    color: green;
}

.demo {
    -matrix-main-width: 100px;
    -matrix-demo-width: 90px;
}

```

#### Output(demo)

```

.test {
    color: red;
}

.demo {
    width: 90px;
}
```


#### Output(main)

```

.test {
    color: green;
}

.demo {
    width: 100px;
}
```



### JS


```

martix('demo', () => {
    console.log(`The env is demo`);
});

martix('main', () => {
    console.log(`The env is main`);
});

```

#### Output(demo)

```

console.log(`The env is demo`);

```


#### Output(main)

```
console.log(`The env is main`);

```



## html

### Usage

```

<div mt="env"></div>
```



## Logical Operator

 - \_\_matrix\_\_('demo',()=>{...});
 - \_\_matrix\_\_('!demo',()=>{...});
 - \_\_matrix\_\_('main || demo',()=>{...});

