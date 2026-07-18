# Contributing to My USSD Codes [Code Catalog]

Thanks for helping grow the catalog! This repository only contains **data** (JSON collections of USSD codes). Contributions to the apps belong in their own repositories: [Android](https://github.com/albertolicea00/MyUSSDCodes-apk) · [iOS](https://github.com/albertolicea00/MyUSSDCodes-ios).

## Ways to contribute

- **Add a code** to an existing collection.
- **Add a new collection** (e.g. a carrier or country not covered yet).
- **Fix a wrong or deprecated code** — please explain what changed and how you verified it.
- **Improve descriptions, tags or translations.**

## Adding a code

1. Fork the repository and create a branch (`feat/vodafone-de-balance`).
2. Edit the collection file in `codes/`, or create a new one (see below).
3. Follow the schema in [`schema/ussd-code.schema.json`](schema/ussd-code.schema.json). Minimal example:

   ```json
   {
     "id": "carrier-balance",
     "name": "Check balance",
     "description": "Shows the current prepaid balance.",
     "code": "*111#",
     "category": "Balance",
     "tags": ["balance"],
     "source": "Tested on Pixel 8, Carrier X prepaid, 2026-07"
   }
   ```

4. Rules that keep the catalog healthy:
   - `id` is **kebab-case** and unique across the **whole catalog** — prefix it with the collection (`vodafone-de-balance`).
   - Every `{placeholder}` in `code` must be declared in `variables`, and every declared variable must be used.
   - Codes that can lock a SIM, erase settings or **cost money** must set `"dangerous": true` and explain the risk in `notes`.
   - Always fill `source`: a carrier page URL, the GSM spec, or the device/plan where you tested it.
   - Content is written in **English**.
5. Run the validator locally:

   ```bash
   node scripts/validate.js
   ```

6. Open a pull request using the template. One logical change per PR.

## Adding a new collection

1. Create `codes/<collection-id>.json` following [`schema/collection.schema.json`](schema/collection.schema.json).
2. Register it in `codes/index.json` with the exact `count` of codes.
3. Set `country` (ISO 3166-1 alpha-2) and `carrier` when the collection is carrier-specific.
4. Bump `version` on every later content change so the apps can detect updates.

## Commit style

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat: add vodafone germany collection
fix: correct movistar balance code
docs: clarify variable rules
chore: tighten validation script
```

- Lowercase, imperative, no trailing period, subject ≤ 72 chars.
- Types used here: `feat` (new codes/collections), `fix` (corrections), `docs`, `chore`, `ci`.

## Reporting problems

- Wrong or deprecated code → open a **Code fix** issue.
- Tooling/schema problem → open a **Bug report** issue.
- App bugs → use the [Android](https://github.com/albertolicea00/MyUSSDCodes-apk/issues) or [iOS](https://github.com/albertolicea00/MyUSSDCodes-ios/issues) trackers.

## Code of Conduct

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).
