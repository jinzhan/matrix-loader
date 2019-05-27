/**
 * @file matrix 文件生成脚本
 */

const {exec, execSync} = require('child_process');
const fs = require('fs');

const regCss = /{%block\s+name="__css_asset"%}(.+?){%\/block%}/gm;
const regJs = /{%block\s+name="__script_asset"%}(.+?){%\/block%}/gm;

const initialStatement = '{%$ua=$smarty.server.HTTP_USER_AGENT|lower%}';

// 定义适配条件和适配属性
const statementMap = [
    {
        env: 'kdd',
        assert: 'strpos($ua, \'mission baiduboxapp\')'
    },
    {
        env: 'lite',
        assert: 'strpos($ua, \'lite baiduboxapp\')'
    },
    {
        env: 'pro',
        assert: 'strpos($ua, \'pro baiduboxapp\')'
    },
    // 主版需要排除其他的版本
    {
        env: 'main',
        assert: 'strpos($ua, \'baiduboxapp\')'
    }
];


const getTplList = dir => {
    const data = execSync(`find ${dir} -type f -name '*.tpl'`);
    return data.toString('utf-8').trim('\n').split('\n');
};

const getStatic = content => {
    const css = regCss.test(content) && RegExp.$1 || '';
    const js = regJs.test(content) && RegExp.$1 || '';
    return {
        css,
        js
    };
};

const getPathInfo = str => {
    const pathArr = str.replace(/^(?:\.\/)?output\//, '').split('/');
    const env = pathArr.shift().split('matrix-')[1];
    const path = pathArr.join('/');
    return {
        path,
        env
    };
};

/***
 *  构造smarty语句
 *  {%$ua=$smarty.server.HTTP_USER_AGENT|lower%}
 *
 *  {%if strpos($ua, 'lite baiduboxapp')%}
 *      ...
 *  {%elseif strpos($ua, 'pro baiduboxapp')%}
 *      ...
 *  {%elseif strpos($ua, 'info baiduboxapp')%}
 *      ...
 *  {%elseif strpos($ua, 'mission baiduboxapp')%}
 *      ...
 *  {%else%}
 *      ...
 *  {%/if%}
 *  **/
const getStatement = matrixList => {
    const statementList = [];
    statementMap.forEach(item => {
        const target = matrixList.find(asset => {
            return asset.env === item.env;
        });
        if (target) {
            statementList.push(`{%elseif ${item.assert}%}`);
            statementList.push(target.content);
        }
    });

    // 增加默认适配项，有other优先使用other，否则使用主版
    statementList.push(`{%else%}`);
    const other = matrixList.find(asset => {
        return asset.env === 'other';
    }) || matrixList.find(asset => {
        return asset.env === 'main';
    });

    statementList.push(other.content);
    statementList.push('{%/if%}');
    statementList[0] = statementList[0].replace('elseif', 'if');
    statementList.unshift(initialStatement);
    return statementList.join('\n');
};


const make = () => {
    const tplList = getTplList('output/matrix-*');
    const staticAsset = {};

    // 获取静态资源
    tplList.forEach(filePath => {
        const data = fs.readFileSync(filePath, 'utf-8');
        const {path, env} = getPathInfo(filePath);
        staticAsset[path] = staticAsset[path] || {};
        staticAsset[path][env] = getStatic(data);
    });

    execSync('rm -rf output-matrix');

    // 将tpl填充到output中，同时也避免写入文件的时候，文件夹不存在
    statementMap.forEach(item => {
        const path = `output/matrix-${item.env}`;
        const isDir =  fs.existsSync(path) && fs.statSync(path).isDirectory();
        if (isDir) {
            execSync(`cp -r  output/matrix-${item.env}/ output-matrix`);
        }
    });

    const tplListMain = getTplList('output/matrix-main');

    // 遍历主版中的文件
    tplListMain.forEach(filePath => {
        let data = fs.readFileSync(filePath, 'utf-8');
        const {path, env} = getPathInfo(filePath);

        // 如果包含有css文件
        if (regCss.test(data)) {
            const cssAsset = [];
            for (const env in staticAsset[path]) {
                cssAsset.push({
                    env,
                    content: staticAsset[path][env].css
                });
            }
            const matrixCss = getStatement(cssAsset);
            data = data.replace(regCss, `{%block name="__css_asset"%}${matrixCss}{%/block%}`);
        }

        // 如果包含有js文件
        if (regJs.test(data)) {
            const jsAsset = [];
            for (const env in staticAsset[path]) {
                jsAsset.push({
                    env,
                    content: staticAsset[path][env].js
                });
            }
            const matrixJs = getStatement(jsAsset);
            data = data.replace(regJs, `{%block name="__script_asset"%}${matrixJs}{%/block%}`);
        }

        // 生成新的文件
        const newPath = `./output-matrix/${path}`;
        fs.writeFile(newPath, data, err => {
            if (err) {
                console.warn(`create file ${newPath} failed`);
                throw err;
            }
            console.log(`create file ${newPath} successfully`);
        });
    });
};

module.exports = make;