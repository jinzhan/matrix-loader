
# Matrix-loader

What problem does this feature solve?

## Matrix Products

- bd
- kdd
- lite
- bd~11.7
- bd

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
-matrix-env {
    .classname {
        color: red;
    }
}

```


## matrix-tpl-loader

### Usage

```

<div -matrix-env="dev"></div>
```



## Logical Operator

 - \_\_matrix\_\_('!dev',()=>{...});
 - \_\_matrix\_\_('dev || pre',()=>{...});
 - \_\_matrix\_\_('!(dev || pre)',()=>{...});  
 - \_\_matrix\_\_("!dev",()=>{...});
