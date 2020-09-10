---
title: 手写Vue系列（一）
date: 2019-08-19
sidebar: 'auto'
categories:
 - vue
tags:
 - vue
publish: true
---

# 前言
本文将一步步从零实现`vue-cli2.x`的核心流程；并将其命名为`quick-cli`。

## 实现目标
- 实现初始化项目`vue init <template-name> <project-name>`命令  
- 实现获取所有模板`vue templates`命令

---

## 创建工程
```sh
mkdir quick-cli
cd quick-cli
npm init -y
```

## 构建目录结构
```sh
|- bin # 运行服务
  | - quick.js # 运行主入口
  | - init.js # 初始化项目命令
  | - templates # 显示所有可用模板命令
|- lib # 工具包
|- docs # 文档
|- test # 测试文档
```

修改`package.json`的`bin`项为运行主入口
```sh
"bin": {
  "quick": "./bin/quick.js"
},
```

:::tip
通过`npm link`可在系统建立软链接，将当前所在目录包链接到`npm`全局
:::

## 定制命令行界面
通过[commander](https://www.npmjs.com/package/commander)定制命令行界面，并定制`version` `init` `templates`命令
```js
#!/usr/bin/env node
const program = require('commander');
const init = require('./init')
const templates = require('./templates')

// 获取版本
program.version(require('../package.json').version)

// 初始化项目
program.command('init <template-name> <name>')
    .description('init project')
    .action(init)

// 获取可用模板
program.command('templates')
    .description('show templates')
    .action(templates)

program.parse(process.argv); // 固定写法，解析命令行输入参数
```
:::tip
`#!/usr/bin/env node`告诉执行器以`node`来执行当前脚本
:::

完成上述之后，在命令行中输入`quick -h`就可以看到以下输出
```sh
Usage: quick [options] [command]

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  init <template-name> <name>  init project
  templates                    show templates
  help [command]      

```

---
**在实现上述`init`和`templates`命令之前，我们要先实现几个帮助方法**
## 模板下载
在`lib`文件夹下新建`download.js`，通过[download-git-repo](https://www.npmjs.com/package/download-git-repo)从`github`拉取模板
```js
const { promisify } = require('util'); // promise转换
const download = promisify(require('download-git-repo')); // github仓库代码下载
const ora = require('ora');// 命令行loading

// 默认模板所在的仓库地址
const gitRepo = 'github:GitHubForQiuKai/quick-templates';

/**
 * 根据分支名称下载到本地
 * @param {*} branchName 远程分支名称
 * @param {*} destination 本地目录
 */
const clone = async (branchName, destination) => {
    const spinner = ora('downloading template...');
    spinner.start()

    await download(`${gitRepo}#${branchName}`, destination)

    spinner.succeed('Download successful')
}

module.exports = clone
```
:::tip
这里是通过同一个项目下的不同`branch`来组织不同的模板，而`vue-cli`中是通过同一个机构下的不同项目来管理的。
:::

## 获取模板分支
在`lib`下新建`branch.js`，通过`github`提供的[api](https://docs.github.com/cn/rest/reference/repos#)来获取模板分支。
```js
const { Octokit } = require("@octokit/rest");
// http 请求
const octokit = new Octokit();

module.exports = async _ => {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
            owner: 'GitHubForQiuKai',
            repo: 'quick-templates',
            per_page: 100
        })
        if (response && response.data) {
            return response.data
        }
    } catch (error) {
        console.log('read ECONNRESET')
    }
}
```

## 定制输出信息样式
在`lib`下新建`logger.js`，通过[chalk](https://www.npmjs.com/package/chalk) [clear](https://www.npmjs.com/package/clear) [figlet](https://www.npmjs.com/package/figlet) 来定制命令行的输出样式
```js
const { promisify } = require('util')
const chalk = require('chalk')
const clear = require('clear')
const figlet = promisify(require('figlet'))


module.exports.log = function (msg) {
    console.log(chalk.white(msg))
}

module.exports.clear = function () {
    clear()
}

module.exports.figlet = function (msg) {
    figlet(msg)
}


module.exports.success = function (msg) {
    console.log(chalk.blue(msg))
}

module.exports.fail = function (msg) {
    console.log(chalk.red(msg))
}
```

---

## 实现`templates`命令行
下面来实现`quick templates`命令，这里我们只要[获取模板分支](##获取模板分支)并将其打印出来即可。
```js
// bin/templates.js
const getBranches = require('../lib/branch')
const logger = require('../lib/logger')

module.exports = async () => {
    const branches = await getBranches();

    if (branches && branches.length) {
        for (let branch of branches) {
            logger.log(branch.name)
        }
    }
}
```

## 实现`init`命令行
实现`quick init <template-name> <project-name>`命令
1. [模板下载](##模板下载)到指定目录
2. 创建子进程[child_process](http://nodejs.cn/api/child_process.html)到指定目录安装依赖

### 封装子进程函数
使其支持`promise`，并且能够将信息返回至主进程
```js
const { spawn } = require('child_process');

module.exports.spawn = async (...args) => {
    const subprocess = spawn(...args);
    return new Promise((reslove) => {
        // 将子进程的输入信息流pipe到主进程
        subprocess.stdout.pipe(process.stdout)
        subprocess.stderr.pipe(process.stderr)
        subprocess.stderr.on('close', () => {
            reslove()
        });
    })
}

```

### 实现`init`方法
```js
const download = require('../lib/download')
const logger = require('../lib/logger')
const { spawn } = require('../lib/spawn')
const path = require('path')

module.exports = async (templateName, name) => {
    logger.clear()
    logger.log('开始创建项目' + name)
    // 下载模板到指定目录
    await download(templateName, name)
    logger.success('创建项目完成')

    logger.log('开始安装依赖')
    const npm = process.platform === "win32" ? "cnpm.cmd" : "cnpm"
    const args = ['install']
    const projectPath = path.resolve('./' + name)
    console.log(projectPath)
    await spawn(npm, args, {
        cwd: projectPath
    });

    logger.success(`
    安装完成
    ——————————————————
    To start
        cd ${name}
        npm run server
    ——————————————————
    `)
}
```
:::tip   
`Error: spawn cnpm ENOENT`报错原因及[解决方法](https://github.com/nodejs/node/issues/3675)。
出现该问题的原因是`node`在`windows`执行`process`是`cnpm.cmd`，所以需要区分执行环境`const npm = process.platform === "win32" ? "cnpm.cmd" : "cnpm"`即可。  
:::

## 测试