import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const site = "https://c2go.buymecompile.top";
const outputDirectory = resolve("dist");
const failures: string[] = [];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const pathname = join(directory, entry.name);
    return entry.isDirectory() ? walk(pathname) : pathname;
  });
}

function routeFor(file: string): string {
  const pathname = relative(outputDirectory, file).replaceAll("\\", "/");
  if (pathname === "index.html") return "/";
  if (pathname.endsWith("/index.html")) {
    return `/${pathname.slice(0, -"index.html".length)}`;
  }
  return `/${pathname}`;
}

function attributes(fragment: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const match of fragment.matchAll(
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
  )) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3]);
  }
  return result;
}

function tagAttributes(source: string, tagName: string) {
  return [...source.matchAll(new RegExp(`<${tagName}\\b([^>]*)>`, "gi"))].map(
    (match) => attributes(match[1]),
  );
}

function metaContent(
  source: string,
  attributeName: "name" | "property",
  value: string,
) {
  return tagAttributes(source, "meta")
    .find(
      (attrs) =>
        attrs.get(attributeName)?.toLowerCase() === value.toLowerCase(),
    )
    ?.get("content");
}

function linksWithRel(source: string, rel: string) {
  return tagAttributes(source, "link").filter((attrs) =>
    attrs.get("rel")?.toLowerCase().split(/\s+/).includes(rel.toLowerCase()),
  );
}

function validateLocalAsset(route: string, value: string | undefined) {
  if (!value) return;
  const url = new URL(value, site);
  if (url.origin !== site) return;
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (!existsSync(join(outputDirectory, pathname))) {
    failures.push(`${route}: missing local asset ${url.pathname}`);
  }
}

function structuredData(source: string, route: string) {
  const documents: Record<string, unknown>[] = [];
  for (const match of source.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    const attrs = attributes(match[1]);
    if (attrs.get("type") !== "application/ld+json") continue;
    try {
      const parsed: unknown = JSON.parse(match[2]);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        failures.push(`${route}: JSON-LD must be an object`);
        continue;
      }
      documents.push(parsed as Record<string, unknown>);
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${String(error)})`);
    }
  }
  return documents;
}

function schemaTypes(documents: Record<string, unknown>[]) {
  const types = new Set<string>();
  for (const document of documents) {
    const graph = Array.isArray(document["@graph"])
      ? (document["@graph"] as Record<string, unknown>[])
      : [document];
    for (const node of graph) {
      const value = node["@type"];
      if (typeof value === "string") types.add(value);
      if (Array.isArray(value)) {
        value
          .filter((item): item is string => typeof item === "string")
          .forEach((item) => types.add(item));
      }
    }
  }
  return types;
}

const htmlFiles = walk(outputDirectory).filter((file) =>
  file.endsWith(".html"),
);
const indexableCanonicals = new Set<string>();
const alternateSets = new Map<
  string,
  { en?: string; "zh-cn"?: string; "x-default"?: string }
>();

for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const route = routeFor(file);
  const robots = metaContent(source, "name", "robots") ?? "";
  const noindex = /(?:^|[,\s])noindex(?:$|[,\s])/i.test(robots);
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
  const description = metaContent(source, "name", "description");
  const h1Count = [...source.matchAll(/<h1\b/gi)].length;

  if (!title) failures.push(`${route}: missing title`);
  if (!description) failures.push(`${route}: missing meta description`);
  if (h1Count !== 1)
    failures.push(`${route}: expected one h1, found ${h1Count}`);
  tagAttributes(source, "img").forEach((attrs) =>
    validateLocalAsset(route, attrs.get("src")),
  );
  for (const rel of ["icon", "apple-touch-icon"]) {
    linksWithRel(source, rel).forEach((attrs) =>
      validateLocalAsset(route, attrs.get("href")),
    );
  }

  if (route === "/") {
    if (!noindex) failures.push("/: locale router must remain noindex");
    if (!source.includes('href="/en/"') || !source.includes('href="/zh-cn/"')) {
      failures.push("/: locale router must expose crawlable language links");
    }
    continue;
  }

  if (route === "/404.html") {
    if (!noindex) failures.push("/404.html: missing noindex");
    continue;
  }

  if (noindex)
    failures.push(`${route}: canonical page is unexpectedly noindex`);
  const htmlLang = tagAttributes(source, "html")[0]?.get("lang");
  if (!htmlLang) failures.push(`${route}: missing html lang`);
  const expectedLanguage = route.startsWith("/zh-cn/") ? "zh-CN" : "en";
  if (htmlLang !== expectedLanguage) {
    failures.push(`${route}: html lang must be ${expectedLanguage}`);
  }

  const canonicalLinks = linksWithRel(source, "canonical");
  if (canonicalLinks.length !== 1) {
    failures.push(
      `${route}: expected one canonical, found ${canonicalLinks.length}`,
    );
    continue;
  }
  const canonical = canonicalLinks[0].get("href");
  if (!canonical?.startsWith(`${site}/`)) {
    failures.push(`${route}: canonical must use ${site}`);
    continue;
  }
  if (canonical !== new URL(route, site).href) {
    failures.push(`${route}: canonical does not match the generated route`);
  }
  if (indexableCanonicals.has(canonical)) {
    failures.push(`${route}: duplicate canonical ${canonical}`);
  }
  indexableCanonicals.add(canonical);

  for (const property of [
    "og:type",
    "og:site_name",
    "og:title",
    "og:description",
    "og:url",
    "og:image",
  ]) {
    if (!metaContent(source, "property", property)) {
      failures.push(`${route}: missing ${property}`);
    }
  }
  for (const name of [
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
  ]) {
    if (!metaContent(source, "name", name)) {
      failures.push(`${route}: missing ${name}`);
    }
  }
  if (metaContent(source, "property", "og:title") !== title) {
    failures.push(`${route}: Open Graph title differs from the document title`);
  }
  if (metaContent(source, "property", "og:description") !== description) {
    failures.push(
      `${route}: Open Graph description differs from meta description`,
    );
  }
  if (metaContent(source, "property", "og:url") !== canonical) {
    failures.push(`${route}: Open Graph URL differs from canonical`);
  }
  if (metaContent(source, "name", "twitter:title") !== title) {
    failures.push(`${route}: Twitter title differs from the document title`);
  }
  if (metaContent(source, "name", "twitter:description") !== description) {
    failures.push(
      `${route}: Twitter description differs from meta description`,
    );
  }
  validateLocalAsset(route, metaContent(source, "property", "og:image"));
  validateLocalAsset(route, metaContent(source, "name", "twitter:image"));

  const alternates: { en?: string; "zh-cn"?: string; "x-default"?: string } =
    {};
  for (const link of linksWithRel(source, "alternate")) {
    const hreflang = link.get("hreflang")?.toLowerCase();
    const href = link.get("href");
    if (
      href &&
      (hreflang === "en" || hreflang === "zh-cn" || hreflang === "x-default")
    ) {
      alternates[hreflang] = href;
    }
  }
  if (!alternates.en || !alternates["zh-cn"] || !alternates["x-default"]) {
    failures.push(`${route}: incomplete hreflang cluster`);
  }
  if (alternates.en && alternates["x-default"] !== alternates.en) {
    failures.push(`${route}: x-default must point to the English counterpart`);
  }
  alternateSets.set(canonical, alternates);

  const documents = structuredData(source, route);
  if (documents.length === 0) failures.push(`${route}: missing JSON-LD`);
  const types = schemaTypes(documents);
  if (route === "/en/" || route === "/zh-cn/") {
    for (const type of ["SoftwareSourceCode", "FAQPage"]) {
      if (!types.has(type)) failures.push(`${route}: missing ${type} schema`);
    }
  } else if (route.includes("/docs/")) {
    for (const type of ["TechArticle", "BreadcrumbList"]) {
      if (!types.has(type)) failures.push(`${route}: missing ${type} schema`);
    }
  } else if (!types.has("WebPage")) {
    failures.push(`${route}: missing WebPage schema`);
  }
}

for (const [canonical, alternates] of alternateSets) {
  for (const [language, href] of Object.entries(alternates)) {
    if (language === "x-default" || !href) continue;
    if (!indexableCanonicals.has(href)) {
      failures.push(
        `${canonical}: hreflang ${language} target is not canonical: ${href}`,
      );
    }
  }
}

const sitemapFiles = walk(outputDirectory).filter((file) =>
  /sitemap-\d+\.xml$/.test(file),
);
const sitemapDocuments = sitemapFiles.map((file) => readFileSync(file, "utf8"));
const sitemapUrls = new Set(
  sitemapDocuments.flatMap((document) =>
    [...document.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
  ),
);
const sitemapAlternates = new Map<string, Map<string, string>>();
for (const document of sitemapDocuments) {
  for (const entry of document.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = entry[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const alternates = new Map<string, string>();
    for (const link of entry[1].matchAll(/<xhtml:link\b([^>]*)\/?\s*>/g)) {
      const attrs = attributes(link[1]);
      const language = attrs.get("hreflang")?.toLowerCase();
      const href = attrs.get("href");
      if (language && href) alternates.set(language, href);
    }
    sitemapAlternates.set(loc, alternates);
  }
}
if (sitemapUrls.has(`${site}/`)) {
  failures.push("sitemap: noindex locale router must be excluded");
}
for (const canonical of indexableCanonicals) {
  if (!sitemapUrls.has(canonical)) {
    failures.push(`sitemap: missing ${canonical}`);
  }
  const pageAlternates = alternateSets.get(canonical);
  const sitemapLinks = sitemapAlternates.get(canonical);
  for (const language of ["en", "zh-cn"] as const) {
    if (sitemapLinks?.get(language) !== pageAlternates?.[language]) {
      failures.push(`sitemap: ${canonical} has invalid ${language} alternate`);
    }
  }
}
for (const url of sitemapUrls) {
  if (!indexableCanonicals.has(url)) {
    failures.push(`sitemap: non-canonical URL ${url}`);
  }
}

if (failures.length > 0) {
  console.error(`Found ${failures.length} SEO validation failure(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `SEO metadata, structured data, hreflang, and sitemap valid across ${htmlFiles.length} generated pages.`,
);
