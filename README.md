
# Matrix-loader

What problem does this feature solve?

## Matrix Products

- main
- kdd
- lite
- pro
- other

## Matrix-loader


### Usage

```

__martix__('env', env => {
    console.log(`The env is ${env}`);
});

```

## Matrix-style-loader


### Usage
- -matrix-env-
- -matrix-env {}

#### single line

```

-matrix-env-width: 100px;

```

### css block

```
-matrix-env- {
    .classname {
        color: red;
    }
}

```


### post-css plugin

``` 

    const matrix = require('matrix-loader/style');
    
    module.exports = {
        plugins: [
            matrix({
                env: process.env.MATRIX || 'main'
            })
        ]
    };

```

You'll need to set the env variable which could be something like `MATRIX=kdd npm run build`

## matrix-tpl-loader

### Usage

```

<div mt="env"></div>
```



## Logical Operator

 - \_\_matrix\_\_('kdd',()=>{...});
 - \_\_matrix\_\_('!kdd',()=>{...});
 - \_\_matrix\_\_('main || kdd',()=>{...});
