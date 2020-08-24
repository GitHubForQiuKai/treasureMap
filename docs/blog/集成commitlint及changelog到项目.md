---
title: 集成commitlint及changelog到项目
date: 2019-08-16
sidebar: 'auto'
categories:
 - 规范
tags:
 - 代码规范
publish: true
---


## 安装commit工具
1.  安装`commitizen/cz-cli`, 我们需要借助它提供的 `git cz` 命令替代我们的 `git commit` 命令, 帮助我们生成符合规范的 `commit message`.

```sh
npm i -D commitizen cz-conventional-changelog
yarn add-D commitizen cz-conventional-changelog
```
2. 在`package.json`添加
```js
"script": {
    ...,
    "commit": "git-cz",
},
 "config": {
    "commitizen": {
      "path": "node_modules/cz-conventional-changelog"
    }
  }
```
那么在对应的项目中执行 `git cz` 或  `npm run commit` 来提交规范的`commit`

img

## Commitlint及husky
1. 安装`Commitlint`，校验你的 message

```sh
npm i -D husky @commitlint/config-conventional @commitlint/cli
yarn add husky @commitlint/config-conventional @commitlint/cli -D
```

2. 在项目中新建`commitlint.config.js`
```js
module.exports = { extends: ['@commitlint/config-conventional'] }
```

3. `commitlint`负责用于对`commit message`进行格式校验，`husky`负责提供更易用的`git hook`。  

在`package.json`添加
```js
"husky": {
    "hooks": {
      "commit-msg": "commitlint -E $HUSKY_GIT_PARAMS"    }
}
```

4. 执行`git cz`进入`interactive`模式，根据提示依次填写
```sh
1.Select the type of change that you're committing 选择改动类型 (<type>)

2.What is the scope of this change (e.g. component or file name)? 填写改动范围 (<scope>)

3.Write a short, imperative tense description of the change: 写一个精简的描述 (<subject>)

4.Provide a longer description of the change: (press enter to skip) 对于改动写一段长描述 (<body>)

5.Are there any breaking changes? (y/n) 是破坏性修改吗？默认n (<footer>)

6.Does this change affect any openreve issues? (y/n) 改动修复了哪个问题？默认n (<footer>)
```
最终生成
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

- `scope` 指 `commit` 的范围（哪些模块进行了修改）
- `subject` 指 `commit` 的简短描述
- `body` 指 `commit` 主体内容（长描述）
- `footer` 指 `commit footer` 信息
- `type` 指当前 `commit` 类型，一般有下面几种可选类型：
```sh
# 主要type
feat:     增加新功能
fix:      修复bug

# 特殊type
docs:     只改动了文档相关的内容
style:    不影响代码含义的改动，例如去掉空格、改变缩进、增删分号
build:    构造工具的或者外部依赖的改动，例如webpack，npm
refactor: 代码重构时使用
revert:   执行git revert打印的message

# 暂不使用type
test:     添加测试或者修改现有测试
perf:     提高性能的改动
ci:       与CI（持续集成服务）有关的改动
chore:    不修改src或者test的其余修改，例如构建过程或辅助工具的变动
```

## `standard-version`，自动生成 `CHANGELOG`
在使用上文 `commit` 规范的情况下， 可以通过 `standard-version` 自动生成 `changelog`，并更新项目的版本信息添加 `git tag` `changelog` 中将收录所有 `type` 为 `feat` 和 `fix` 的 `commit`。

### 安装和配置
1、安装`standard-version`
```sh
npm i -D standard-version
yarn add -D standard-version
```
2、修改`package.json`
```js
{
  "scripts": {
      "release": "standard-version"
  }
}
```
版本发布流程


