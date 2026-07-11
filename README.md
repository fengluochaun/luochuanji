# 洛川集

> 枫落于川，川流成集；逝者如斯，而未尝往也。

[洛川集](https://blog.luochuanji.com) 是 fengluochuan 的个人博客，基于
[AstroPaper](https://github.com/satnaing/astro-paper) 主题二次开发（Astro +
TypeScript + TailwindCSS + Pagefind），纯静态部署在自有服务器上。

站点收录两类内容：

- **文章**（`/posts/`）：Markdown/MDX 直写的常规博文
- **论文精读**（`/research/`）：由 [paper2html](.claude/skills/paper2html/) 生成、经导入器模板化的单页论文精读

两类内容统一出现在首页列表、标签页、RSS 与全文搜索中。

## 写作流程一：Markdown 文章

在 `src/content/posts/` 下新建 `.md`（或 `.mdx`）文件即可，子目录名会成为 URL 的一部分。frontmatter 字段（以 `src/content.config.ts` 为准）：

| 字段          | 必填 | 说明                                               |
| ------------- | ---- | -------------------------------------------------- |
| `title`       | 是   | 文章标题                                           |
| `description` | 是   | 摘要，用于列表、SEO 与 OG 图                       |
| `pubDatetime` | 是   | 发布时间，如 `2026-07-10T09:00:00+08:00`           |
| `modDatetime` | 否   | 最后修改时间                                       |
| `tags`        | 否   | 标签数组，默认 `["others"]`                        |
| `draft`       | 否   | `true` 时构建不发布（dev 下可预览）                |
| `featured`    | 否   | `true` 时进入首页「精选」区                        |
| `comments`    | 否   | 默认 `true`；设为 `false` 关闭本篇 giscus 评论     |
| `ogImage`     | 否   | 自定义 OG 图；缺省时构建期自动生成                 |
| `author`      | 否   | 默认取站点配置中的作者                             |
| `timezone`    | 否   | 覆盖单篇文章的 IANA 时区（站点默认 Asia/Shanghai） |

示例：

```yaml
---
title: 洛川集开篇
description: 这个站点为什么存在。
pubDatetime: 2026-07-10T09:00:00+08:00
tags:
  - 随笔
---
```

本地 `pnpm dev` 预览，push 到 `main` 即自动构建发布。

## 写作流程二：paper2html 论文精读页

paper2html 产出的单文件 `index.html` 通过仓库内置导入器进入站点，成为共享站点导航、明暗模式与评论区的精读页。

### 发布契约（paper2html skill 侧使用）

paper2html 的 `publish_paper2html.sh` 依赖以下环境变量指向本仓库：

```bash
export PAPER2HTML_BLOG_ROOT=/path/to/本仓库
export PAPER2HTML_PUBLIC_BASE_URL=https://blog.luochuanji.com/research
export PAPER2HTML_DEPLOY_WORKFLOW=deploy.yml
```

### 导入命令（本仓库提供）

```bash
# 导入 + 本地检查（推荐先跑这一步）
pnpm research:publish /path/to/index.html \
  --to nlp/transformer/attention-is-all-you-need \
  --title "Attention Is All You Need 精读" \
  --description "Transformer 原始论文逐节精读" \
  --tags 论文精读,NLP \
  --check

# 只校验参数与目标路径，不落盘
pnpm research:publish /path/to/index.html --to topic/slug --dry-run

# 导入 + format + check + 只提交本次精读文件 + push（触发自动部署）
pnpm research:publish /path/to/index.html --to topic/slug --ship
```

- `--to topic[/series]/slug`：目标路径，`series` 层级可省略
- 其余可选参数：`--date YYYY-MM-DD`、`--topic-title`、`--series-title`、`--source <论文链接>`、`--comments false`（关闭本页评论）、`--message`（`--ship` 的 commit message）
- `--ship` / `--check` / `--dry-run` 三种模式至多选一
- `--allow-private-evidence`：放行 `file://` 等本地引用（公开页面应避免）
- 元数据优先级：命令行参数 > HTML 内 `<title>` / `<meta>` 兜底

### 落盘与 URL 规则

导入后每页生成一个目录：

```
src/data/research/<topic>[/<series>]/<slug>/
├── meta.json      # 标题、日期、标签等元数据
├── content.html   # 作用域化后的正文
└── styles.css     # 选择器统一加 .paper-root 前缀，与主题样式互不污染
```

对应页面 URL 为 `https://blog.luochuanji.com/research/<topic>[/<series>]/<slug>/`。

### 校验

```bash
# 本地结构校验
pnpm research verify nlp/transformer/attention-is-all-you-need

# 追加公网 URL 可达性检查（部署后）
pnpm research verify nlp/transformer/attention-is-all-you-need --remote
```

## 本地开发

环境要求：Node >= 22.12、pnpm。

```bash
pnpm install        # 安装依赖
pnpm dev            # 本地开发服务器（localhost:4321）
pnpm build          # astro check + 构建 + Pagefind 索引
pnpm preview        # 预览构建产物
pnpm lint           # ESLint
pnpm format:check   # Prettier 检查（pnpm format 自动修复）
```

注意：Astro 7 的 `dev` 以守护进程方式常驻运行，关闭终端不会停止它；用 `pnpm astro dev status` 查看状态、`pnpm astro dev stop` 停止。

## 部署

- **自动**：push `main` 后 GitHub Actions（`.github/workflows/deploy.yml`）自动 `pnpm build` 并将 `dist/` rsync 到自有服务器；连接信息全部存放于仓库 Secrets（`SSH_HOST` / `SSH_PORT` / `SSH_USER` / `SSH_PRIVATE_KEY` / `DEPLOY_PATH`），不落仓库。
- **手动兜底**：CI 不可用时在本地运行 `./scripts/deploy.sh`（本地构建 + 同一条 rsync + 部署后 HTTP 200 验证）。
- **服务器侧**：既有 nginx 新增独立 vhost 提供静态托管，certbot 签发并自动续期 HTTPS 证书；服务器不承担任何动态后端职责。

## 评论

评论基于 [giscus](https://giscus.app/zh-CN)（GitHub Discussions 的
Announcements 分类作后端，无服务器），文章页与精读页均挂载，主题跟随站点明暗模式切换。

- 全站配置集中在 `astro-paper.config.ts` 的 `giscus` 块，删除该块即全站关闭
- 单篇关闭：文章 frontmatter 写 `comments: false`；精读页导入时加 `--comments false`（或改 `meta.json` 中的 `comments`）

## 相对上游 AstroPaper 的定制

定制以「新增文件为主、少改核心」为原则，便于跟随上游更新：

- **research 内容体系**：`research` content collection（`src/content.config.ts`）+ 动态路由 `src/pages/research/[...id].astro` + `PaperLayout.astro`（站点壳 + `.paper-root` 样式隔离 + 本地 vendored KaTeX，不走 CDN）
- **导入器**：`scripts/research/`，实现上文的 paper2html 发布契约
- **统一列表流**：`getAllEntries()` 合并 posts + research，首页、标签页、RSS、Pagefind 搜索统一收录，精读条目带「论文精读」标识
- **giscus 评论组件**：懒加载、明暗联动、单篇可关
- **中文化**：界面文案、`zh` 语言与 Asia/Shanghai 时区
- **部署链路**：GitHub Actions rsync 发布 + `scripts/deploy.sh` 手动兜底

## License

本仓库沿用上游的 [MIT License](LICENSE)。主题来自
[satnaing/astro-paper](https://github.com/satnaing/astro-paper)，感谢
[Sat Naing](https://satnaing.dev) 与各位贡献者。博客文章与精读页内容版权归作者所有。
