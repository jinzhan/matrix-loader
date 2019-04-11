
# martix-loader

What problem does this feature solve?

## Martix Products

- bd
- kdd
- lite
- bd~11.7
- bd

## martix-loader


### Usage

```

__martix__('env', env => {
    console.log(`The env is ${env}`);
});

```

## martix-style-loader


### Usage
- -martix-env-
- -martix-env {}

#### single line

```

-martix-env-width: 100px;

```

### css block

```
-martix-env {
    .classname {
        color: red;
    }
}

```


## martix-tpl-loader

### Usage

```

<div -martix-env="dev"></div>
```



## Logical Operator

 - \_\_martix\_\_('!dev',()=>{...});
 - \_\_martix\_\_('dev || pre',()=>{...});
 - \_\_martix\_\_('!(dev || pre)',()=>{...});  
 - \_\_martix\_\_("!dev",()=>{...});
