import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("release page points to the coordinated snapshot", async ({ page }) => {
  const version = "v0.20260802.0-rc.1";
  await page.goto("/en/releases/");

  await expect(
    page.getByRole("heading", { level: 1, name: version }),
  ).toBeVisible();
  await expect(
    page.locator(`a[href*="/releases/download/${version}/"]`),
  ).toHaveCount(4);
  await expect(
    page.locator(`a[href$="c2go-toolchain-${version}-linux-arm64.tar.gz"]`),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Checksums and source archive/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/c2gohq/c2go_toolchain/releases/tag/${version}`,
  );
});

test("English landing page exposes the real pipeline", async ({
  page,
}, testInfo) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bring C into the Go runtime.",
  );
  await expect(page.getByText("c2go-clang").first()).toBeVisible();
  const bindStage =
    testInfo.project.name === "mobile"
      ? page.locator(".quickstart-grid").getByText(/c2go-bind --out=/)
      : page.locator(".hero-diagram").getByText("c2go-bind");
  await expect(bindStage).toBeVisible();
  await expect(page.getByText("c2go-libc").first()).toBeVisible();
  await expect(page.locator(".pipeline-section")).toHaveCount(0);
  await expect(
    page.locator(".hero-highlights").getByText("PureGo · CGO_ENABLED=0"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Build without cgo" }),
  ).toBeVisible();
  await expect(page.getByText("CGO_ENABLED=0 go build ./...")).toBeVisible();
  await expect(page.locator(".safety-notice")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Get started/ }).first(),
  ).toHaveAttribute("href", "/en/docs/hello-world/");
});

test("the package import path is supplied only to c2go-clang", async ({
  page,
}) => {
  await page.goto("/en/docs/hello-world/");
  const article = page.locator("article.docs-article");
  await expect(article).toContainText(
    "-fc2go-package=example.com/hello-c2go/translated",
  );
  await expect(article).not.toContainText("--pkg=");

  await page.goto("/en/docs/cli-reference/");
  await expect(page.locator("article.docs-article")).toContainText(
    "--pkgname neither overrides the import path nor participates in symbol linkage",
  );

  await page.goto("/en/docs/call-go/");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Symbols in the current package",
    }),
  ).toBeVisible();
  await expect(page.locator("article.docs-article")).toContainText(
    "resolves example.com/mathx.Double to a package-local LLVM and Plan 9 symbol",
  );

  await page.goto("/en/docs/managed-unmanaged/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Memory and the Go GC",
  );
  await expect(page.getByText("Start with two questions:")).toBeVisible();
});

test("ordinary native imports do not require unmanaged extern", async ({
  page,
}) => {
  await page.goto("/en/docs/native-libraries/");
  const english = page.locator("article.docs-article");
  await expect(english).toContainText(
    "An ordinary native function therefore needs only a normal C declaration; unmanaged extern is not required.",
  );
  await expect(english).toContainText(
    "extern double vendor_scale(double value);",
  );

  await page.goto("/zh-cn/docs/callbacks/");
  await expect(page.locator("article.docs-article")).toContainText(
    "这里只因 native_sort 接收函数指针、需要启用 host-callback 指针规则，才显式写 unmanaged extern",
  );
});

test("language switch preserves the document slug and preference", async ({
  page,
}) => {
  await page.goto("/en/docs/hello-world/");
  await page.getByRole("link", { name: "中文" }).click();
  await expect(page).toHaveURL(/\/zh-cn\/docs\/hello-world\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hello World",
  );
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("c2go-locale")))
    .toBe("zh-cn");
});

test("the critical stack limitation is prominent only on the limitations page", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Notice placement is independent of the viewport.",
  );

  await page.goto("/en/docs/overview/");
  await expect(page.locator(".safety-notice")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Platforms and current limitations" }),
  ).toHaveAttribute("href", "/en/docs/platforms-limitations/");

  await page.goto("/en/docs/installation/");
  await expect(page.locator(".safety-notice")).toHaveCount(0);

  await page.goto("/en/docs/platforms-limitations/");
  const notice = page.locator(".safety-notice");
  await expect(notice).toContainText("Stack pointers must not escape");
  await expect(notice.getByRole("link")).toHaveAttribute(
    "href",
    "/en/docs/stack-escape-audit/",
  );

  await page.goto("/zh-cn/docs/stack-escape-audit/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "栈指针逃逸审计",
  );
  await expect(page.locator("article.docs-article")).toContainText(
    "这种跨 frame 使用本身不是逃逸",
  );
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "普通 driver 构建不是门禁",
    }),
  ).toBeVisible();
  for (const pathname of ["/en/components/", "/en/releases/"]) {
    await page.goto(pathname);
    await expect(page.locator(".safety-notice")).toHaveCount(0);
  }
});

test("language reference separates C syntax from C2Go extensions", async ({
  page,
}) => {
  await page.goto("/en/docs/c-language-reference/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "C language quick reference",
  );
  await expect(page.getByText("_Thread_local", { exact: true })).toBeVisible();
  await expect(
    page.getByText("_Imaginary", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("article.docs-article")).toContainText(
    "it may be used along a synchronous call chain while the object is alive and callees do not retain it",
  );

  await page.getByRole("link", { name: "C2Go extensions" }).last().click();
  await expect(page).toHaveURL(/\/en\/docs\/c2go-extensions\/$/);
  await expect(page.getByText("C2GO_DYN(name)", { exact: true })).toBeVisible();
  await expect(
    page.getByText("c2go_extern", { exact: true }).first(),
  ).toBeVisible();
});

test("build-system integration keeps native linking outside the C2Go pipeline", async ({
  page,
}) => {
  await page.goto("/en/docs/build-system-integration/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Integrate existing build systems",
  );
  const english = page.locator("article.docs-article");
  await expect(english).toContainText(
    "C2Go is not a drop-in replacement for the complete native compile-and-link pipeline",
  );
  await expect(english).toContainText(
    "The archive compatibility mode always rebuilds the C2Go archive",
  );
  await expect(english).toContainText("AR=c2go-lto");
  await expect(english).toContainText(
    "A plain -fc2go -c deliberately writes pre-link LLVM bitcode",
  );
  await expect(english).not.toContainText(
    "The -emit-llvm flag is required for this route",
  );
  await expect(english).toContainText("CMAKE_C_ARCHIVE_CREATE");

  await page.goto("/zh-cn/docs/build-system-integration/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "接入现有构建系统",
  );
  await expect(page.locator("article.docs-article")).toContainText(
    "仅设置 CMAKE_C_COMPILER=c2go-clang 仍不完整",
  );
});

test("root route selects Chinese from the browser locale", async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Locale detection is independent of the viewport.",
  );
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4321",
    locale: "zh-CN",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/zh-cn\/$/);
  await context.close();
});

test("theme selector persists all explicit modes", async ({ page }) => {
  await page.goto("/en/docs/hello-world/");
  await page.locator(".theme-picker summary").click();
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator(".theme-picker summary").click();
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "System" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
});

test("documentation code blocks copy their exact contents", async ({
  context,
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Clipboard behavior is independent of the viewport.",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/docs/hello-world/");
  const firstCopyButton = page
    .getByRole("button", { name: "Copy code" })
    .first();
  await firstCopyButton.click();
  await expect(firstCopyButton).toHaveClass(/copied/);
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("mkdir hello-c2go");
});

test("built search index returns documentation in the active language", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Search behavior is identical; desktop covers the modal.",
  );
  await page.goto("/en/docs/overview/");
  await page.getByRole("button", { name: /Search docs/ }).click();
  await page.getByRole("searchbox").fill("managed");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.locator(".search-result").first()).toBeVisible();
  await expect(page.locator(".search-result").first()).toHaveAttribute(
    "href",
    /\/en\//,
  );
});

test("core pages have no serious accessibility violations", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Desktop scan covers the same semantic content.",
  );
  for (const pathname of [
    "/en/",
    "/en/docs/hello-world/",
    "/en/docs/managed-unmanaged/",
    "/en/docs/build-system-integration/",
    "/en/docs/c-language-reference/",
    "/en/docs/stack-escape-audit/",
    "/zh-cn/docs/managed-unmanaged/",
    "/zh-cn/docs/platforms-limitations/",
  ]) {
    await page.goto(pathname);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(
        (violation) =>
          violation.impact === "critical" || violation.impact === "serious",
      ),
    ).toEqual([]);
  }

  await page.evaluate(() => localStorage.setItem("c2go-theme", "dark"));
  await page.goto("/en/docs/hello-world/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(
    darkResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    ),
  ).toEqual([]);
});

test("mobile documentation has no horizontal overflow and opens the chapter drawer", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Mobile-only navigation behavior.",
  );
  for (const pathname of [
    "/en/docs/hello-world/",
    "/en/docs/c-language-reference/",
    "/en/docs/c2go-extensions/",
    "/en/docs/build-system-integration/",
    "/zh-cn/docs/platforms-limitations/",
  ]) {
    await page.goto(pathname);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }

  await page.goto("/en/docs/hello-world/");
  await page.getByRole("button", { name: /Documentation menu/ }).click();
  await expect(page.locator(".docs-sidebar")).toHaveClass(/is-open/);
  await expect(page.locator(".docs-sidebar")).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "How the build works", exact: true }),
  ).toBeVisible();
});
