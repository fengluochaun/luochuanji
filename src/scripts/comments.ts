/**
 * giscus 评论区的客户端逻辑：懒加载 + 明暗联动。
 *
 * 配置从 `#comments` 容器的 data-* 属性读取（由 Comments.astro 从站点 giscus
 * 配置渲染而来）。主题跟随站点：初始由 `html[data-theme]` 决定，随后监听该属性
 * 变化（theme.ts 切换主题时改的正是它），通过 postMessage 同步给 giscus iframe。
 */

// giscus 的 light/dark 主题名（noborder 系列与站点无边框卡片风格更协调）。
const GISCUS_LIGHT = "noborder_light";
const GISCUS_DARK = "noborder_dark";

function currentGiscusTheme(): string {
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "dark" ? GISCUS_DARK : GISCUS_LIGHT;
}

function sendThemeToGiscus(theme: string): void {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame"
  );
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app"
  );
}

function mountGiscus(): void {
  const container = document.getElementById("comments");
  if (!container) return;

  const target = container.querySelector<HTMLElement>(".giscus");
  if (!target) return;
  // 视图切换（View Transitions）后避免重复注入。
  if (target.querySelector("iframe.giscus-frame, script")) return;

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", container.dataset.giscusRepo ?? "");
  script.setAttribute("data-repo-id", container.dataset.giscusRepoId ?? "");
  script.setAttribute("data-category", container.dataset.giscusCategory ?? "");
  script.setAttribute(
    "data-category-id",
    container.dataset.giscusCategoryId ?? ""
  );
  script.setAttribute(
    "data-mapping",
    container.dataset.giscusMapping ?? "pathname"
  );
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", currentGiscusTheme());
  script.setAttribute("data-lang", container.dataset.giscusLang ?? "en");
  script.setAttribute("data-loading", "lazy");
  target.appendChild(script);
}

// 监听站点主题切换：theme.ts 在 <html> 上改 data-theme，
// 用 MutationObserver 捕获后把新主题同步给已加载的 giscus iframe。
let themeObserver: MutationObserver | null = null;
function observeThemeChanges(): void {
  themeObserver?.disconnect();
  themeObserver = new MutationObserver(() => {
    sendThemeToGiscus(currentGiscusTheme());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// 记录当前页 giscus iframe 是否已同步过一次主题（补漏懒加载竞态，见页底监听）。
let giscusSynced = false;

function setupComments(): void {
  giscusSynced = false;
  mountGiscus();
  observeThemeChanges();
}

setupComments();
// 兼容 Astro View Transitions 导航。
document.addEventListener("astro:after-swap", setupComments);

// 补漏：iframe 懒加载完成前的主题切换会丢失 postMessage。giscus 首次就绪时会向
// 父窗口发消息，收到后同步一次当前主题，保证最终一致（每页只处理首条，避免重复）。
window.addEventListener("message", event => {
  if (event.origin !== "https://giscus.app") return;
  if (giscusSynced) return;
  giscusSynced = true;
  sendThemeToGiscus(currentGiscusTheme());
});
