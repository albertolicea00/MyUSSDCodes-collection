# CLAUDE.md

Guidance for AI assistants (Claude Code) working in this repository.

## What this repository is

**Data catalog** of USSD codes that feeds the **My USSD Codes** mobile apps. It contains **no app code** — only JSON collections, JSON Schemas, a dependency-free validation script and CI.

**This is NOT a monorepo.** The sibling folders `MyUSSDCodes-apk/` (Android) and `MyUSSDCodes-ios/` (iOS) are **separate git repositories** and are git-ignored here. Never stage, commit or modify them from this repository.

## Layout

```
codes/index.json       Manifest: every collection with id, path and exact code count
codes/*.json           One file per collection (validated against schema/)
schema/                JSON Schemas (collection.schema.json, ussd-code.schema.json)
scripts/validate.js    Catalog validator — plain Node 18+, zero dependencies
.github/               CI (validate.yml), issue forms, PR template
```

## Commands

```bash
node scripts/validate.js   # validate the whole catalog (CI runs exactly this)
```

Always run the validator after touching anything under `codes/` or `schema/`.

## Data rules (enforced by validator)

- Code and collection `id`s: kebab-case, unique across the **whole catalog**; prefix code ids with the collection id.
- `code` may only contain `*#+0-9` and `{placeholders}`.
- Every `{placeholder}` must be declared in `variables` (types: `text`, `number`, `phone`) and every declared variable must be used.
- Codes that can lock a SIM, erase settings or cost money: `"dangerous": true` + risk explained in `notes`.
- Every code should carry a `source`.
- `codes/index.json` must stay in sync: `count` matches real code count, `updated` is a `YYYY-MM-DD` date; bump collection `version` on content changes.
- All content in **English**.

## Conventions

- **Conventional Commits**, lowercase imperative subject, ≤ 72 chars: `feat: add movistar es collection`, `fix: correct imei code description`.
- Types used: `feat` (codes/collections), `fix`, `docs`, `chore`, `ci`.
- **Never add AI attributions, `Co-Authored-By` trailers or "Generated with" footers to commits or PRs.**
- Do not invent USSD codes: only add codes with a verifiable `source`. When unsure, leave a TODO in the PR description instead of guessing.
