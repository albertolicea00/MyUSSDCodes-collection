#!/usr/bin/env node
/**
 * Validates the USSD code catalog:
 *   - codes/index.json parses and references existing files
 *   - every collection matches the documented shape
 *   - ids are kebab-case and unique across the whole catalog
 *   - every {placeholder} in a code is declared in `variables` and vice versa
 *   - manifest `count` matches the real number of codes
 *
 * Plain Node.js (18+), no dependencies. Exit code 0 = valid, 1 = errors.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "codes", "index.json");

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VARIABLE_KEY = /^[a-z][a-zA-Z0-9]*$/;
const DIAL_STRING = /^([*#+0-9]|\{[a-z][a-zA-Z0-9]*\})+$/;
const VARIABLE_TYPES = new Set(["text", "number", "phone"]);
const COUNTRY = /^[A-Z]{2}$/;
const LANGUAGE = /^[a-z]{2}(-[A-Z]{2})?$/;

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

function readJson(filePath, label) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    fail(label, "file not found");
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(label, `invalid JSON (${err.message})`);
    return null;
  }
}

function checkString(file, owner, key, value, { required = false, pattern = null } = {}) {
  if (value === undefined) {
    if (required) fail(file, `${owner}: missing required field "${key}"`);
    return;
  }
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `${owner}: "${key}" must be a non-empty string`);
    return;
  }
  if (pattern && !pattern.test(value)) {
    fail(file, `${owner}: "${key}" value "${value}" does not match ${pattern}`);
  }
}

function placeholdersOf(code) {
  return [...code.matchAll(/\{([a-zA-Z0-9]+)\}/g)].map((m) => m[1]);
}

function validateCode(file, entry, seenCodeIds) {
  const owner = `code "${entry.id ?? "<no id>"}"`;

  checkString(file, owner, "id", entry.id, { required: true, pattern: KEBAB });
  if (entry.id) {
    if (seenCodeIds.has(entry.id)) fail(file, `${owner}: duplicate id (also in ${seenCodeIds.get(entry.id)})`);
    else seenCodeIds.set(entry.id, file);
  }

  checkString(file, owner, "name", entry.name, { required: true });
  checkString(file, owner, "code", entry.code, { required: true, pattern: DIAL_STRING });
  checkString(file, owner, "category", entry.category, { required: true });
  checkString(file, owner, "description", entry.description);
  checkString(file, owner, "source", entry.source);
  checkString(file, owner, "notes", entry.notes);

  if (entry.dangerous !== undefined && typeof entry.dangerous !== "boolean") {
    fail(file, `${owner}: "dangerous" must be a boolean`);
  }

  if (entry.tags !== undefined) {
    if (!Array.isArray(entry.tags)) fail(file, `${owner}: "tags" must be an array`);
    else {
      entry.tags.forEach((t, i) => checkString(file, owner, `tags[${i}]`, t, { required: true }));
      if (new Set(entry.tags).size !== entry.tags.length) fail(file, `${owner}: "tags" contains duplicates`);
    }
  }

  const variables = entry.variables ?? [];
  if (!Array.isArray(variables)) {
    fail(file, `${owner}: "variables" must be an array`);
    return;
  }
  const declared = new Set();
  variables.forEach((variable, i) => {
    const vOwner = `${owner} variables[${i}]`;
    checkString(file, vOwner, "key", variable.key, { required: true, pattern: VARIABLE_KEY });
    checkString(file, vOwner, "label", variable.label, { required: true });
    checkString(file, vOwner, "hint", variable.hint);
    if (!VARIABLE_TYPES.has(variable.type)) {
      fail(file, `${vOwner}: "type" must be one of ${[...VARIABLE_TYPES].join(", ")}`);
    }
    if (variable.key) {
      if (declared.has(variable.key)) fail(file, `${vOwner}: duplicate variable key "${variable.key}"`);
      declared.add(variable.key);
    }
  });

  if (typeof entry.code === "string") {
    const used = new Set(placeholdersOf(entry.code));
    for (const key of used) {
      if (!declared.has(key)) fail(file, `${owner}: placeholder "{${key}}" is not declared in "variables"`);
    }
    for (const key of declared) {
      if (!used.has(key)) fail(file, `${owner}: variable "${key}" is declared but never used in "code"`);
    }
  }
}

function validateCollection(file, collection, seenCodeIds, expectedId) {
  const owner = `collection "${collection.id ?? "<no id>"}"`;

  checkString(file, owner, "id", collection.id, { required: true, pattern: KEBAB });
  if (expectedId && collection.id && collection.id !== expectedId) {
    fail(file, `${owner}: id must match manifest id "${expectedId}"`);
  }
  checkString(file, owner, "name", collection.name, { required: true });
  checkString(file, owner, "description", collection.description);
  checkString(file, owner, "carrier", collection.carrier);
  if (collection.country !== undefined) {
    checkString(file, owner, "country", collection.country, { pattern: COUNTRY });
  }
  if (collection.language !== undefined) {
    checkString(file, owner, "language", collection.language, { pattern: LANGUAGE });
  }
  if (!Number.isInteger(collection.version) || collection.version < 1) {
    fail(file, `${owner}: "version" must be an integer >= 1`);
  }
  if (!Array.isArray(collection.codes) || collection.codes.length === 0) {
    fail(file, `${owner}: "codes" must be a non-empty array`);
    return;
  }
  collection.codes.forEach((entry) => validateCode(file, entry, seenCodeIds));
}

function main() {
  const index = readJson(INDEX_PATH, "codes/index.json");
  if (!index) return report();

  if (!Number.isInteger(index.version) || index.version < 1) {
    fail("codes/index.json", '"version" must be an integer >= 1');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(index.updated ?? "")) {
    fail("codes/index.json", '"updated" must be a YYYY-MM-DD date');
  }
  if (!Array.isArray(index.collections) || index.collections.length === 0) {
    fail("codes/index.json", '"collections" must be a non-empty array');
    return report();
  }

  const seenCodeIds = new Map();
  const seenCollectionIds = new Set();

  for (const entry of index.collections) {
    const label = `codes/index.json -> "${entry.id ?? "<no id>"}"`;
    checkString("codes/index.json", label, "id", entry.id, { required: true, pattern: KEBAB });
    checkString("codes/index.json", label, "name", entry.name, { required: true });
    checkString("codes/index.json", label, "path", entry.path, { required: true });
    if (entry.id) {
      if (seenCollectionIds.has(entry.id)) fail("codes/index.json", `${label}: duplicate collection id`);
      seenCollectionIds.add(entry.id);
    }
    if (!entry.path) continue;

    const file = entry.path;
    const collection = readJson(path.join(ROOT, entry.path), file);
    if (!collection) continue;

    validateCollection(file, collection, seenCodeIds, entry.id);

    const realCount = Array.isArray(collection.codes) ? collection.codes.length : 0;
    if (entry.count !== realCount) {
      fail("codes/index.json", `${label}: "count" is ${entry.count} but ${file} has ${realCount} codes`);
    }
  }

  report(index.collections.length, seenCodeIds.size);
}

function report(collections = 0, codes = 0) {
  if (errors.length > 0) {
    console.error(`Catalog validation FAILED with ${errors.length} error(s):\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(`Catalog OK: ${collections} collection(s), ${codes} code(s).`);
}

main();
