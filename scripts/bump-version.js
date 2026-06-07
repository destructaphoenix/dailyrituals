// scripts/bump-version.js
// Usage: node scripts/bump-version.js build|native
// Edits app.config.js in place. Agents call this via npm run bump:build / bump:native.
'use strict';

const fs = require('fs');
const path = require('path');
const { bumpConfigText } = require('./bumpVersionCore');

const mode = process.argv[2];
const file = path.join(__dirname, '..', 'app.config.js');

const text = fs.readFileSync(file, 'utf8');
const next = bumpConfigText(text, mode); // throws on bad mode / missing fields
fs.writeFileSync(file, next);

const changed = next
  .split('\n')
  .filter((l) => /(^|\s)version:\s*'|versionCode:\s*\d/.test(l))
  .map((l) => l.trim())
  .join('  |  ');
console.log(`bump (${mode}) ok → ${changed}`);
