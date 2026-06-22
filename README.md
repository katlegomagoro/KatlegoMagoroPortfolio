# Katlego Magoro — Portfolio

Personal portfolio site. Full architecture and engineering standards are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md) — this README only covers day-to-day setup and the Cloudflare Pages connection steps.

## Stack

- React + Vite + TypeScript (`app/`)
- Content sourced from `app/src/data/profile.json` (single source of truth)
- Hosted on Cloudflare Pages (free tier), three environments via branch mapping
- CI: GitHub Actions runs build + lint + format check on every push/PR (no deploy — Cloudflare handles that)

## Local Setup

```bash
git clone https://github.com/katlegomagoro/KatlegoMagoroPortfolio.git
cd KatlegoMagoroPortfolio/app
npm install
npm run dev       # local dev server
npm run build     # production build — must succeed clean (tsc -b && vite build)
npm run lint      # ESLint check
npm run format    # auto-format with Prettier
```

If `npm run build` fails on a clean clone, that's a bug — see NFR-4 in `ARCHITECTURE.md`.

## Branch → Environment Mapping

| Branch    | Environment | URL                          |
| --------- | ----------- | ----------------------------- |
| `develop` | Dev         | `*.pages.dev` (auto-generated) |
| `uat`     | UAT         | `*.pages.dev` (auto-generated) |
| `main`    | Production  | Custom domain                 |

Flow of a change: `feature/xxx` → PR into `develop` → PR into `uat` → PR into `main`. No direct pushes to `uat` or `main`.

## Connecting Cloudflare Pages (one-time setup, done by Katlego)

This is a manual, one-time step performed directly in the Cloudflare dashboard — Claude does not connect accounts (per `ARCHITECTURE.md` NFR-2 and Decision #3).

1. **Push this repo to GitHub** first (`develop` branch at minimum) so Cloudflare has something to connect to.
2. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare's GitHub App and select `katlegomagoro/KatlegoMagoroPortfolio`.
4. **Build settings** (set these exactly):
   | Setting | Value |
   |---|---|
   | Framework preset | Vite |
   | Build command | `npm run build` |
   | Build output directory | `app/dist` |
   | Root directory | `app` |
5. **Production branch**: set to `main`. This is what gives `main` the Production designation and the custom domain.
6. **Preview branches**: Cloudflare auto-deploys *every* branch by default as a preview. After the first deploy, go to the project's **Settings → Builds & deployments** and confirm `develop` and `uat` are included (they will be, by default) — no extra config needed beyond step 5.
7. Click **Save and Deploy**. The first build runs immediately against whichever branch you pushed.
8. Once deployed, each branch gets its own `*.pages.dev` subdomain automatically — Cloudflare shows these in the project's **Deployments** tab.
9. **Custom domain** (Production only): **Settings → Custom domains** → **Set up a custom domain** → follow Cloudflare's DNS instructions. This is documented as a non-blocking follow-up step (see `ARCHITECTURE.md` Section 10.1) — it can happen anytime after step 7, it doesn't have to happen before Dev/UAT are live.

After this one-time setup, every future `git push` to `develop`, `uat`, or `main` triggers both:
- a GitHub Actions build/lint/format check (visible in the **Actions** tab), and
- an independent Cloudflare Pages deploy to that branch's environment (visible in the Cloudflare dashboard)

These two are intentionally decoupled — a failing GitHub Action does **not** block Cloudflare's deploy. It's a signal for you to catch problems, not a gate. (If you want it to actually block bad deploys, that's a deliberate future change, not a default — flag it if you want that added.)

## Secrets & Environment Variables

None exist yet — MVP and Iteration 1 are a static frontend with no backend. This section becomes relevant starting Iteration 2 (AI chat). See `ARCHITECTURE.md` Section 8.4 for where things will live once they exist.
