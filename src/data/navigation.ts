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
        slug: "installation",
        title: { en: "Install the SDK", "zh-cn": "安装 SDK" },
      },
      {
        slug: "hello-world",
        title: { en: "Hello World", "zh-cn": "Hello World" },
      },
      {
        slug: "build-pipeline",
        title: { en: "How the build works", "zh-cn": "构建如何工作" },
      },
    ],
  },
  {
    id: "guides",
    title: { en: "Using C2Go", "zh-cn": "使用 C2Go" },
    items: [
      {
        slug: "export-c",
        title: { en: "Export C to Go", "zh-cn": "将 C 导出给 Go" },
      },
      {
        slug: "managed-unmanaged",
        title: { en: "Memory and the Go GC", "zh-cn": "内存与 Go GC" },
      },
      {
        slug: "gc-allocation",
        title: { en: "GC-aware allocation", "zh-cn": "GC 感知分配" },
      },
      {
        slug: "multi-file-lto",
        title: { en: "Multi-file projects", "zh-cn": "多文件项目" },
      },
      {
        slug: "build-system-integration",
        title: {
          en: "Existing build systems",
          "zh-cn": "接入现有构建系统",
        },
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
        title: { en: "Boundary data types", "zh-cn": "边界数据类型" },
      },
    ],
  },
  {
    id: "reference",
    title: { en: "Language reference", "zh-cn": "语言参考" },
    items: [
      {
        slug: "c-language-reference",
        title: { en: "C keywords and syntax", "zh-cn": "C 关键字与语法" },
      },
      {
        slug: "c2go-extensions",
        title: { en: "C2Go extensions", "zh-cn": "C2Go 扩展速查" },
      },
      {
        slug: "inline-assembly",
        title: { en: "Inline assembly", "zh-cn": "内联汇编" },
      },
      {
        slug: "cli-reference",
        title: { en: "CLI reference", "zh-cn": "命令行参考" },
      },
    ],
  },
  {
    id: "support",
    title: { en: "Limits and support", "zh-cn": "限制与支持" },
    items: [
      {
        slug: "platforms-limitations",
        title: {
          en: "Platforms and limitations",
          "zh-cn": "平台与当前限制",
        },
      },
      {
        slug: "stack-escape-audit",
        title: {
          en: "Stack escape audit",
          "zh-cn": "栈指针逃逸审计",
        },
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
