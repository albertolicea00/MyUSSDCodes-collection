# My USSD Codes  [Code Catalog]

[![Validate collections](https://github.com/albertolicea00/MyUSSDCodes-collection/actions/workflows/validate.yml/badge.svg)](https://github.com/albertolicea00/MyUSSDCodes-collection/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js)](https://nodejs.org)

Community-maintained catalog of USSD codes that feeds the **My USSD Codes** mobile apps.

> 📦 **Related repositories:**
>
> | Platform | Repository |
> | -------- | ---------- |
> | 📱 Android  | [MyUSSDCodes-apk](https://github.com/albertolicea00/MyUSSDCodes-apk) |
> | 📱 iOS      | [MyUSSDCodes-ios](https://github.com/albertolicea00/MyUSSDCodes-ios) |

## 📱 About the apps

**My USSD Codes** is a small utility app for Android and iOS built around three sections (bottom navigation):

1. **Sections** — codes grouped by category and by the user's own fully-customizable groups.
2. **All codes** — a flat, searchable list of every code on the device.
3. **Settings** — import collections from this catalog, manage data, and app info.

Besides importing collections from this repository, users can **create their own codes** with a bit of logic: codes may declare **variables** (placeholders such as `{number}`) that the app asks for right before dialing.

## 📁 Repository layout

```
.
├── codes/                  # The catalog itself
│   ├── index.json          # Manifest listing every collection
│   ├── gsm-standard.json   # GSM standard (carrier-independent) codes
│   ├── cuba-cubacel.json   # ETECSA/Cubacel codes — source of truth for CubaCell Connect
│   ├── cuba-banks.json     # BPA/BANDEC/BM banking codes — source of truth for Banca Remota
│   └── casero-report.json  # casero.rem.cu guest-report code (placeholder, not finalized)
├── schema/                 # JSON Schemas for collections and codes
│   ├── collection.schema.json
│   └── ussd-code.schema.json
├── scripts/
│   └── validate.js         # Validates the whole catalog (no dependencies)
└── .github/                # CI, issue and PR templates
```

## 📋 Collection format

Each collection is a single JSON file inside `codes/`, registered in `codes/index.json` and validated against [`schema/collection.schema.json`](schema/collection.schema.json):

```json
{
  "id": "example-carrier",
  "name": "Example Carrier",
  "description": "Prepaid balance and data codes for Example Carrier.",
  "version": 1,
  "country": "US",
  "carrier": "Example",
  "codes": [
    {
      "id": "example-balance",
      "name": "Check balance",
      "description": "Shows the current prepaid balance.",
      "code": "*111#",
      "category": "Balance",
      "tags": ["balance", "prepaid"]
    },
    {
      "id": "example-transfer",
      "name": "Transfer credit",
      "description": "Transfers credit to another line.",
      "code": "*234*{number}*{amount}#",
      "category": "Balance",
      "variables": [
        { "key": "number", "label": "Destination number", "type": "phone" },
        { "key": "amount", "label": "Amount to transfer", "type": "number" }
      ]
    }
  ]
}
```

### 🔤 Variables

A code may embed placeholders written as `{key}`. Every placeholder must be declared in `variables` (and vice versa). Supported types: `text`, `number`, `phone`. The apps prompt for each variable before dialing.

### ⚠️ Dangerous codes

Codes that can lock a SIM, erase settings or cost money must set `"dangerous": true` (the apps show a warning before running them) and should explain the risk in `notes`.

## ✅ Validation

No dependencies needed — plain Node.js (18+):

```bash
node scripts/validate.js
```

CI runs the same script on every push and pull request.

## 📥 Importing into the app

The apps read raw files straight from this repository, e.g.:

```
https://raw.githubusercontent.com/albertolicea00/MyUSSDCodes-collection/main/codes/gsm-standard.json
```

Paste a collection URL in **Settings → Import** inside the app.

## 🔄 Source of truth for the other apps

Several of my apps ship their own USSD codes for different domains. Keeping the
same code correct in each repo by hand does not scale — change one and the rest
silently drift. **This catalog is the single source of truth.** Each consuming
repo runs a **weekly GitHub Action** that compares its shipped dial strings
against the canonical collection here and, on any drift, fails the run and opens
a tracking issue.

| Collection | Consumer repo | What it feeds |
| ---------- | ------------- | ------------- |
| [`codes/cuba-cubacel.json`](codes/cuba-cubacel.json) | [cubacell-connect](https://github.com/albertolicea00/cubacell-connect) | ETECSA/Cubacel service codes |
| [`codes/cuba-banks.json`](codes/cuba-banks.json) | [BancaRemota_app](https://github.com/albertolicea00/BancaRemota_app) | BPA / BANDEC / BM banking codes |
| [`codes/casero-report.json`](codes/casero-report.json) | [casero.cu-apk](https://github.com/albertolicea00/casero.cu-apk) · [casero.cu-ios](https://github.com/albertolicea00/casero.cu-ios) | guest-report code — **placeholder, not finalized** |
| [`codes/gsm-standard.json`](codes/gsm-standard.json) | [MyUSSDCodes-apk](https://github.com/albertolicea00/MyUSSDCodes-apk) · [MyUSSDCodes-ios](https://github.com/albertolicea00/MyUSSDCodes-ios) | bundled seed catalog |

**Workflow:** edit the code here first, bump the collection `version` and
`index.json`, then update the consuming app to match. The consumers compare only
the **set of dial strings**, so cosmetic fields (names, categories) can differ
per app. The `casero-report` collection is a placeholder: its check is expected
to stay red until the real casero.rem.cu reporting code is published here (the
`placeholder` tag removed).

## 🤝 Contributing

New codes and collections are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Every submitted code needs a source and, ideally, confirmation that it was tested on a real device.

## ⚠️ Disclaimer

USSD codes are executed by your carrier, not by the apps. Codes vary by country, carrier and plan; some may be paid services. Always double-check a code before running it. This project and its contributors are not responsible for charges or side effects caused by dialing any code.

## 📄 License

[MIT](LICENSE) © 2026 Alberto Licea
