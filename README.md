# Katlego Magoro — Portfolio

Personal portfolio site. Full architecture and engineering standards are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md) — this README only covers day-to-day setup and the Cloudflare Pages connection steps.

## Stack

- React + Vite + TypeScript (`app/`)
- Multi-page SPA routing via React Router (`/`, `/experience`, `/projects`, `/contact`)
- Content sourced from `app/src/data/profile.json` (single source of truth)
- Hosted on Cloudflare Pages (free tier), three environments via branch mapping
- Tested with Vitest + React Testing Library
- CI/CD: GitHub Actions builds, lints, format-checks, and tests every PR — then deploys via Wrangler on merge (see "Build & Deploy Pipeline" below). Cloudflare's own auto-deploy is disabled; Actions is the only deploy path.
## App UX Structure

- `Home`: hero, objective, key metrics, skills, recognition, featured media preview
- `Experience`: timeline + education + certifications
- `Projects`: technical project cards + full featured media list
- `Contact`: email, phone, address, location, and social call-to-action

## CV Data Coverage

The profile dataset currently captures:

- Core objective and summary
- Expanded full-stack, QA automation, and data-analysis skill matrix
- Multi-role industry experience from Expleo and program-based training roles
- Technical project portfolio (mobile, web, data, and automation)
- Certifications and media features

Profile image support: `basics.headshot` in `app/src/data/profile.json` points to a file path under `app/public` (e.g. `/Kat_WSU.jpeg`) and is used directly as an `<img>` src on the homepage hero. Separately, `basics.image` and per-experience/per-project `image` fields point to plain filenames resolved via `app/src/assetMap.ts` against files in `app/src/assets/` — these two mechanisms exist because the project currently has two independent UI implementations being merged; this should be consolidated into one image-handling approach in Iteration 1.

## Local Setup

```bash
git clone https://github.com/katlegomagoro/KatlegoMagoroPortfolio.git
cd KatlegoMagoroPortfolio/app
npm install
npm run dev       # local dev server
npm run build     # production build — must succeed clean (tsc -b && vite build)
npm run lint      # ESLint check
npm run test      # Vitest test suite
npm run format    # auto-format with Prettier
```

If `npm run build` fails on a clean clone, that's a bug — see NFR-4 in `ARCHITECTURE.md`.

## Branch → Environment Mapping

| Branch    | Environment | URL                          |
| --------- | ----------- | ----------------------------- |
| `develop` | Dev         | `*.pages.dev` (auto-generated) |
| `uat`     | UAT         | `*.pages.dev` (auto-generated) |
| `main`    | Production  | Custom domain                 |

Flow of a change: `feature/ShortPascalCase` → PR into `develop` → PR into `uat` → PR into `main`. No direct pushes to `uat` or `main`.

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
5. **Production branch**: set to `main`. This is what gives `main` the Production designation and the custom domain — Cloudflare's UI still organizes things this way even though it's no longer the thing triggering deploys.
6. **Disable automatic deployments**: in the project's **Settings → Builds → Branch control**, set **Automatic deployments** to **Disabled**. This is required — GitHub Actions (via Wrangler) is the only deploy path now; leaving Cloudflare's native auto-deploy on would race against it on every push.
7. Click **Save and Deploy**. The first build runs immediately against whichever branch you pushed.
8. Once deployed, each branch gets its own `*.pages.dev` subdomain automatically — Cloudflare shows these in the project's **Deployments** tab.
9. **Custom domain** (Production only): **Settings → Custom domains** → **Set up a custom domain** → follow Cloudflare's DNS instructions. This is documented as a non-blocking follow-up step (see `ARCHITECTURE.md` Section 10.1) — it can happen anytime after step 7, it doesn't have to happen before Dev/UAT are live.

## Build & Deploy Pipeline

This replaced an earlier setup where Cloudflare's own Git integration auto-deployed on every push. That's now disabled — **GitHub Actions is the only deploy path**, modeled on the same build → artifact → deploy shape used for production deploys at Expleo (ELSA), scaled down for a single static-site deploy target per environment.

**How it works:**

1. Every PR into `develop`, `uat`, or `main` runs the `build` job: install, build, lint, format check, test (Vitest). This runs on every PR update, so you see pass/fail before merging.
2. **On merge**, a deploy job runs for whichever branch the PR targeted:
   - **`develop` → Dev**: deploys immediately, no approval needed. Matches `develop`'s role as "safe to break."
   - **`uat` → UAT**: **pauses and waits for your manual approval** before deploying. Go to the Actions run page for that PR merge — there's a "Review pending deployments" prompt.
   - **`main` → Production**: same manual approval pause.
3. After deploy jobs complete, one "Health Cluster Verify" job runs and checks Dev, UAT, and Production URLs. Each endpoint must return HTTP 200 (with retries) for the workflow to pass.

**Why approval lives on the deploy step, not the PR review:** GitHub blocks self-approval on PR reviews, and this is a solo project with no second reviewer — so branch-protection-required-reviews would lock the repo's only developer out of merging anything. GitHub Environments (`uat`, `production`), each with a required reviewer, support self-approval by design, which is why the gate sits there instead.

**One-time setup required** (already done, documented here for reference): create the `uat` and `production` [GitHub Environments](https://github.com/katlegomagoro/KatlegoMagoroPortfolio/settings/environments), each with **Required reviewers** set to `katlegomagoro`, and add two repo secrets — `CLOUDFLARE_API_TOKEN` (Pages: Edit permission, scoped to this account only) and `CLOUDFLARE_ACCOUNT_ID`.

## Secrets & Environment Variables

Two repo secrets exist for the deploy pipeline: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (see Build & Deploy Pipeline above). No app-level secrets exist yet — MVP and Iteration 1 are a static frontend with no backend of their own. App-level secrets (AI API keys, etc.) become relevant starting Iteration 2. See `ARCHITECTURE.md` Section 8.4 for where those will live once they exist.
