import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @repo/shared ships raw TypeScript (its "main" points at src/*.ts). Next has
  // to transpile it, and its internal ESM imports use ".js" extensions that
  // resolve to ".ts" on disk.
  transpilePackages: ["@repo/shared"],
};

export default nextConfig;
