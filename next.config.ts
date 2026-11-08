import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to `build/`, the publish directory of the
  // Render static site. Any static host works; no Node server needed.
  output: "export",
  distDir: "build",
  // "/<repo>" when served from a GitHub Pages project URL (set by the deploy workflow); empty at a domain root
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // the default image optimizer needs a server — photos in /public are pre-compressed instead
  images: { unoptimized: true },
  // (cacheComponents / partialPrefetching removed: they enable partial prerendering, which needs a server)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
