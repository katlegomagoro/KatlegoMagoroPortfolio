# Katlego Magoro Portfolio — Requirements & Architecture Spec

**Status:** ✅ CONFIRMED — approved for implementation. Future changes will be reviewed and versioned incrementally as the project progresses.
**Repo:** `katlegomagoro/KatlegoMagoroPortfolio` (single repo, environment branches)
**Hosting:** Cloudflare Pages (free tier)

**v3 changelog:** Added a real architecture diagram (Section 4.1, image + text fallback). Added explicit statements in Iteration 2 and Iteration 3 sections clarifying that the MVP branching/CI/CD pipeline is extended, not rebuilt — those phases only add new secrets/environment variables, no new pipeline design. **Approved by Katlego Magoro on 22 June 2026 — implementation may now begin.**

**v2 changelog:** Added Section 8 — Engineering Standards & Git Workflow (branching strategy, commit format, secrets handling, formatting, testing-by-phase). Adapted from general production engineering practice, written fresh for this project — no proprietary employer content reused.

---

## 1. Background & Decisions Already Made

- Old HTML5UP "Massively" template (root-level `index.html`, `generic.html`, `elements.html`) is **retired**. Not migrated, not reused.
- The untouched Vite + React + TypeScript scaffold in `app/` is the **real foundation** going forward.
- Firebase hosting is **retired**. Cloudflare Pages replaces it.
- Visual direction: classic / professional / corporate (navy + white, serif headings, recruiter-credible) — confirmed via mockup v2.
- Positioning: full-stack engineer (.NET/C# *and* Python/data/automation) shown equally — not boxed into one stack.
- Job-application agent (Iteration 3) will **not** auto-submit on third-party sites. It matches, ranks, and drafts only — human clicks submit.

---

## 2. Phase Overview

| Phase | Name | Core Deliverable |
|---|---|---|
| 0 | **MVP** | Static React portfolio, real content, CI/CD to Cloudflare Pages, 3 environments |
| 1 | **Iteration 1** | Visual/UX polish on top of MVP — same architecture, no new infra |
| 2 | **Iteration 2** | AI chat widget + CV upload/parse + CV download (adds a backend) |
| 3 | **Iteration 3** | Job-matching agent + tailored CV/cover letter generator (adds a job-data pipeline) |

Each phase is additive. Nothing in a later phase requires re-architecting an earlier one.

---

## 3. MVP — Detailed Requirements

### 3.1 Functional Requirements

| ID | Requirement |
|---|---|
| MVP-1 | Site displays Katlego's real profile: hero, experience, projects, education, certifications |
| MVP-2 | Site is fully responsive (mobile-first, since primary review device is a phone) |
| MVP-3 | Site builds and deploys automatically on push to designated branches |
| MVP-4 | Three live environments exist: dev, uat, prod — each independently viewable via URL |
| MVP-5 | No template leftovers (HTML5UP, Firebase config, unused Vite starter content) ship to production |

### 3.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Zero ongoing cost — every service used must have a genuinely free tier sufficient for personal-portfolio traffic |
| NFR-2 | No secrets/credentials handled by Claude directly — person performs account creation and connection steps |
| NFR-3 | Git history reflects real incremental commits, not one bulk dump |
| NFR-4 | Build must succeed from a clean clone with documented setup steps |

### 3.3 Out of Scope (MVP)

- AI chat, CV parsing, job matching — explicitly deferred to later phases
- Custom domain DNS — documented as a follow-up step, not blocking for MVP
- Backend/database of any kind

---

## 4. System Architecture

### 4.1 Architecture Diagram

![Architecture diagram: GitHub repo with develop/uat/main branches, feeding GitHub Actions build checks, deploying via Cloudflare Pages native Git integration to three environments — Dev, UAT, and Production with custom domain](./architecture-diagram.png)

The repo holds the React app (with `profile.json` as the single source of truth for content) and three branches. Every push/PR triggers a GitHub Actions build+lint check — not a deploy. Cloudflare Pages' own Git integration watches the same branches and performs the actual deploy, one environment per branch.

<details>
<summary>Text-only version (for terminals/diff views)</summary>

```
                         ┌─────────────────────────┐
                         │   GitHub Repository      │
                         │  KatlegoMagoroPortfolio   │
                         │                           │
                         │   branches:               │
                         │   ┌─────────┐              │
                         │   │ develop │──┐           │
                         │   ├─────────┤  │           │
                         │   │ uat     │──┼─┐         │
                         │   ├─────────┤  │ │         │
                         │   │ main    │──┼─┼─┐       │
                         │   └─────────┘  │ │ │       │
                         └────────────────┼─┼─┼───────┘
                                          │ │ │
                          GitHub Actions: build + lint (every push/PR — check only, no deploy)
                                          │ │ │
                    ┌─────────────────────┘ │ └─────────────────────┐
                    ▼                       ▼                       ▼
          ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
          │ Cloudflare Pages  │   │ Cloudflare Pages  │   │ Cloudflare Pages  │
          │       Dev          │   │       UAT          │   │   PRODUCTION       │
          │  from develop      │   │   from uat         │   │   from main        │
          │  *.pages.dev       │   │  *.pages.dev       │   │ + custom domain    │
          └──────────────────┘   └──────────────────┘   └──────────────────┘
```

</details>

### 4.2 Repo Structure (MVP)

```
KatlegoMagoroPortfolio/
├── app/                        # React + Vite + TS app — THE real project
│   ├── src/
│   │   ├── components/
│   │   ├── data/               # profile.json — structured CV data, single source of truth
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml              # build + test on every push/PR
├── ARCHITECTURE.md             # this document, versioned
├── README.md                   # setup + deploy instructions
└── .gitignore
```

Everything outside `app/` from the old template (root `index.html`, `assets/`, `images/`, `public/`, `firebase.json`, `.firebaserc`) is removed in the cleanup commit. A small subset of real images (project/award photos) migrates into `app/src/assets/` if used.

### 4.3 Branch → Environment Mapping

| Branch | Environment | Cloudflare Pages behaviour | Purpose |
|---|---|---|---|
| `develop` | **Dev** | Auto-deploy on push | Active work-in-progress, safe to break |
| `uat` | **UAT** | Auto-deploy on push | "Does this look right before it's real" review copy |
| `main` | **Production** | Auto-deploy on push | What the public/recruiters see |

This mirrors the dev/uat/prod pattern from your Firebase notes, just remapped onto Cloudflare's native Git integration instead of Firebase CLI targets — same mental model, no CLI multi-target config needed since Cloudflare Pages handles branch→environment mapping natively per push.

**Flow of a change:**
```
feature branch → PR into develop → auto-deploy to Dev
develop → PR into uat → auto-deploy to UAT  (you review)
uat → PR into main → auto-deploy to Production
```

### 4.4 CI/CD Pipeline (MVP)

A single GitHub Actions workflow, intentionally simple — no approval gates or multi-node complexity needed since this is a static frontend with one deploy target per environment, not a clustered server deploy.

```
on: push, pull_request → [develop, uat, main]

job: build
  - checkout
  - setup node
  - npm install
  - npm run build      (tsc -b && vite build)
  - npm run lint
  - (future) npm test
```

Cloudflare Pages itself handles the actual deploy step via its native GitHub integration — it watches the repo and deploys automatically per branch, so GitHub Actions here only needs to **verify the build is healthy**, not perform the deploy. This is simpler than the Expleo-style pipeline because there's no server, no IIS, no approval gate to wire up — Cloudflare's branch-based previews are the approval step (you look at the dev/uat URL yourself before merging forward).

### 4.5 Data Model (MVP)

All profile content lives in one structured file, not hardcoded across components:

```
app/src/data/profile.json
├── basics          { name, title, location, email, links }
├── summary          string
├── skills[]         { name, category }
├── experience[]      { role, org, location, startDate, endDate, bullets[] }
├── projects[]        { name, badge, description, stack[] }
├── education[]       { degree, school, dates, notes }
└── certifications[]  { name, year }
```

This matters beyond tidiness: Iteration 2's CV-upload feature re-generates this exact file from a parsed CV, and Iteration 3's job-matching reads from it. Designing it now means later phases plug in instead of requiring a rewrite.

---

## 5. Iteration 1 — Visual/UX Polish

No new architecture. Same repo, same pipeline, same branches.

| ID | Requirement |
|---|---|
| IT1-1 | Apply the approved design direction (navy/white/professional) across all sections |
| IT1-2 | Add subtle, purposeful motion (scroll reveals, hover states) — restraint over decoration |
| IT1-3 | Add a dedicated "Recognition" treatment for the ELIDZ hackathon |
| IT1-4 | Performance: Lighthouse score check, image optimization for any real photos used |

---

## 6. Iteration 2 — AI Chat + CV Upload/Download

This is where a real backend enters. Cloudflare's own ecosystem covers it for free.

> **Pipeline and deployment scope for this phase:** the branching strategy, GitHub Actions build check, and Cloudflare Pages branch→environment mapping defined in Section 4 are **not rebuilt or redesigned here**. Iteration 2 *extends* the existing MVP pipeline — the only addition is new Cloudflare environment variables/secrets (for the AI API binding) configured per environment, as already specified in Section 8.4. No new CI/CD design work, no new branches, no new deploy targets.

### 6.1 New Components

```
                ┌────────────────────────────┐
                │   React App (unchanged)     │
                │   + ChatWidget component     │
                │   + CV upload UI             │
                │   + "Download CV" button      │
                └─────────────┬───────────────┘
                              │ fetch()
                              ▼
                ┌────────────────────────────┐
                │  Cloudflare Pages Functions  │   ← serverless, same project, free tier
                │  /functions/api/chat.ts      │
                │  /functions/api/parse-cv.ts  │
                └─────────────┬───────────────┘
                       │              │
                       ▼              ▼
          ┌─────────────────┐  ┌─────────────────────┐
          │ Workers AI        │  │  Cloudflare D1/KV     │
          │ (free LLM         │  │  (stores profile.json  │
          │  inference)       │  │   updates from CV       │
          └─────────────────┘  │   parsing)              │
                                └─────────────────────┘
```

### 6.2 Functional Requirements

| ID | Requirement |
|---|---|
| IT2-1 | Visitor can ask the chat widget questions; answers are grounded only in `profile.json` content (no hallucinated claims about Katlego) |
| IT2-2 | Person can download an up-to-date CV (generated client-side from `profile.json`, as PDF) |
| IT2-3 | Person can upload a new CV file; system parses it and proposes updates to `profile.json` |
| IT2-4 | CV-parsed updates require explicit confirmation before publishing — no silent overwrite |
| IT2-5 | Chat and parsing both run on free-tier services with documented usage limits |

### 6.3 Free-Tier Services for This Phase

| Need | Free Option | Notes |
|---|---|---|
| LLM for chat | **Cloudflare Workers AI** (free allocation) or **Groq free API** | Workers AI integrates natively if already on Cloudflare Pages Functions |
| Serverless functions | **Cloudflare Pages Functions** | Same project, no separate hosting needed |
| Structured storage | **Cloudflare D1** (free SQLite) or **KV** | Stores the "current" profile data if it needs to update without a redeploy |
| CV parsing (PDF → text) | Client-side or Workers-side text extraction | Keep dependency-light; avoid paid OCR APIs |
| PDF generation for download | Client-side library (e.g. browser print-to-PDF or a free JS PDF lib) | No server cost |

---

## 7. Iteration 3 — Job Matching & Application Drafting

> **Pipeline and deployment scope for this phase:** same as Iteration 2 — no changes to branching, CI checks, or Cloudflare's branch→environment mapping. Only new secrets (e.g. any job-listing API key, if one requires auth) are added per environment, following the existing Section 8.4 pattern.

### 7.1 Scope (confirmed)

✅ In scope: find/rank relevant jobs, generate tailored CV + cover letter per job, track application status.
❌ Out of scope: auto-filling or auto-submitting forms on third-party sites (PNet, LinkedIn, etc.) — person reviews and submits manually.

### 7.2 New Components

```
┌──────────────────┐     ┌────────────────────────┐     ┌─────────────────────┐
│  Job sources       │ →   │ Matching/scoring         │ →   │  Tailored output       │
│  (public listings,  │     │  function (Pages Fn)     │     │  generator (LLM call)   │
│   RSS/APIs)         │     │  compares listing vs      │     │  → CV variant            │
│                     │     │  profile.json skills      │     │  → cover letter draft    │
└──────────────────┘     └────────────────────────┘     └─────────────────────┘
                                                                      │
                                                                      ▼
                                                          ┌─────────────────────┐
                                                          │  Application tracker  │
                                                          │  (D1 table: status,    │
                                                          │   date, notes)          │
                                                          └─────────────────────┘
```

### 7.3 Functional Requirements

| ID | Requirement |
|---|---|
| IT3-1 | System surfaces job listings relevant to Katlego's skill set from public sources |
| IT3-2 | Each listing is scored/ranked against `profile.json` |
| IT3-3 | For a selected listing, system generates a tailored CV and cover letter draft |
| IT3-4 | Person can mark applications as applied/in-progress/rejected in a simple tracker |
| IT3-5 | No automated submission to any third-party site |

---

## 8. Engineering Standards & Git Workflow

This section exists because a real project needs explicit standards, not implied ones — and because the discipline of writing this down is itself part of the portfolio's value (it shows real engineering practice, not just a finished UI).

### 8.1 Branching Strategy

Trunk-based, environment-branch model — chosen over feature-branch-per-environment because this is a solo project where the main risk is skipping review steps, not coordinating many contributors.

```
feature/xxx  →  PR into develop   →  Dev auto-deploys
develop      →  PR into uat       →  UAT auto-deploys
uat          →  PR into main      →  Production auto-deploys
```

| Rule | Detail |
|---|---|
| No direct pushes to `main` or `uat` | Always via PR, even solo — keeps a reviewable diff and a real history |
| `develop` is the integration branch | All feature branches target `develop` first |
| One PR = one concern | A content fix, a new feature, and a refactor are three PRs, not one |
| Feature branches are short-lived | Named `feature/<short-description>`, deleted after merge |

### 8.2 Commit Message Format

Conventional Commits, with a short body explaining *why* when the change isn't self-evident from the title:

```
feat(hero): add experience timeline component

- pulls data from profile.json instead of hardcoded JSX
- adds responsive breakpoint for mobile stacking
- no visual regression on existing sections
```

Types used: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `ci`.

### 8.3 Code Comments

Comments explain **why**, not **what** — written as a developer explaining their reasoning, not restating the obvious:

```ts
// profile.json is the single source of truth so Iteration 2's CV parser
// can regenerate this file without touching component code
const profile = await loadProfile();
```

No comment-per-line, no commenting on self-evident code, no decorative comment blocks.

### 8.4 Secrets & Configuration — Where Things Live

This directly mirrors the non-negotiable rule from production CI/CD practice: **sensitive values and non-sensitive config are never stored the same way.**

| Type | Examples in this project | Where it lives |
|---|---|---|
| **Secrets** (never committed, never in client bundle) | AI API keys (Iteration 2+), any third-party API tokens (Iteration 3) | Cloudflare Pages **environment variables (encrypted)**, set per environment (dev/uat/prod) via the Cloudflare dashboard |
| **Non-sensitive config** | Site URL, feature flags, public API base paths | Cloudflare **plaintext environment variables**, or committed `.env.example` showing the shape without real values |
| **Never** | Any API key, password, or token in `profile.json`, component code, or git history | — |

Practical rule for this project specifically: since MVP and Iteration 1 are a static frontend with **no backend and no secrets at all**, this section becomes relevant starting Iteration 2 (AI chat needs an API key/binding). It's documented now so the pattern is already decided before that phase starts.

### 8.5 Formatting Enforcement

| Tool | Purpose |
|---|---|
| `.editorconfig` | Consistent indentation (2 spaces), line endings (LF), trailing whitespace rules — enforced regardless of editor |
| ESLint (already scaffolded by Vite) | Catches code issues before commit |
| Prettier (to be added) | Auto-formats on save/commit so style is never a PR debate |

### 8.6 Testing Expectations by Phase

| Phase | Testing requirement |
|---|---|
| MVP | Build must succeed (`tsc -b && vite build`); manual visual check per environment |
| Iteration 1 | Same, plus basic responsive/Lighthouse check |
| Iteration 2 | Unit tests for the chat/parsing functions before merging to `uat` |
| Iteration 3 | Unit tests for matching/scoring logic — this is the part most likely to silently produce wrong results if untested |

### 8.7 Reuse-Before-Build Check

Before implementing anything non-trivial in Iteration 2 or 3 (CV parsing, job matching, PDF generation), check for an existing free, well-maintained library first. Building from scratch is the fallback, not the default — this avoids reinventing solved problems and keeps the codebase smaller and more maintainable.

---

## 9. Decisions Log

| # | Question | Decision |
|---|---|---|
| 1 | Custom domain now or later? | **Now** — custom domain configured from MVP onward |
| 2 | Draft `profile.json` now or review structure first? | **Reviewed structure first** (schema approved separately); real data to be filled in next |
| 3 | Repo/Cloudflare connection approach? | **Ready-to-push commits/branches**, uploaded via GitHub mobile interface — Claude does not connect accounts directly |
| 4 | Document sign-off | **Approved 22 June 2026** — implementation begins |

## 10. Remaining Setup Steps (Not Blocking Document Approval)

These are execution details, not open requirements questions — the document itself is approved. They get resolved as implementation proceeds:

1. **Domain confirmation** — confirm whether an existing domain is already owned (e.g. one referenced in earlier hosting notes) or needs to be purchased through Cloudflare before the Production environment's custom domain step.
2. **`profile.json` real content** — structure is approved; real CV data gets filled in as the first implementation commit.
3. **GitHub/Cloudflare account connection** — performed by Katlego directly, following the step-by-step walkthrough provided alongside the first ready-to-push commit batch.

---

*Document approved 22 June 2026. Implementation in progress. Future revisions will be logged here with version bumps as the project moves through MVP → Iteration 1 → Iteration 2 → Iteration 3.*
