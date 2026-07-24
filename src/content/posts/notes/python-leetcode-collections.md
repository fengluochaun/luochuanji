---
title: Python 数据结构
description: 刷题与竞赛里怎么选、怎么改结构：内置四件套、链表树图并查集表示法、复杂度与引用陷阱。
pubDatetime: 2026-07-24T10:01:00+08:00
modDatetime: 2026-07-24T12:00:00+08:00
tags:
  - Python
  - LeetCode
  - 算法
  - 语法笔记
---

> **系列：Python 语法笔记**  
> [① 基础与惯用法](/posts/notes/python-leetcode-syntax/) · [② 数据结构](/posts/notes/python-leetcode-collections/) · [③ 标准库与速查](/posts/notes/python-leetcode-stdlib-cheatsheet/)

上一篇补齐了切片、控制流与函数。下一步卡点通常是：**该用 list 还是 dict？set 里能不能塞坐标？二维数组为什么一改全乱？链表树在 Python 里怎么写？** 本篇覆盖内置四件套，以及刷题里常见的「用 Python 表示」的结构；双端队列和堆见第 3 篇。

## 怎么选结构（决策表）

| 你需要… | 优先用 | 备注 |
|---------|--------|------|
| 按下标随机读写、有序序列 | `list` | 数组、栈（尾部） |
| 键 → 值 映射、计数 | `dict` | 平均 O(1) 查改 |
| 去重、只关心「在不在」 | `set` | 成员检测平均 O(1) |
| 不可变、可作键/集合元素 | `tuple` | 坐标、多值键 |
| 队头队尾都要 O(1) | `deque` | 第 3 篇 |
| 反复取最小/最大 | `heapq` | 第 3 篇 |
| 有序序列 + 二分位置 | 排序 `list` + `bisect` | 第 3 篇 |
| 小写字母 / 小范围整数频次 | 定长 `list` | 如长度 26 / 101 |
| 链表 / 二叉树 | 自定义节点类 | 平台常预置 |
| 图 | `dict[list]` 邻接表 | 稠密小图也可用邻接矩阵 |
| 连通分量合并 | 并查集（父数组） | 见下文模板 |

没有银弹：先保证语义对，再谈常数（例如小写字母频次用 `list` 往往比 `dict` 更快）。

## list：数组、栈，偶尔冒充队列

### 当数组

```python file="list_array.py"
a = [0] * n          # n 个 0；元素不可变时安全
a = list(range(n))
a[i] = x
for x in a: ...
for i in range(len(a)): ...
for i, x in enumerate(a): ...
```

### 当栈（尾部）

```python file="list_stack.py"
st = []
st.append(x)     # push  O(1)
x = st.pop()     # pop   O(1)
if st:
    top = st[-1] # peek
```

### 当队列？谨慎

```python
q = []
q.append(x)
q.pop(0)         # 队头弹出，O(n) —— 会超时
```

真正的队列 / 双端操作用 `collections.deque`（第 3 篇）。

### 多维初始化（必看）

```python file="grid_init.py"
m, n = 3, 4

# 正确：每一行是新列表
grid = [[0] * n for _ in range(m)]

# 三维
dp = [[[0] * k for _ in range(n)] for _ in range(m)]

# 错误：m 行共享同一行对象
# bad = [[0] * n] * m
```

> [!WARNING]
> `[[0] * n] * m` 里，外层 `* m` 复制的是**引用**。执行 `bad[0][0] = 1` 后，每一行的第 0 列都会变成 1。矩阵 / 二维 DP 里这是高频翻车点。

对**不可变**元素，`[0] * n` 没问题；元素是 list/dict 时，必须用推导式逐个新建。

### 遍历时增删

在 `for x in a` 时对 `a` 增删，行为容易乱：

```python
# 倒序按下标删
for i in range(len(a) - 1, -1, -1):
    if should_remove(a[i]):
        a.pop(i)

# 或过滤生成新列表
a = [x for x in a if keep(x)]

# 用写指针原地压缩（常用技巧）
w = 0
for x in a:
    if keep(x):
        a[w] = x
        w += 1
# 有效区间 a[:w]
```

### 其它常用操作

```python
a *= 2                 # 重复；若元素可变同样有引用问题
a[i:j] = iterable      # 切片替换
a.clear()
min(a), max(a), sum(a)
```

## dict：映射与计数

```python file="dict_basic.py"
d = {}
d = {"a": 1, "b": 2}
d = dict(a=1, b=2)
d = dict(zip(keys, vals))

d[key] = value
d.get(key)            # 无则 None
d.get(key, 0)         # 无则 0
d.setdefault(key, []) # 无则写入默认并返回
key in d              # 平均 O(1)
d.pop(key)            # 无则 KeyError
d.pop(key, None)
del d[key]
d.update(other)
d | other             # 3.9+ 合并，右侧覆盖
d |= other            # 原地
```

### 计数模式

```python
cnt = {}
for x in nums:
    cnt[x] = cnt.get(x, 0) + 1
```

`Counter` / `defaultdict(int)` 见第 3 篇；手写 `get` 不依赖 import，面试口述也够用。

### 遍历与顺序

```python
for k in d:
    ...
for k, v in d.items():
    ...
for v in d.values():
    ...
```

Python 3.7+ `dict` **保留插入顺序**。一般不必 `OrderedDict`（除非要 `move_to_end` 做 LRU）。

### 邻接表（图）

```python
from collections import defaultdict

g = defaultdict(list)
for u, v in edges:
    g[u].append(v)
    g[v].append(u)   # 无向；有向只写一边

# 带权
g = defaultdict(list)
g[u].append((v, w))
```

不用 `defaultdict`：

```python
g = {}
for u, v in edges:
    g.setdefault(u, []).append(v)
```

稠密图、下标从 0 连续时也可用邻接矩阵：

```python
g = [[0] * n for _ in range(n)]
g[u][v] = 1  # 或权值
```

### 键必须可哈希

```python
d[(0, 1)] = "ok"
# d[[0, 1]] = "no"   # TypeError
```

值为 list/dict 完全可以；**键**不行。嵌套 dict 常见于「二维键」懒得写 tuple 时：

```python
dp = {}
dp[(i, j)] = val
# 或
dp = defaultdict(dict)
dp[i][j] = val
```

## set：去重与成员检测

```python file="set_basic.py"
s = set()
s = {1, 2, 3}
s = set(nums)
s.add(x)
s.discard(x)      # 无也不报错
s.remove(x)       # 无则 KeyError
s.pop()           # 任意弹出
x in s            # 平均 O(1)
s.clear()
```

集合运算：

```python
a | b      # 并   a.union(b)
a & b      # 交   a.intersection(b)
a - b      # 差
a ^ b      # 对称差
a <= b     # 子集
a >= b     # 超集
a |= b     # 原地并
```

### 去重保序

```python
uniq = list(dict.fromkeys(nums))  # 3.7+ 保插入序
uniq = list(set(nums))            # 不保序
```

### frozenset

不可变集合，可作 dict 键或放入另一个 set（状态压缩前「集合当状态」时）：

```python
fs = frozenset([1, 2, 3])
seen_states.add(fs)
```

## tuple：打包、交换、当键

```python file="tuple_basic.py"
t = (1, 2, 3)
t = 1, 2, 3
single = (1,)         # 单元素必须有逗号
a, b = b, a
r, c = cell
```

坐标、区间、多关键字排序键几乎总是 tuple：

```python
seen.add((r, c))
dist[(r, c)] = d
pairs.sort(key=lambda p: (p[0], -p[1]))
```

`namedtuple` / `typing.NamedTuple` 可读性更好，刷题可选：

```python
from collections import namedtuple
Point = namedtuple("Point", "x y")
p = Point(1, 2)
p.x, p.y
```

tuple 本身不可变；若元素是 list，**内容仍可改**——当键时元素必须也可哈希。

## 复杂度速查（平均情况）

| 操作 | list | dict | set |
|------|------|------|-----|
| 按下标访问 / 改 | O(1) | — | — |
| 按键访问 / 改 | — | O(1) | — |
| 尾部 append / pop | O(1) | — | — |
| 头部 insert / pop(0) | O(n) | — | — |
| 任意位置 insert / 删除 | O(n) | O(1) 按键 | O(1) 按值 |
| 成员 `x in ...` | O(n) | O(1) 键 | O(1) |
| 找最小/最大 | O(n) | O(n) | O(n) |
| 迭代全部 | O(n) | O(n) | O(n) |

> [!NOTE]
> 「平均 O(1)」依赖哈希；最坏可退化。需要有序或反复取最值时：排序 + `bisect`，或 `heapq`（第 3 篇）。

## 引用与别名陷阱

```python file="alias.py"
a = [1, 2, 3]
b = a
b.append(4)       # a 同步变

def f(xs):
    xs.append(0)  # 调用方列表被改

f(a)
```

独立副本：

```python
b = a[:]
b = a.copy()
b = list(a)

import copy
b = copy.deepcopy(a)  # 嵌套结构；刷题较少
```

矩阵「复制一行」：

```python
row2 = row[:]           # 一行浅拷贝
grid2 = [r[:] for r in grid]
```

## 链表（ListNode）

LeetCode 常见定义：

```python file="list_node.py"
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

常用手法：

```python
# 哑节点，统一头插/删除
dummy = ListNode(0, head)
cur = dummy
while cur.next:
    ...
return dummy.next

# 遍历
cur = head
while cur:
    # cur.val
    cur = cur.next

# 由数组建链表（本地测）
def build(arr):
    dummy = ListNode()
    cur = dummy
    for x in arr:
        cur.next = ListNode(x)
        cur = cur.next
    return dummy.next
```

快慢指针、反转链表等是**算法模板**，此处只保证你会写节点与遍历。

## 二叉树（TreeNode）

```python file="tree_node.py"
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

递归遍历骨架（语法层面）：

```python
def dfs(node):
    if not node:
        return
    # 前序：先访问 node.val
    dfs(node.left)
    # 中序
    dfs(node.right)
```

层序需队列（第 3 篇 `deque`）：

```python
from collections import deque

q = deque([root])
while q:
    node = q.popleft()
    if node.left:
        q.append(node.left)
    if node.right:
        q.append(node.right)
```

N 叉树常用 `children: list[Node]`。

## 并查集（Disjoint Set）

用两个 list 即可，无需额外库：

```python file="union_find.py"
parent = list(range(n))
rank = [0] * n          # 或 size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]  # 路径压缩
        x = parent[x]
    return x

def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False
    if rank[ra] < rank[rb]:
        ra, rb = rb, ra
    parent[rb] = ra
    if rank[ra] == rank[rb]:
        rank[ra] += 1
    return True
```

## 差分数组 / 前缀和（数组技巧）

语法上就是 list，记模板形状：

```python
# 前缀和：pre[i] = sum(a[:i])  长度 n+1
pre = [0] * (n + 1)
for i, x in enumerate(a):
    pre[i + 1] = pre[i] + x
# 区间和 [l, r) = pre[r] - pre[l]

# 差分：区间 +val，最后还原
diff = [0] * (n + 1)
diff[l] += val
diff[r] -= val
cur = 0
for i in range(n):
    cur += diff[i]
    a[i] = cur
```

二维前缀和同理，用 `pre[i+1][j+1]` 的 list 矩阵。

## 与题型的对应（只索引，不讲解法）

| 场景直觉 | 常用结构 |
|----------|----------|
| 下标映射、前缀、差分 | list |
| 值 → 下标 / 频次 | dict / `Counter` |
| 字母/小范围整数频次 | 定长 list |
| 是否访问过 | set，元素 `(i,j)` 或 id |
| 单调栈、路径栈 | list 尾部 |
| 图邻接 | `defaultdict(list)` |
| 队头弹出 / BFS | `deque` |
| 第 K 大 / 合并最优 | `heapq` |
| 有序插位置 | 排序 list + `bisect` |
| 连通性 / 动态合并 | 并查集 |
| 链表 / 树 | `ListNode` / `TreeNode` |

算法骨架（窗口怎么缩、DP 怎么推）不在本系列；这里保证**容器与表示法正确、复杂度心里有数**。

## 本篇速查

| 需求 | 写法 |
|------|------|
| 栈 | `st.append` / `st.pop` / `st[-1]` |
| 安全计数 | `d[x] = d.get(x, 0) + 1` |
| 成员 O(1) | `x in set_or_dict` |
| 二维 0 矩阵 | `[[0]*n for _ in range(m)]` |
| 坐标入哈希 | `(r, c)` |
| 去重保序 | `list(dict.fromkeys(a))` |
| 交换 | `a, b = b, a` |
| 浅拷贝列表 / 矩阵 | `a[:]` / `[r[:] for r in g]` |
| 哑节点链表 | `dummy = ListNode(0, head)` |
| 并查集 find | 路径压缩循环 / 递归 |
| 集合并交差 | `\|` `&` `-` |
| 图邻接 | `defaultdict(list)` |

## 上一篇 · 下一篇

← [① 基础与惯用法](/posts/notes/python-leetcode-syntax/)

内置与自建结构够用后，把标准库里刷题频率最高的 API 收成可粘贴片段：`deque`、`Counter`、`heapq`、`bisect`、`itertools`、记忆化等。

→ [③ Python 刷题标准库与速查表](/posts/notes/python-leetcode-stdlib-cheatsheet/)
