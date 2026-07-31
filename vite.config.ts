// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin, type ViteDevServer } from "vite";

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

/**
 * Serves the functions in `api/` during `vite dev`.
 *
 * Vercel turns every file in `api/` into a serverless function in production, but
 * `vite dev` knows nothing about that directory — so `/api/impersonate` 404s on
 * localhost while working fine once deployed. This mounts the same handlers behind
 * a minimal Vercel-compatible req/res shim so both environments behave alike.
 *
 * Env vars are loaded with an empty prefix because these handlers read unprefixed
 * server-side secrets (SUPABASE_SERVICE_ROLE_KEY), which Vite would not otherwise
 * expose to `process.env`.
 */
function vercelApiDevPlugin(envDir: string): Plugin {
  return {
    name: "pathwise:vercel-api-dev",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      Object.assign(process.env, loadEnv(server.config.mode, envDir, ""));

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) return next();

        const name = url.split("?")[0].slice("/api/".length);
        // Reject path traversal before touching the filesystem.
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) return next();

        const file = resolve(import.meta.dirname, "api", `${name}.js`);
        if (!existsSync(file)) return next();

        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", async () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          try {
            const mod = await server.ssrLoadModule(file);
            // Shim the Express-ish surface Vercel handlers expect.
            const shim = Object.assign(res, {
              status(code: number) {
                res.statusCode = code;
                return shim;
              },
              json(body: unknown) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(body));
                return shim;
              },
            });
            await mod.default(
              Object.assign(req, { body: raw ? JSON.parse(raw) : {} }),
              shim,
            );
          } catch (err) {
            server.config.logger.error(`[api/${name}] ${err}`);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

const envDir = resolveEnvDir(import.meta.dirname);

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
    envDir,
    plugins: [vercelApiDevPlugin(envDir ?? import.meta.dirname)],
  },
});
