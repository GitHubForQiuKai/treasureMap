# 介绍

## 常见命令
### git rebase 变基
```shell
git rebase -i HEAD~3 # 以命令行交互形式打开最近3个commit；也可以指定到具体的commitid
git rebase --continue # 当处理完冲突后，可以使用该命令让rebase继续
git add . # 保存这次操作，然后继续git rebase --continue

git rebase --abort # 终止当前rebase
```

### 拉取所有远程分支到本地
```sh
git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
git fetch --all
git pull --all
```