export const release = {
  version: "v0.20260801.0-rc.2",
  status: "release-candidate",
  publishedAt: "2026-08-01T17:07:43Z",
  llvmVersion: "22.1.7",
  goRange: ">= 1.25.0, < 1.26.0",
  builderGo: "1.25.9",
  abiEpoch: 1,
  releaseUrl:
    "https://github.com/c2gohq/c2go_toolchain/releases/tag/v0.20260801.0-rc.2",
  sourceUrl:
    "https://github.com/c2gohq/c2go_toolchain/blob/v0.20260801.0-rc.2/toolchain.lock.json",
  components: [
    {
      name: "c2go-clang",
      repository: "https://github.com/c2gohq/c2go_clang",
      revision: "bf5c213a21ce1d84c69d3e85bae2ed270ab6f9fc",
      license: "Apache-2.0 WITH LLVM-exception",
    },
    {
      name: "c2go-bind",
      repository: "https://github.com/c2gohq/c2go_bind",
      revision: "12759ab5ae6c7a71045e7768369c55b7e7bda477",
      license: "AGPL-3.0-only OR separate commercial agreement",
    },
    {
      name: "c2go-libc",
      repository: "https://github.com/c2gohq/c2go_libc",
      revision: "f0f11239eaaaefcd144994bed689b22132ceb16b",
      license: "Mixed; see repository notices",
    },
    {
      name: "musl",
      repository: "https://github.com/c2gohq/musl",
      revision: "a31facd31f63ac569a39f8796b7e5c1494892f1e",
      license: "musl MIT terms and file-specific notices",
    },
  ],
  platforms: [
    {
      id: "linux-amd64",
      label: "Linux",
      architecture: "amd64",
      triple: "x86_64-unknown-linux-goabi",
      archive: "tar.gz",
    },
    {
      id: "linux-arm64",
      label: "Linux",
      architecture: "arm64",
      triple: "aarch64-unknown-linux-goabi",
      archive: "tar.gz",
    },
    {
      id: "windows-amd64",
      label: "Windows",
      architecture: "amd64",
      triple: "x86_64-pc-windows-goabi",
      archive: "zip",
    },
    {
      id: "macos-arm64",
      label: "macOS",
      architecture: "arm64",
      triple: "aarch64-apple-darwin",
      archive: "tar.gz",
    },
  ],
} as const;

export function assetUrl(platform: (typeof release.platforms)[number]) {
  const filename = `c2go-toolchain-${release.version}-${platform.id}.${platform.archive}`;
  return `https://github.com/c2gohq/c2go_toolchain/releases/download/${release.version}/${filename}`;
}
