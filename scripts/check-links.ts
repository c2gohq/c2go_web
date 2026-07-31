import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const outputDirectory = resolve("dist");

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

function targetFile(pathname: string): string | undefined {
  const decodedPath = decodeURIComponent(pathname);
  const direct = join(outputDirectory, decodedPath);
  const candidates: string[] = [];

  if (decodedPath.endsWith("/")) {
    candidates.push(join(direct, "index.html"));
  } else if (!extname(decodedPath)) {
    candidates.push(join(direct, "index.html"), `${direct}.html`);
  } else {
    candidates.push(direct);
  }

  return candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
}

const htmlFiles = walk(outputDirectory).filter((file) =>
  file.endsWith(".html"),
);
const failures: string[] = [];

for (const sourceFile of htmlFiles) {
  const source = readFileSync(sourceFile, "utf8");
  const sourceRoute = routeFor(sourceFile);

  for (const match of source.matchAll(/\bhref=(?:"([^"]*)"|'([^']*)')/g)) {
    const href = (match[1] ?? match[2]).replaceAll("&amp;", "&");
    if (!href || href.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(href)) {
      continue;
    }

    const target = new URL(href, `https://c2go.invalid${sourceRoute}`);
    const file = targetFile(target.pathname);
    if (!file) {
      failures.push(`${sourceRoute} -> ${href} (missing path)`);
      continue;
    }

    if (target.hash && file.endsWith(".html")) {
      const fragment = decodeURIComponent(target.hash.slice(1));
      const targetHtml = readFileSync(file, "utf8");
      const ids = new Set(
        [...targetHtml.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/g)].map(
          (id) => id[1] ?? id[2],
        ),
      );
      if (!ids.has(fragment)) {
        failures.push(`${sourceRoute} -> ${href} (missing fragment)`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Found ${failures.length} broken internal link(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Internal links valid across ${htmlFiles.length} generated pages.`);
