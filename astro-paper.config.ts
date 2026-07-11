import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.luochuanji.com",
    title: "洛川集",
    description: "枫落于川，川流成集；逝者如斯，而未尝往也。",
    author: "fengluochuan",
    profile: "https://github.com/fengluochaun",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [{ name: "github", url: "https://github.com/fengluochaun" }],
  // giscus 评论（GitHub Discussions 后端）；删除此块即全站关闭评论。
  // 单篇关闭：posts frontmatter / research meta.json 里设 `comments: false`。
  giscus: {
    repo: "fengluochaun/luochuanji",
    repoId: "R_kgDOTUeaig",
    category: "Announcements",
    categoryId: "DIC_kwDOTUeais4DA6K9",
    mapping: "pathname",
    lang: "zh-CN",
  },
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
