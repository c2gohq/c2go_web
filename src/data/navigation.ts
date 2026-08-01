export type Locale = "en" | "zh-cn";

type NavItem = { slug: string; title: Record<Locale, string> };
type NavSection = {
  id: string;
  title: Record<Locale, string>;
  items: NavItem[];
};

export const docsNavigation: NavSection[] = [
  {
    id: "start",
    title: { en: "Getting started", "zh-cn": "开始使用" },
    items: [
      { slug: "overview", title: { en: "Overview", "zh-cn": "项目概览" } },
      {
        slug: "stack-escape-audit",
        title: {
          en: "Stack escape safety",
          "zh-cn": "栈指针逃逸安全",
        },
      },
      {
        slug: "installation",
        title: { en: "Install the SDK", "zh-cn": "安装 SDK" },
      },
      {
        slug: "hello-world",
        title: { en: "Hello World", "zh-cn": "Hello World" },
      },
    ],
  },
  {
    id: "concepts",
    title: { en: "Core concepts", "zh-cn": "核心概念" },
    items: [
      {
        slug: "build-pipeline",
        title: { en: "The build pipeline", "zh-cn": "构建管线" },
      },
      {
        slug: "managed-unmanaged",
        title: { en: "Managed and unmanaged", "zh-cn": "Managed 与 unmanaged" },
      },
      {
        slug: "gc-allocation",
        title: { en: "GC-aware allocation", "zh-cn": "GC 感知分配" },
      },
      {
        slug: "export-c",
        title: { en: "Export C to Go", "zh-cn": "将 C 导出给 Go" },
      },
    ],
  },
  {
    id: "interop",
    title: { en: "Interoperability", "zh-cn": "互操作" },
    items: [
      {
        slug: "call-go",
        title: { en: "Call Go from C", "zh-cn": "从 C 调用 Go" },
      },
      {
        slug: "native-libraries",
        title: { en: "Native libraries", "zh-cn": "原生库" },
      },
      { slug: "callbacks", title: { en: "Callbacks", "zh-cn": "回调" } },
      {
        slug: "data-types",
        title: { en: "Data types and errno", "zh-cn": "数据类型与 errno" },
      },
    ],
  },
  {
    id: "build",
    title: { en: "Build and reference", "zh-cn": "构建与参考" },
    items: [
      {
        slug: "multi-file-lto",
        title: { en: "Multi-file projects", "zh-cn": "多文件项目" },
      },
      {
        slug: "inline-assembly",
        title: { en: "Inline assembly", "zh-cn": "内联汇编" },
      },
      {
        slug: "cli-reference",
        title: { en: "CLI reference", "zh-cn": "命令行参考" },
      },
      {
        slug: "platforms-limitations",
        title: { en: "Platforms and limits", "zh-cn": "平台与限制" },
      },
      {
        slug: "troubleshooting",
        title: { en: "Troubleshooting", "zh-cn": "故障排查" },
      },
      { slug: "licensing", title: { en: "Licensing", "zh-cn": "开源协议" } },
    ],
  },
];

export const flatDocs = docsNavigation.flatMap((section) => section.items);

export function localizedPath(locale: Locale, path = "") {
  const cleaned = path.replace(/^\/+|\/+$/g, "");
  return `/${locale}/${cleaned ? `${cleaned}/` : ""}`;
}

export function docsPath(locale: Locale, slug: string) {
  return localizedPath(locale, `docs/${slug}`);
}
