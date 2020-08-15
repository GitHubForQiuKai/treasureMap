# Vue批量异步更新策略

##
更新时会根据watcher的id判断是否要推入queueWatcher更新队列，即，相关的更新只会入队列一次