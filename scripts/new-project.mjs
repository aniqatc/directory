#!/usr/bin/env node
// Scaffold a new entry by copying a folder from templates/. Asks for what it needs, or takes flags:
//
//   npm run new
//   npm run new -- --kind project --title "Huckleberry"
//   npm run new -- --kind experiment --title "World Clock" --live clock.aniqa.dev --repo world-clock
//   npm run new -- --kind experiment --title "Zayn's Garden" --sketch p5
//
// Flags: --kind project|experiment  --sketch none|canvas|p5|three|css (experiments)  --title  --slug  --type
//        --stack  --released YYYY-MM  --updated YYYY-MM  --live  --repo  --summary  --blurb  --draft
//        --yes (no prompts)
//
// Every entry is a folder in src/content/ with index.md and preview.astro (its drawing, a placeholder to replace).
// The matching templates/ folder is copied: index.md gets the frontmatter filled in; in every other file
// {{title}} and {{slug}} are replaced.
//   project                   templates/project/              → projects/<slug>/      portfolio, /work/<slug>
//   experiment, no sketch     templates/experiment/           → experiments/<slug>/   lab, links out
//   experiment with --sketch  templates/experiment-<sketch>/  → experiments/<slug>/   lab, runs on the page

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

const CONTENT = 'src/content';
const TEMPLATES = 'templates';
// sketch kinds: defaults for the frontmatter, and the packages each needs (templates/experiment-<kind>/)
const SKETCHES = {
  canvas: { type: 'Generative sketch', stack: 'Canvas / JS', needs: [] },
  p5: { type: 'Generative sketch', stack: 'p5.js', needs: ['p5', '@types/p5'] },
  three: { type: '3D', stack: 'Three.js', needs: ['three', '@types/three'] },
  css: { type: 'CSS art', stack: 'HTML / CSS', needs: [] },
};
const ALIASES = { selected: 'project', portfolio: 'project', lab: 'experiment', ts: 'canvas', astro: 'css' };

// --key value pairs; a bare --flag is true
const flags = {};
for (let i = 2; i < argv.length; i++) {
  const m = argv[i].match(/^--([\w-]+)$/);
  if (!m) continue;
  const next = argv[i + 1];
  flags[m[1]] = next === undefined || next.startsWith('--') ? true : (i++, next);
}

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  exit(1);
};
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const now = new Date();
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const interactive = stdin.isTTY && !flags.yes;
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;
/** flag if given, else a prompt (interactive), else the default */
async function ask(key, question, fallback = '') {
  if (flags[key] !== undefined) return flags[key] === true ? '' : String(flags[key]);
  if (!rl) return fallback;
  const hint = fallback ? ` (${fallback})` : '';
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  return answer || fallback;
}

// ---------- answers ----------
const rawKind = await ask('kind', 'Kind: project (portfolio) or experiment (lab)', 'experiment');
const kind = ALIASES[rawKind] ?? rawKind;
if (kind !== 'project' && kind !== 'experiment')
  fail(`--kind must be project or experiment (got "${rawKind}")`);
const isProject = kind === 'project';

const title = await ask('title', 'Title');
if (!title) fail('A title is required: --title "Project Name"');

const slug = slugify(await ask('slug', 'Folder name / URL slug', slugify(title)));
for (const coll of ['projects', 'experiments']) {
  if (existsSync(`${CONTENT}/${coll}/${slug}`)) fail(`${CONTENT}/${coll}/${slug} already exists`);
}
const dir = `${CONTENT}/${isProject ? 'projects' : 'experiments'}/${slug}`;

// experiments either link out to their own site, or run a sketch on the page
const rawSketch = isProject
  ? 'none'
  : await ask('sketch', 'Run it on the site? none (links out), canvas, p5, three or css', 'none');
const sketchKind = ALIASES[rawSketch] ?? rawSketch;
if (sketchKind !== 'none' && !SKETCHES[sketchKind]) {
  fail(`--sketch must be none, canvas, p5, three or css (got "${rawSketch}")`);
}
const sketch = SKETCHES[sketchKind];

const type = await ask(
  'type',
  'Type, a label (Web app, Dashboard, Generative sketch…)',
  sketch?.type ?? 'Web app',
);
const stack = await ask('stack', 'Stack, " / " between tools', sketch?.stack ?? '');
const released = await ask('released', 'Released (YYYY-MM)', thisMonth);
if (!/^\d{4}-\d{2}$/.test(released)) fail(`--released must be YYYY-MM (got "${released}")`);
const live = sketch ? '' : await ask('live', 'Live host, no https:// (blank for none)');
const repo = await ask('repo', 'GitHub repo name under aniqatc (blank for none)');

// last revisited: flag only, since most new entries haven't been
const updated = typeof flags.updated === 'string' ? flags.updated : '';
if (updated && !/^\d{4}-\d{2}$/.test(updated)) fail(`--updated must be YYYY-MM (got "${updated}")`);

const summary = await ask('summary', 'Summary, two sentences (blank to fill in later)');
const blurb = isProject ? await ask('blurb', 'Card blurb, one line (blank to fill in later)') : '';
rl?.close();

// new projects go to the end of Selected work
const order = isProject
  ? 1 +
    Math.max(
      0,
      ...readdirSync(`${CONTENT}/projects`)
        .filter((d) => existsSync(`${CONTENT}/projects/${d}/index.md`))
        .map((d) =>
          Number(
            readFileSync(`${CONTENT}/projects/${d}/index.md`, 'utf8').match(/^order:\s*(\d+)/m)?.[1] ?? 0,
          ),
        ),
    )
  : undefined;

// ---------- index.md from the template ----------
// a value: write it; null: drop the line; undefined: leave the template's line for you to fill in
const values = {
  title,
  type,
  stack: stack || undefined,
  released,
  updated: updated || undefined,
  draft: flags.draft ? true : undefined,
  live: live || null,
  repo: repo || null,
  order,
  summary: summary || undefined,
  blurb: blurb || undefined,
};
const yaml = (v) =>
  typeof v === 'string' && /^[\s\-?[\]{},&*!|>'"%@`~]|: | #|^\d+$/.test(v)
    ? `'${v.replace(/'/g, "''")}'`
    : String(v);

const from = join(TEMPLATES, isProject ? 'project' : sketch ? `experiment-${sketchKind}` : 'experiment');
const fillIndex = (text) => {
  const [, front, body] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const lines = front
    .split('\n')
    .filter((l) => !l.startsWith('#') || /^#\s*\w+:/.test(l)) // drop template instructions, keep commented-out fields
    .flatMap((l) => {
      const m = l.match(/^(#\s*)?(\w+):/);
      if (!m) return [l];
      const v = values[m[2]];
      if (v === null) return [];
      return v === undefined ? [l] : [`${m[2]}: ${yaml(v)}`];
    });
  return `---\n${lines.join('\n')}\n---\n${body}`;
};
const safeTitle = title.replace(/[<>&{}]/g, ''); // it lands in .astro markup too

mkdirSync(dir, { recursive: true });
const files = readdirSync(from);
for (const f of files) {
  const text = readFileSync(join(from, f), 'utf8');
  const out =
    f === 'index.md'
      ? fillIndex(text)
      : text.replace(/\{\{\s*title\s*\}\}/g, safeTitle).replace(/\{\{\s*slug\s*\}\}/g, slug);
  writeFileSync(join(dir, f), out);
}
const sketchFile = files.find((f) => f.startsWith('sketch.'));
const missing = sketch?.needs.filter((pkg) => !existsSync(`node_modules/${pkg}`)) ?? [];

// ---------- report ----------
const url = isProject ? `/work/${slug}` : `/lab/${slug}`;
console.log(
  `✓ ${dir}/  →  ${url}${order ? `  (Selected work #${order})` : ''}${flags.draft ? '  (draft)' : ''}`,
);
console.log(`    from ${from}/: ${files.join(', ')}`);
console.log('\nNext:');
if (missing.length) {
  const [lib, types] = sketch.needs;
  console.log(`  · Install ${lib}: npm i ${lib} && npm i -D ${types}, then restart npm run dev`);
}
console.log(
  `  · Fill in ${dir}/index.md${values.summary ? '' : ', including summary'}${isProject && !blurb ? ' and blurb' : ''}`,
);
console.log(`  · Make the drawing: ${dir}/preview.astro (in Claude Code: /new-drawing ${slug})`);
if (sketchFile) console.log(`  · Make the sketch: ${dir}/${sketchFile}`);
console.log('  · Then make its link-preview card: npm run og');
console.log(`  · Preview at http://localhost:4321${url}  ·  drawing at /dev/drawings?only=${slug}`);
