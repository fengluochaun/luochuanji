---
title: Python 语法：基础与惯用法
description: 面向 LeetCode / 竞赛 / 面试的 Python 语法手册：数字字符串、切片、控制流、函数、推导式、解包、类型注解与本地调试。
pubDatetime: 2026-07-24T10:00:00+08:00
modDatetime: 2026-07-24T12:00:00+08:00
tags:
  - Python
  - LeetCode
  - 算法
  - 语法笔记
---

> **系列：Python 语法笔记**  
> [① 基础与惯用法](/posts/notes/python-leetcode-syntax/) · [② 数据结构](/posts/notes/python-leetcode-collections/) · [③ 标准库与速查](/posts/notes/python-leetcode-stdlib-cheatsheet/)

刷算法题时，卡住的往往不是「完全不会编程」，而是：**这句语法怎么写、切片包不包含右端、字典怎么安全取值、递归会不会爆栈**。本系列只补**写代码需要的语法与数据结构**，覆盖 LeetCode 全站、常见竞赛（AtCoder / Codeforces 用 Python）与面试手写，**不讲**双指针、DP 转移等解题套路本身。

| 篇 | 内容 |
|----|------|
| ① 本篇 | 提交形态、数字/字符串/字节、列表与切片、控制流、函数与解包、推导式、迭代工具、比较哈希、异常与调试 |
| ② | list / dict / set / tuple、链表树图并查集等结构定义、复杂度与引用陷阱 |
| ③ | `collections` / `heapq` / `bisect` / `math` / `itertools` / `functools` 等标准库与总速查 |

默认环境：**Python 3.10+**（LeetCode 当前主流；竞赛常见 3.11/3.12）。类型注解优先内置泛型 `list[int]`；旧环境用 `from typing import List` 写 `List[int]`。

## 提交代码的基本形态

### LeetCode 风格（函数接口）

平台调用你的方法，一般**不用**自己读 `input`：

```python file="solution_shape.py"
from typing import Optional

class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        return []


if __name__ == "__main__":
    s = Solution()
    assert s.twoSum([2, 7, 11, 15], 9) == [0, 1]
```

要点：

- 类型注解**不参与运行**，但能帮你理清入参/返回值。
- 链表、树题会用预置的 `ListNode` / `TreeNode`（定义见第 2 篇）。
- 本地用 `assert` / `print` 构造用例即可。

### 竞赛风格（标准输入输出）

AtCoder / 部分 Codeforces 题要自己读入：

```python file="contest_io.py"
import sys

input = sys.stdin.readline  # 比内置 input 快，大数据常用

def main():
    n = int(input())
    a = list(map(int, input().split()))
    # ...
    print(ans)

if __name__ == "__main__":
    main()
```

多组数据、矩阵读入：

```python
t = int(input())
for _ in range(t):
    n, m = map(int, input().split())
    grid = [list(map(int, input().split())) for _ in range(n)]
```

输出多行：

```python
print("\n".join(map(str, ans_list)))
# 或
sys.stdout.write(" ".join(map(str, row)) + "\n")
```

### 递归深度

默认递归上限约 1000。深递归 DFS / 树高很大时：

```python
import sys
sys.setrecursionlimit(1_000_000)  # 按需；过大可能栈内存爆
```

能改迭代就改迭代；必须递归时再抬上限。

## 变量、赋值与解包

```python file="unpack.py"
a = b = 0                 # 链式赋值（不可变值安全）
a, b = 1, 2               # 元组解包
a, b = b, a               # 交换
first, *mid, last = [1, 2, 3, 4, 5]  # first=1, mid=[2,3,4], last=5
x, y, z = "abc"           # 可迭代对象都可解包
```

海象运算符（3.8+）在条件里顺带赋值，刷题偶用：

```python
# 边读边判
while (line := input()) != "END":
    process(line)

# 推导式里复用计算结果
vals = [y for x in nums if (y := f(x)) > 0]
```

## 数字与布尔

### 整数与浮点

```python file="numbers.py"
a, b = 7, 3
a // b        # 2   地板除（向 -∞）
a % b         # 1
divmod(a, b)  # (2, 1)
a ** b        # 343
pow(a, b)     # 同 **
pow(a, b, mod)  # 模幂，大数快速幂 O(log b)，竞赛常用
(-7) // 3     # -3  不是向零截断的 -2
abs(-3), round(3.5)  # round 银行家舍入，刷题少依赖
```

Python `int` **任意精度**，没有 32/64 位溢出；题目若要求对 `10**9+7` 取模，仍要自己 `% MOD`。

```python
MOD = 10**9 + 7
ans = (ans + x) % MOD
ans = ans * x % MOD
# 负数取模（保证非负）
ans = (ans % MOD + MOD) % MOD
```

最值初值：

```python
inf = float("inf")
# 或 math.inf
best = inf
best = min(best, cand)
```

比较链：

```python
1 <= x <= 10          # 等价 1 <= x and x <= 10
```

### 布尔与真值

```python
ok = True and (x > 0)     # 短路
y = a if a > b else b     # 三元
bool([]), bool([0])       # False, True
```

假值：`None`、`False`、`0`、`0.0`、`''`、`[]`、`{}`、`set()`。

> [!NOTE]
> `and` / `or` 返回**操作数本身**（`0 or 5` 得 `5`）。当条件用通常无感；写进赋值要小心。

### 常用内置聚合

```python
min(a), max(a), sum(a)
min(a, default=inf)       # 空序列时给默认，避免 ValueError（3.4+）
sum(a, start=0)
all(x > 0 for x in a)
any(x == 0 for x in a)
```

## 字符串

字符串**不可变**；「修改」都产生新串。

```python file="strings.py"
s = "Hello"
s[0], s[-1]           # 'H', 'o'
s[1:4]                # 'ell'  左闭右开
s[::-1]               # 反转
"ell" in s            # 子串 O(n)

s.lower(), s.upper()
s.strip() / lstrip() / rstrip()
s.split()             # 空白切分
s.split(",")
s.splitlines()
",".join(["a", "b"])  # 'a,b'
s.replace("l", "L")   # 全部替换
s.replace("l", "L", 1)  # 只换 1 次
s.find("ll")          # 找不到 -1
s.rfind("l")
s.index("ll")         # 找不到 ValueError
s.count("l")
s.startswith("He"), s.endswith("lo")
s.isdigit(), s.isalpha(), s.isalnum(), s.isspace()
s.zfill(5)            # '00...' 补零
s.center(10), s.ljust(10), s.rjust(10)

ord("A"), chr(65)     # 65, 'A'
```

f-string（调试友好）：

```python
print(f"{x=}, {y=}")          # 3.8+ 调试语法
print(f"{x:02d} {y:.3f}")
```

循环拼长串 → 列表 + `join`：

```python
parts = []
for x in items:
    parts.append(str(x))
ans = "".join(parts)
```

### 字符与大小写变换（字母题）

```python
# 小写字母下标 0..25
idx = ord(ch) - ord("a")
ch = chr(ord("a") + idx)

# 大小写互转差 32（仅 ASCII）
```

### 字节串（少见但会考）

```python
b = b"abc"
b[0]                 # 97 int
list(b)              # [97, 98, 99]
s.encode(), b.decode()
```

## 列表基础与切片（核心）

### 创建与改动

```python file="lists_basic.py"
a = [1, 2, 3]
a.append(4)          # 尾 O(1)
a.pop()              # 弹尾 O(1)
a.pop(0)             # 弹头 O(n) —— 队列用 deque
a.insert(1, 9)       # O(n)
a.extend([5, 6])     # 拼接可迭代
a += [7]             # 类似 extend
a.clear()
a.copy()             # 浅拷贝
len(a), a[0], a[-1]
a[i:j] = [9, 9]      # 切片赋值（可改长度）
del a[i], del a[i:j]
```

### 切片

`a[i:j:k]`：从 i 到 j（**不含 j**），步长 k。负下标从尾数；越界截断不抛错。

```python file="slice.py"
a = [0, 1, 2, 3, 4, 5]
a[1:4]       # [1, 2, 3]
a[:3]        # [0, 1, 2]
a[3:]        # [3, 4, 5]
a[::2]       # [0, 2, 4]
a[::-1]      # 反转拷贝
a[1:5:2]     # [1, 3]
a[-3:]       # [3, 4, 5]
a[:-1]       # 去掉最后一个
```

复制 vs 别名：

```python
b = a        # 同一对象
c = a[:]     # 浅拷贝
d = list(a)
e = a.copy()
```

### 排序与查找

```python
a.sort()                       # 原地，返回 None
b = sorted(a)                  # 新列表
a.sort(reverse=True)
a.sort(key=lambda x: -x)
a.sort(key=lambda x: (x[0], -x[1]))  # 多关键字
a.reverse()
a.index(3)                     # 无则 ValueError
a.count(3)
3 in a                         # O(n)
```

> [!WARNING]
> `list.sort()` 返回 `None`。`a = a.sort()` 会把 `a` 变成 `None`。

内置 `reversed(a)` 返回迭代器；`a[::-1]` 返回新列表。

## 控制流

```python file="control.py"
for i in range(n):                 # 0 .. n-1
    ...
for i in range(1, n + 1):          # 1 .. n
    ...
for i in range(n - 1, -1, -1):     # 倒序
    ...
for i in range(0, n, 2):           # 步长 2
    ...

while left < right:
    if done:
        break
    if skip:
        continue
else:
    # for/while 正常结束（没被 break）才走这里
    ...
```

`match` / `case`（3.10+）刷题少用，了解即可。

提前返回通常比循环 `else` 更清晰：

```python
def find(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1
```

`pass` 占位；`...`（Ellipsis）也可当空块占位。

## 函数与作用域

### 定义与默认参数

```python
def f(x: int, y: int = 0) -> int:
    return x + y

# 错误：默认可变对象只创建一次
def bad(x, acc=[]):
    acc.append(x)
    return acc

# 正确
def good(x, acc=None):
    if acc is None:
        acc = []
    acc.append(x)
    return acc
```

### 位置、关键字、仅限标记

```python
def f(a, b, /, c, *, d):
    # a,b 只能位置；d 只能关键字；c 两者皆可
    ...
```

刷题很少写 `/` `*`，读库文档时能认即可。

### 多返回值

```python
def min_max(a):
    return min(a), max(a)

lo, hi = min_max([3, 1, 4])
```

### 嵌套函数、`nonlocal`、`global`

```python
def solve():
    ans = 0
    path = []

    def dfs():
        nonlocal ans      # 改外层绑定的不可变/重新绑定
        ans += 1
        path.append(1)    # 改 list 内容不需要 nonlocal

    dfs()
    return ans
```

### `lambda` 与高阶一点的用法

```python
pairs.sort(key=lambda p: (p[0], -p[1]))
list(map(int, "1 2 3".split()))
list(filter(lambda x: x > 0, nums))
# 推导式通常比 map/filter 更可读
```

### 生成器函数

```python
def gen(n):
    for i in range(n):
        yield i

def walk(node):
    while node:
        yield node.val
        node = node.next
```

## 推导式与生成器表达式

```python file="comprehensions.py"
squares = [x * x for x in range(5)]
evens = [x for x in nums if x % 2 == 0]
# 双层（慎用，可读性差时改回 for）
cells = [(r, c) for r in range(m) for c in range(n)]

uniq = {x for x in nums}
index = {x: i for i, x in enumerate(nums)}
# 后写覆盖先写：enumerate 正向时保留最后一次下标

# 生成器表达式：惰性，省内存
total = sum(x * x for x in nums)
```

二维初始化：

```python
grid = [[0] * n for _ in range(m)]   # 正确
# [[0] * n] * m                      # 错误：行共享
```

> [!WARNING]
> `[[0]*n]*m` 外层复制的是**同一行引用**。改 `grid[0][0]` 会改每一行。详见第 2 篇。

## 迭代工具

```python file="iter_tools.py"
for i, x in enumerate(nums):
    ...
for i, x in enumerate(nums, start=1):
    ...

for a, b in zip(nums, nums[1:]):     # 相邻对
    ...
for x, y in zip(xs, ys):
    ...
for x, y in zip(xs, ys, strict=True):  # 3.10+ 长度必须一致

for x in reversed(nums):
    ...
for x in sorted(nums, key=abs):
    ...

list(range(5))
iter(nums)
next(it, default)                    # 有默认则耗尽不抛
```

`zip` 默认以**最短**序列结束。

## 比较、恒等与哈希

```python
a == b           # 值相等
a is b           # 同一对象；刷题几乎只用于 None
x is None
x is not None
```

可哈希（能进 `set` / 当 `dict` 键）：`int`、`float`、`str`、`bool`、`tuple`（元素也可哈希）、`frozenset`、自定义实现了 `__hash__` 且不可变语义的对象。

不可哈希：`list`、`dict`、`set`。

```python
seen = set()
seen.add((r, c))
# seen.add([r, c])   # TypeError
```

浮点当键要谨慎（精度）。自定义类默认按 `id` 比，一般刷题不自定义类当键。

## 类型注解（读写即可）

```python
from typing import Optional, Any
# 3.10+ 可用 |
def f(x: int | None) -> list[int]:
    ...

Optional[int]          # 等价 int | None
list[list[int]]
dict[str, int]
tuple[int, int]
tuple[int, ...]        # 变长元组
```

注解在运行时默认不检查；给自己和平台看。

## 异常与断言

刷题优先**显式判断**：

```python
if stack:
    stack.pop()
else:
    ...
```

需要时：

```python
try:
    ...
except (ValueError, KeyError) as e:
    ...
finally:
    ...
```

`assert cond, msg` 仅本地调试；用 `-O` 优化运行时 assert 会被去掉，**不要**靠 assert 做题目逻辑。

## 运算符优先级（常混）

从高到低（节选）：`**` → 正负号 → `* / // %` → `+ -` → 位移 → 比较 → `not` → `and` → `or`。拿不准就加括号。

位运算基础见第 3 篇；这里记：

```python
# 混合时务必括号
flags = (x & mask) != 0
```

## 本地调试小习惯

```python file="local_debug.py"
class Solution:
    def foo(self, nums: list[int]) -> int:
        return sum(nums)


if __name__ == "__main__":
    s = Solution()
    cases = [
        ([1, 2, 3], 6),
        ([], 0),
    ]
    for nums, expect in cases:
        got = s.foo(nums)
        assert got == expect, (nums, got, expect)
    print("ok")
```

建议覆盖：空、单元素、全相同、已排序/逆序、最小最大边界、负数、重复值。

打印调试：

```python
print(f"{i=} {dp[i]=}")
# 提交前删掉或注释
```

## 本篇速查

| 需求 | 写法 |
|------|------|
| 地板除 / 余数 / 模幂 | `//` `%` `pow(a,b,mod)` |
| 交换 / 解包 | `a,b=b,a` / `first,*mid,last=...` |
| 反转 | `s[::-1]` / `reversed(a)` |
| 带下标 / 并行 | `enumerate` / `zip` |
| 浅拷贝列表 | `a[:]` / `list(a)` / `a.copy()` |
| 排序 | `sorted` / `a.sort(key=...)` |
| 拼长串 | `"".join(parts)` |
| 最值初值 | `math.inf` / `float("inf")` |
| 取模非负 | `(x % MOD + MOD) % MOD` |
| 判空再弹栈 | `if st: st.pop()` |
| 坐标入集合 | `(i, j)` |
| 深递归 | `sys.setrecursionlimit` |
| 竞赛快读 | `sys.stdin.readline` |
| 条件赋值 | `x if c else y` / `:=` |

## 下一篇

语法骨架有了之后，决定手速的是**选对容器、改得干净**，以及链表/树/图在 Python 里怎么表示。

→ [② Python 刷题数据结构：list / dict / set / tuple](/posts/notes/python-leetcode-collections/)
