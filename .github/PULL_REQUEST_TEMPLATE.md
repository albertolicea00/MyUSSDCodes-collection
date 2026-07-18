# Pull Request

## Summary

<!-- What does this PR add or change? One or two sentences. -->

## Type of change

- [ ] New code(s) in an existing collection
- [ ] New collection
- [ ] Fix to an existing code
- [ ] Docs / tooling / CI

## Source & verification

<!-- Where does each code come from? Carrier page URL, GSM spec, or the device/carrier/plan where you tested it. -->

## Checklist

- [ ] `node scripts/validate.js` passes locally
- [ ] Every code has a `source`
- [ ] Ids are kebab-case and prefixed with the collection id
- [ ] Every `{placeholder}` is declared in `variables` (and vice versa)
- [ ] Risky/paid codes are marked `"dangerous": true` with an explanation in `notes`
- [ ] `codes/index.json` is updated (`count`, `updated`, new collection entry if any)
- [ ] Collection `version` bumped when changing existing content
- [ ] Commits follow Conventional Commits
