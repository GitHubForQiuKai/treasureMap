# explain

## 基本介绍
explain一般用于select语句的性能分析，explain显示了mysql如何使用索引来处理select语句以及连接表。可以帮助选择更好的索引和写出更优化的查询语句。

使用
``` sql
explain select * from table
```

返回

| 字段 | 说明 |
| ------ | ------ |
| id | 执行顺序 |
| select_type | 查询类型 |
| table | 查询的表 |
| partitions | 分区表命中的分区情况 |
| type | 查找行的访问类型 |
| possible_keys | 可能使用的索引 |
| key | 最终使用的索引 |
| key_len | 索引的长度 |
| ref | 显示使用哪个列或常数与key一起从表中选择行 |
| rows | 估算找到所需的记录所需要读取的行数 |
| filtered | 显示了通过条件过滤出的行数的百分比估计值 |
| Extra | 查询的详细信息 |

## id
表示查询中执行select子句或操作表的顺序。
1. id值越大，优先级越高，越先执行
2. id相同，执行顺序由上至下

## select_type
select_type数据列指明各“单位select 查询”的查询类型，select_type数据列的列值如下所示:
### SIMPLE  
简单的SELECT语句(不包括UNION操作或子查询操作)
```sql
select * from user where name='张三'
```

### PRIMARY / UNION
1. PRIMARY  
在进行union或包含子查询的查询时，位于最外层的select_type为primary（有且只有一个）；
2. UNION  
除第一个外，第二个以后的所有select查询的select_type都为union（与外层的没有依赖关系），union的第一个单位select的select_type不是union，而是DERIVED。它是一个临时表，用于存储联合（Union）后的查询结果。


### DEPENDENT UNION / UNION RESULT  
1. DEPENDENT UNION  
UNION操作中,查询中处于内层的SELECT(内层的SELECT语句与外层的SELECT语句有依赖关系)
2. UNION RESULT  
UNION操作的结果,id值通常为NULL

### SUBQUERY / DEPENDENT SUBQUERY  
1. SUBQUERY  
子查询中首个SELECT(如果有多个子查询存在):
2. DEPENDENT SUBQUERY  
子查询中首个SELECT,但依赖于外层的表(如果有多个子查询存在)

### DERIVED / MATERIALIZED  
1. DERIVED  
被驱动的SELECT子查询(子查询位于FROM子句)
2. MATERIALIZED  
被物化的子查询

### UNCACHEABLE SUBQUERY / UNCACHEABLE UNION
1. UNCACHEABLE SUBQUERY  
对于外层的主表,子查询不可被物化,每次都需要计算(耗时操作)
2. UNCACHEABLE UNION  
UNION操作中,内层的不可被物化的子查询(类似于UNCACHEABLE SUBQUERY)

## type
| 值 | 说明 |
| ------ | ------ |
| all | 全表扫描 |
| index | 索引全扫描 |
| range | 索引范围扫描，常用语<,<=,>=,between等操作 |
| ref | 使用非唯一索引扫描或唯一索引前缀扫描，返回单条记录，常出现在关联查询中 |
| eq_ref | 类似ref，区别在于使用的是唯一索引，使用主键的关联查询 |
| const | 表最多只有一行匹配，通用用于主键或者唯一索引比较时 |
| system | 表只有一行数据 |

性能从好到差，依次为
system > const > eq_ref > ref > range > index > all

## key_len
用于在使用联合索引时，根据最左匹配原则，确定其使用的索引字段个数。
计算规则为：
1. 一般地，key_len 等于索引列类型字节长度，例如int类型为4-bytes，bigint为8-bytes；
2. 如果是字符串类型，还需要同时考虑字符集因素，例如：CHAR(30) UTF8则key_len至少是90-bytes；
3. 若该列类型定义时允许NULL，其key_len还需要再加 1-bytes；
4. 若该列类型为变长类型，例如 VARCHAR（TEXT\BLOB不允许整列创建索引，如果创建部分索引，也被视为动态列类型），其key_len还需要再加 2-bytes;
5. 不同的字符集，一个字符占用的字节数不同。latin1编码的，一个字符占用一个字节，gbk编码的，一个字符占用两个字节，utf8编码的，一个字符占用三个字节。

| 列类型 | KEY_LEN | 说明 |
| ------ | --------- | --- |
| int | 4 + 1 | 允许NULL，加1-byte |
| int not null | 4 | 不允许NULL |
| char(30) utf8 | 30 * 3 + 1 | 允许NULL，加1-byte |
| varchar(30) not null utf8 | 30 * 3 + 2 | 动态列类型，加2-bytes |
| varchar(30) utf8 | 30 * 3 + 2 + 1 | 动态列类型，加2-bytes；允许NULL，再加1-byte |
| text(10) utf8 | 30 * 3 + 2 + 1 | TEXT列截取部分，被视为动态列类型，加2-bytes；且允许NULL |

备注：key_len 只指示了WHERE中用于条件过滤时被选中的索引列，是不包含 ORDER BY/GROUP BY 这部分被选中的索引列。

## extra
using index 和using where只要使用了索引我们基本都能经常看到，而using index condition则是在mysql5.6后新加的新特性，简单来说，mysql开启了ICP的话，可以减少存储引擎访问基表的次数。

| 值 | 说明 |
| ------ | ------ |
| using index | 使用覆盖索引的时候就会出现 |
| using index & using where | 查找使用了索引，但是需要的数据都在索引列中能找到，所以不需要回表查询数据 |
| using where | 在查找使用索引的情况下，需要回表去查询所需的数据 |
| using index condition | 查找使用了索引，但是需要回表查询数据 |
| using Filesort	| 表示MySQL需额外排序操作, 不能通过索引顺序达到排序效果 |
效率从高到低依次为：
using index > using index & using where > using where > using index condition > using Filesort
