# C2Go website

[简体中文](README.zh-CN.md)

The bilingual C2Go project website and progressively structured technical documentation published at <https://c2go.buymecompile.top>.

## Development

Requirements: Node.js 22 or newer and pnpm 10.33.2.

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm build` writes the static site and localized Pagefind indexes to `dist/`.

## Content

English and Simplified Chinese MDX live under `src/content/docs/en/` and `src/content/docs/zh-cn/`. Every document must have a matching slug in both locales and must identify the coordinated toolchain release and source references in frontmatter. `pnpm check` enforces this parity.

The runnable Hello World source is in `examples/hello/`. A separate GitHub Actions workflow verifies it with the pinned Linux SDK whenever the example or corresponding guide changes.

## Cloudflare Pages

Connect the GitHub repository `c2gohq/c2go_web` through Cloudflare Pages Git integration with:

- project name: `c2go-web`;
- production branch: `main`;
- build command: `pnpm build`;
- output directory: `dist`;
- custom domain: `c2go.buymecompile.top`.

The Git integration deploys `main` to production and supplies preview URLs for pull requests. No Cloudflare API token is required by this repository.

## Licensing

Original website program code is licensed under `AGPL-3.0-only` or a separate commercial agreement. Original documentation is licensed under `CC BY-SA 4.0` or a separate commercial agreement. The C2Go names and logo are excluded from those grants. See [LICENSING.md](LICENSING.md), [LICENSE](LICENSE), [LICENSE-DOCS](LICENSE-DOCS), and [TRADEMARKS.md](TRADEMARKS.md).
