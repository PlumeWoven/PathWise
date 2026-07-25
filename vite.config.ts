// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Env files are gitignored, so a `git worktree` checkout has none of its own and
 * the app dies on boot with "Missing Supabase environment variables". In a linked
 * worktree `.git` is a file pointing at `<main>/.git/worktrees/<name>`, so the
 * main checkout — which does have the env files — can be derived from it.
 *
 * Returns undefined for a normal checkout (or when the worktree has its own
 * `.env`), leaving Vite's default `envDir` behaviour untouched.
 */
function resolveEnvDir(root: string): string | undefined {
  if (existsSync(resolve(root, ".env"))) return undefined;

  const gitPath = resolve(root, ".git");
  if (!existsSync(gitPath) || !readFileSync(gitPath, "utf8").startsWith("gitdir:")) {
    return undefined;
  }

  // "gitdir: /path/to/main/.git/worktrees/<name>" → "/path/to/main"
  const gitDir = readFileSync(gitPath, "utf8").slice("gitdir:".length).trim();
  const mainRoot = dirname(dirname(dirname(gitDir)));
  return existsSync(resolve(mainRoot, ".env")) ? mainRoot : undefined;
}

export default defineConfig({
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    },
  },
  vite: {
    envDir: resolveEnvDir(import.meta.dirname),
  },
});
