import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { flatDocs } from "../src/data/navigation";
import { release } from "../src/data/release";

const root = path.resolve("src/content/docs");
const locales = ["en", "zh-cn"] as const;
const expected = flatDocs.map((item) => item.slug).sort();

function readFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("missing YAML frontmatter");
  return match[1];
}

for (const locale of locales) {
  const files = (await readdir(path.join(root, locale)))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .sort();

  if (JSON.stringify(files) !== JSON.stringify(expected)) {
    throw new Error(
      `${locale} document slugs differ from navigation:\n${files.join("\n")}`,
    );
  }

  for (const slug of files) {
    const filename = path.join(root, locale, `${slug}.mdx`);
    const source = await readFile(filename, "utf8");
    const frontmatter = readFrontmatter(source);
    if (!frontmatter.includes(`locale: ${locale}`)) {
      throw new Error(`${filename}: locale does not match directory`);
    }
    if (!frontmatter.includes(`release: ${release.version}`)) {
      throw new Error(`${filename}: release is not ${release.version}`);
    }
    if (!frontmatter.includes("sourceLinks:")) {
      throw new Error(`${filename}: sourceLinks is required`);
    }
    if (!source.match(/^##\s+/m)) {
      throw new Error(
        `${filename}: at least one level-two heading is required`,
      );
    }
  }
}

console.log(
  `Validated ${expected.length * locales.length} localized documentation pages.`,
);
