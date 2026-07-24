---
title: Python 标准库与速查表
description: collections、heapq、bisect、math、itertools、functools、string、random、array 等刷题/竞赛高频 API，附可复制片段与总速查。
pubDatetime: 2026-07-24T10:02:00+08:00
modDatetime: 2026-07-24T12:00:00+08:00
tags:
  - Python
  - LeetCode
  - 算法
  - 语法笔记
---

> **系列：Python 语法笔记**  
> [① 基础与惯用法](/posts/notes/python-leetcode-syntax/) · [② 数据结构](/posts/notes/python-leetcode-collections/) · [③ 标准库与速查](/posts/notes/python-leetcode-stdlib-cheatsheet/)

前两篇解决了「语法怎么写」和「容器/节点怎么表示」。本篇把刷题与竞赛里真正反复出现的**标准库 API**收成可粘贴片段，文末有总表和本地模板。仍然**不讲**算法套路本身，只讲工具。

## import 清单（开篇可贴）

按需取用，不必一次全导：

```python file="imports.py"
from collections import deque, Counter, defaultdict, namedtuple, OrderedDict
import heapq
import bisect
import math
import sys
import string
import random
import copy
from array import array
from functools import cache, lru_cache, cmp_to_key, reduce
from itertools import (
    accumulate,
    pairwise,
    combinations,
    combinations_with_replacement,
    permutations,
    product,
    chain,
    groupby,
    islice,
    repeat,
    cycle,
    zip_longest,
)
```

## collections

### deque：双端队列 / BFS 队列

两端增删 **O(1)**。列表 `pop(0)` 是 O(n)。

```python file="deque_demo.py"
from collections import deque

q = deque()
q.append(1)         # 右入
q.appendleft(0)     # 左入
q.pop()             # 右出
q.popleft()         # 左出 —— BFS 常用

q = deque([1, 2, 3], maxlen=3)  # 定长；再 append 会挤掉另一端
q.rotate(1)         # 右旋
q.rotate(-1)        # 左旋
len(q), q[0], q[-1]
q.extend([4, 5])
q.extendleft([0])   # 注意：逐个左插，顺序会反
```

典型用途：BFS、滑动窗口辅助、单调队列容器、简易 LRU 的顺序端。

> [!NOTE]
> `deque` 支持下标，但**中间**插入/删除是 O(n)。当双端队列用，不要当随机数组用。

### Counter：计数

```python file="counter_demo.py"
from collections import Counter

c = Counter("aabbc")
c["a"]                  # 2；缺失键返回 0
c["z"]                  # 0
c.most_common(2)
c.total()               # 3.10+ 元素总数
list(c.elements())      # 按计数展开

c2 = Counter(a=1, b=2)
c + c2                  # 相加
c - c2                  # 相减，只留正计数
c & c2                  # 交（取 min）
c | c2                  # 并（取 max）
c.update("aa")          # 累加
c.subtract("a")         # 可减成 0 或负
```

### defaultdict：缺省工厂

```python file="defaultdict_demo.py"
from collections import defaultdict

g = defaultdict(list)
g[1].append(2)

cnt = defaultdict(int)
cnt["a"] += 1

groups = defaultdict(set)
nested = defaultdict(lambda: defaultdict(int))
```

### OrderedDict

3.7+ 普通 `dict` 已保插入序。需要 `move_to_end` 时再上：

```python
from collections import OrderedDict

od = OrderedDict()
od["a"] = 1
od.move_to_end("a")           # 移到末尾
od.move_to_end("a", last=False)  # 移到开头
od.popitem(last=False)        # FIFO 弹出
```

手写 LRU 可用 `OrderedDict`，或 `functools.lru_cache`（函数记忆化）。

### namedtuple

见第 2 篇；轻量不可变记录。

## heapq：优先队列（堆）

**最小堆**，底层是 `list`。

```python file="heapq_demo.py"
import heapq

h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappop(h)        # 1
h[0]                    # 堆顶

a = [3, 1, 4, 1, 5]
heapq.heapify(a)        # O(n) 原地

heapq.nlargest(3, a)
heapq.nsmallest(2, a)
heapq.heappushpop(h, x) # 先推再弹，常比 push+pop 紧
heapq.heapreplace(h, x) # 先弹再推（堆非空）
```

### 最大堆：取负

```python
max_h = []
heapq.heappush(max_h, -x)
val = -heapq.heappop(max_h)
```

### 元组优先级与懒删除

```python
seq = 0
heapq.heappush(h, (dist, seq, node))
seq += 1
# 优先级相同则比 seq，避免比较不可比载荷

# 懒删除：过期项弹出时跳过
while h and outdated(h[0]):
    heapq.heappop(h)
```

> [!WARNING]
> 不要直接改堆中间元素。应推入新版本或懒删除。

## bisect：有序序列上的二分

```python file="bisect_demo.py"
import bisect

a = [1, 3, 3, 5, 7]
bisect.bisect_left(a, 3)     # 1  第一个 >= 3
bisect.bisect_right(a, 3)    # 3  第一个 > 3
bisect.bisect(a, 3)          # 同 right

bisect.insort(a, 4)          # 插入并保持有序（搬移 O(n)）
bisect.insort_left(a, 3)
bisect.insort_right(a, 3)

# key= 参数 3.10+；对大数组反复 bisect 时，
# 更常见是自己维护平行的 keys 列表
```

「二分答案 / 边界怎么写」是算法模板；这里只记 API。

## math 与数字

```python file="math_demo.py"
import math

math.inf, -math.inf
math.nan
math.gcd(12, 18)           # 6；多参 3.9+ math.gcd(a,b,c)
math.lcm(4, 6)             # 12（3.9+）
math.isqrt(10)             # 3
math.sqrt(10)
math.ceil(2.1), math.floor(2.9), math.trunc(-2.9)
math.fabs(-3.5)
math.comb(5, 2)            # C(5,2)
math.perm(5, 2)            # P(5,2)
math.factorial(10)
math.log(8, 2), math.log2(8), math.log10(100)
math.pow(2, 10)            # 浮点；整数幂用 ** 或 pow
math.dist((0, 0), (3, 4))  # 欧氏距离 5.0（3.8+）
math.hypot(3, 4)           # 5.0
math.sin / cos / atan2
math.pi, math.e
```

模幂与逆元（竞赛）：

```python
pow(a, b, MOD)             # 模幂
pow(a, MOD - 2, MOD)       # 费马小定理求 a 在模质数下的逆元
```

```python
MOD = 10**9 + 7
ans = (ans + x) % MOD
ans = ans * x % MOD
ans = (ans % MOD + MOD) % MOD  # 保证非负
```

## itertools

```python file="itertools_demo.py"
from itertools import (
    accumulate, pairwise, combinations, combinations_with_replacement,
    permutations, product, chain, groupby, islice, zip_longest, count, cycle,
)

list(accumulate([1, 2, 3, 4]))                # 前缀和
list(accumulate([1, 2, 3, 4], lambda x, y: x * y))  # 前缀积等
list(pairwise([1, 2, 3, 4]))                  # 3.10+

list(combinations([1, 2, 3], 2))              # 组合
list(combinations_with_replacement([1, 2], 2))
list(permutations([1, 2, 3], 2))              # 排列
list(product([0, 1], repeat=3))               # 笛卡尔积 / 二进制枚举
list(product("AB", "12"))                     # A1 A2 B1 B2

list(chain([1, 2], [3, 4]))
list(chain.from_iterable([[1, 2], [3]]))

# groupby：需先按同一 key 排序
rows = sorted(pairs, key=lambda x: x[0])
for k, g in groupby(rows, key=lambda x: x[0]):
    group = list(g)

list(islice(iterable, 10))                    # 前 10 个
list(zip_longest(a, b, fillvalue=0))
```

小数据枚举可用 `product` / `permutations`；大数据搜索一般手写 DFS。

## functools

```python file="cache_demo.py"
from functools import cache, lru_cache, cmp_to_key, reduce

@cache
def dfs(i, j):
    ...

@lru_cache(maxsize=None)   # 同 cache
def dfs2(i):
    ...

# 清缓存（换测试用例时偶用）
dfs.cache_clear()

reduce(lambda acc, x: acc + x, nums, 0)
```

`@cache` 参数必须可哈希。类方法上记忆化要小心 `self` 不可哈希——常用内部嵌套函数 + `@cache`，或把状态做成参数元组。

```python
# 比较函数转 key（极少用）
from functools import cmp_to_key

def cmp(a, b):
    return (a > b) - (a < b)

arr.sort(key=cmp_to_key(cmp))
```

## 排序补充

```python file="sort_key.py"
pairs.sort(key=lambda p: (p[0], -p[1]))
words.sort(key=len)
words.sort(key=str.lower)

# 稳定排序：键相同时保留相对次序
# list.sort / sorted 都是稳定的

# 返回新列表
b = sorted(a, key=abs, reverse=True)
```

## 进制、位运算

```python file="bits.py"
int("1010", 2)      # 10
int("ff", 16)
bin(10)             # '0b1010' → bin(10)[2:]
oct(8), hex(255)
format(10, "b")     # 无前缀二进制
format(10, "032b")  # 定宽

x & y
x | y
x ^ y
~x                  # 等价 -x-1（无限位）
x << k
x >> k

x & 1               # 奇偶
x & (x - 1)         # 去掉最低位 1
x & -x              # 只留最低位 1
x.bit_count()       # 1 的个数（3.10+）
x.bit_length()      # 二进制位数
```

状态压缩枚举：

```python
for mask in range(1 << n):
    if mask >> i & 1:
        # i 在集合中
        ...
```

## string / 字符表

```python
import string

string.ascii_lowercase   # 'abcd...z'
string.ascii_uppercase
string.digits
string.ascii_letters
string.hexdigits
```

## random（测数据 / 随机化算法）

```python
import random

random.seed(0)            # 可复现
random.randint(a, b)      # 闭区间
random.randrange(n)
random.random()           # [0,1)
random.choice(seq)
random.shuffle(a)         # 原地洗牌
random.sample(pop, k)     # 不放回抽样
```

## array（紧凑数值数组，竞赛省内存偶用）

```python
from array import array

a = array("i", [1, 2, 3])  # 有符号 int
a.append(4)
a[0]
# typecode: 'i' int, 'q' long long, 'd' double, 'b' signed char ...
```

多数题直接 `list` 即可；内存紧或超大数组时再考虑。

## copy

```python
import copy

copy.copy(obj)       # 浅拷贝
copy.deepcopy(obj)   # 深拷贝
```

列表矩阵优先 `a[:]` / `[r[:] for r in g]`，不必每次 `deepcopy`。

## sys 杂项

```python
import sys

input = sys.stdin.readline
sys.setrecursionlimit(1_000_000)
sys.stdout.write(s)
print(sys.maxsize)          # 平台相关大整数；比「无穷」更少用
sys.exit(0)
```

## 一页总速查表

| 场景 | 推荐写法 |
|------|----------|
| BFS 队列 | `q = deque([start]); q.popleft()` |
| 栈 | `st.append` / `st.pop` |
| 计数 | `Counter` / `d[x]=d.get(x,0)+1` |
| 邻接表 | `defaultdict(list)` |
| 最小堆 / 最大堆 | `heappush/pop`；最大堆存 `-x` |
| 第 k 大 | `nlargest` 或大小为 k 的堆 |
| 有序插位置 | `bisect_left` / `bisect_right` |
| 前缀和 | `list(accumulate(a))` |
| 笛卡尔积 / 枚举子集 | `product` / `for mask in range(1<<n)` |
| 记忆化递归 | `@cache` 包内部函数 |
| 多键排序 | `key=lambda x: (x[0], -x[1])` |
| 二维初始化 | `[[0]*n for _ in range(m)]` |
| 坐标哈希 | `(r, c)` |
| 无穷大 | `math.inf` |
| 模幂 / 逆元 | `pow(a,b,MOD)` / `pow(a,MOD-2,MOD)` |
| 取模非负 | `(x%MOD+MOD)%MOD` |
| 拼串 | `"".join(parts)` |
| 去重保序 | `list(dict.fromkeys(a))` |
| 快读 | `sys.stdin.readline` |
| 深递归 | `sys.setrecursionlimit` |
| 字母表 | `string.ascii_lowercase` |
| 造数据 | `random.seed` + `randint/shuffle` |

## 本地最小模板

### LeetCode 函数接口

```python file="template_lc.py"
from collections import deque, Counter, defaultdict
import heapq
import bisect
import math
from functools import cache


class Solution:
    def solve(self, nums: list[int]) -> int:
        return 0


if __name__ == "__main__":
    s = Solution()
    tests = [
        ([1, 2, 3], 0),
    ]
    for args, expect in tests:
        got = s.solve(args)
        assert got == expect, (args, got, expect)
    print("ok")
```

多参数：`tests = [((a, b), expect), ...]`，调用 `s.solve(*args)`。

### 竞赛读写

```python file="template_contest.py"
import sys
from collections import deque, defaultdict, Counter
import heapq
import bisect
import math

input = sys.stdin.readline


def main():
    n = int(input())
    a = list(map(int, input().split()))
    print(sum(a))


if __name__ == "__main__":
    main()
```

← [① 基础与惯用法](/posts/notes/python-leetcode-syntax/) · [② 数据结构](/posts/notes/python-leetcode-collections/)
