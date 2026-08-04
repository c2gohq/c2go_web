# C2Go 网站

[English](README.md)

C2Go 中英文项目网站及由浅入深的技术文档，正式域名为 <https://c2go.buymecompile.top>。

## 本地开发

需要 Node.js 22 或更高版本，以及 pnpm 10.33.2。

```sh
pnpm install
pnpm dev
```

常用检查：

```sh
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm build` 会把静态网站和按语言分离的 Pagefind 索引输出到 `dist/`。
构建还会检查 canonical URL、hreflang、社交分享元数据、JSON-LD，以及可索引页面与 sitemap 是否一致。

## 文档内容

英文和简体中文 MDX 分别位于 `src/content/docs/en/` 与 `src/content/docs/zh-cn/`。每篇文档都必须存在相同 slug 的另一语言版本，并在 frontmatter 中标出协同工具链版本和资料来源。`pnpm check` 会验证这些约束。

可以实际运行的 Hello World 源码位于 `examples/hello/`。修改示例或对应指南时，独立 GitHub Actions workflow 会使用固定版本的 Linux SDK 验证完整管线。

## Cloudflare Pages

通过 Cloudflare Pages Git 集成连接 GitHub 仓库 `c2gohq/c2go_web`：

- 项目名：`c2go-web`；
- 生产分支：`main`；
- 构建命令：`pnpm build`；
- 输出目录：`dist`；
- 自定义域名：`c2go.buymecompile.top`。

Git 集成会把 `main` 发布到生产环境，并为 pull request 提供预览地址。仓库本身不需要保存 Cloudflare API token。

## 授权

网站原创程序代码采用 `AGPL-3.0-only` 或另行商业授权；原创文档采用 `CC BY-SA 4.0` 或另行商业授权。C2Go 名称和 Logo 不在上述授权范围内。详见 [LICENSING.md](LICENSING.md)、[LICENSE](LICENSE)、[LICENSE-DOCS](LICENSE-DOCS) 与 [TRADEMARKS.md](TRADEMARKS.md)。
