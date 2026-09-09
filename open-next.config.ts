import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cloudflareConfig = defineCloudflareConfig({});

export default {
  ...cloudflareConfig,
  // `opennextjs-cloudflare build` 会先构建 Next.js 应用，再打包成 Worker。
  // 此处固定为 `npm run build:next`（= next build），避免与顶层 build 脚本互相递归。
  buildCommand: "npm run build:next",
};
