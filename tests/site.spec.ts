import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("English landing page exposes the real pipeline", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bring C into the Go runtime.",
  );
  await expect(page.getByText("c2go-clang").first()).toBeVisible();
  await expect(
    page.locator(".pipeline-section").getByText("c2go-bind"),
  ).toBeVisible();
  await expect(page.getByText("c2go-libc").first()).toBeVisible();
  await expect(page.locator(".safety-notice")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Get started/ }).first(),
  ).toHaveAttribute("href", "/en/docs/hello-world/");
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

  await page.getByRole("link", { name: "C2Go extensions" }).last().click();
  await expect(page).toHaveURL(/\/en\/docs\/c2go-extensions\/$/);
  await expect(page.getByText("C2GO_DYN(name)", { exact: true })).toBeVisible();
  await expect(
    page.getByText("c2go_extern", { exact: true }).first(),
  ).toBeVisible();
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
