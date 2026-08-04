import type { Locale } from "./data/navigation";

export const locales: Locale[] = ["en", "zh-cn"];

export const ui = {
  en: {
    skip: "Skip to content",
    docs: "Docs",
    components: "Components",
    releases: "Releases",
    github: "GitHub",
    search: "Search docs",
    searchHint: "Search this language",
    close: "Close",
    theme: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
    language: "中文",
    onThisPage: "On this page",
    editSource: "Source references",
    maintainedBy: "Maintained by",
    previous: "Previous",
    next: "Next",
    releaseCandidate: "Release candidate",
    versionNotice:
      "These docs describe the current coordinated release candidate.",
    menu: "Documentation menu",
  },
  "zh-cn": {
    skip: "跳转到正文",
    docs: "文档",
    components: "组件",
    releases: "发布版本",
    github: "GitHub",
    search: "搜索文档",
    searchHint: "搜索当前语言",
    close: "关闭",
    theme: "主题",
    system: "跟随系统",
    light: "浅色",
    dark: "深色",
    language: "EN",
    onThisPage: "本页内容",
    editSource: "资料来源",
    maintainedBy: "维护者",
    previous: "上一篇",
    next: "下一篇",
    releaseCandidate: "候选版本",
    versionNotice: "本文档对应当前协同发布候选版本。",
    menu: "文档目录",
  },
} as const;

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/zh-cn") ? "zh-cn" : "en";
}
