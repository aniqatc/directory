#!/usr/bin/env node
// Create an app review from templates/review/, with interactive prompts or CLI flags.
// Run through `npm run new` (pick "review"), or straight away:
//
//   npm run new -- --kind review --app "Tallyho" --maker tallyhoapp --live tallyho.app
//   npm run new -- --kind review --app "Tallyho" --device phone --live https://apps.apple.com/app/id123
//
// Options:
//   --app      The app's name (required)
//   --slug     Folder name and URL slug (defaults to the app's name)
//   --maker    The maker's X handle, without the @
//   --live     A web app's address (no https://), or a phone / iPad app's App Store link
//   --device   browser | phone | tablet (browser by default)
//   --type     A label: Web app, iOS app, Chrome extension… (from the device by default)
//   --summary  One line on what the app does
//   --yes      Skip prompts and use defaults for anything missing
//
// The review starts as a draft, so it only shows on npm run dev until you delete `draft: true`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

const DIR = 'src/content/reviews';
const TEMPLATE = 'templates/review/index.md';
const DEVICES = ['browser', 'phone', 'tablet'];
const TYPES = { browser: 'Web app', phone: 'iOS app', tablet: 'iPad app' };
const TRIED_ON = { browser: 'MacBook, Chrome', phone: 'iPhone', tablet: 'iPad' };

// --key value pairs; a bare --flag is true
const flags = {};
for (let i = 2; i < argv.length; i++) {
  const match = argv[i].match(/^--([\w-]+)$/);
  if (!match) continue;
  const next = argv[i + 1];
  flags[match[1]] = next === undefined || next.startsWith('--') ? true : (i++, next);
}

const fail = (message) => {
  console.error(`✗ ${message}`);
  exit(1);
};
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const rl = stdin.isTTY && !flags.yes ? createInterface({ input: stdin, output: stdout }) : null;
// a flag if given, else a prompt, else the fallback
async function ask(key, question, fallback = '') {
  if (flags[key] !== undefined) return flags[key] === true ? '' : String(flags[key]);
  if (!rl) return fallback;
  const hint = fallback ? ` (${fallback})` : '';
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  return answer || fallback;
}

// ---------- answers ----------
const app = await ask('app', "App's name", typeof flags.title === 'string' ? flags.title : '');
if (!app) fail('The app needs a name: --app "Tallyho"');
const slug = slugify(await ask('slug', 'Folder name / URL slug', slugify(app)));
if (existsSync(`${DIR}/${slug}`)) fail(`${DIR}/${slug} already exists`);
const device = await ask('device', 'Device: browser (web app), phone or tablet', 'browser');
if (!DEVICES.includes(device)) fail(`--device must be browser, phone or tablet (got "${device}")`);
const maker = (await ask('maker', "Maker's X handle, without the @")).replace(/^@/, '');
const live = await ask(
  'live',
  device === 'browser' ? "The app's address, no https://" : "The app's App Store link",
);
const type = await ask('type', 'Type (Web app, iOS app, Chrome extension…)', TYPES[device]);
const summary = await ask('summary', 'One line on what the app does (blank to fill in later)');
rl?.close();

// ---------- index.md from the template ----------
// quote a value when YAML would read it as something else
const yaml = (value) =>
  /^[\s\-?[\]{},&*!|>'"%@`~#]|: | #|^\d+$/.test(value) ? `'${value.replace(/'/g, "''")}'` : value;
const values = { app, maker, date: today, type, triedOn: TRIED_ON[device], live, device, summary };
const [, front, body] = readFileSync(TEMPLATE, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const lines = front
  .split('\n')
  // drop the template's notes, keep commented-out fields like # post:
  .filter((line) => !line.startsWith('#') || /^#\s*\w+:/.test(line))
  .map((line) => {
    const match = line.match(/^(\w+):/);
    const value = match && values[match[1]];
    return value ? `${match[1]}: ${yaml(value)}` : line;
  });
mkdirSync(`${DIR}/${slug}`, { recursive: true });
writeFileSync(`${DIR}/${slug}/index.md`, `---\n${lines.join('\n')}\n---\n${body}`);

// ---------- report ----------
console.log(`✓ ${DIR}/${slug}/  →  /reviews/${slug}  (draft)`);
console.log('\nNext:');
if (device === 'browser') {
  console.log(`  · npm run screenshots -- reviews/${slug}  for screenshot.png and logo.png`);
} else {
  console.log(`  · Screenshots from your ${device === 'phone' ? 'phone' : 'iPad'} go in ${DIR}/${slug}/:`);
  console.log(
    device === 'phone'
      ? '    screenshot.png, screenshot-2.png, screenshot-3.png (up to three)'
      : '    screenshot.png, in landscape',
  );
  console.log("  · The app's icon from its App Store page goes in logo.png");
}
console.log('  · Fill in the scores, verdict, brand colour and sections in index.md');
console.log('  · Check it on npm run dev, then delete draft: true');
