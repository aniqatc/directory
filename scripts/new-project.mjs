#!/usr/bin/env node
// Create a content entry from a template, with interactive prompts or CLI flags.
//
// Examples:
//   npm run new
//   npm run new -- --kind project --title "Huckleberry"
//   npm run new -- --kind experiment --title "World Clock" --live clock.aniqa.dev --repo world-clock
//   npm run new -- --kind experiment --title "Zayn's Garden" --sketch p5
//   npm run new -- --kind experiment --title "Easing Lanes" --sketch study
//
// Options:
//   --kind       project | experiment
//   --sketch     none | canvas | p5 | three | css | study
//   --title      Entry title (required)
//   --slug       Folder name and URL slug (defaults to title)
//   --type       Entry category
//   --stack      Technologies used
//   --released   Release month (YYYY-MM)
//   --updated    Last updated month (YYYY-MM)
//   --live       Live site hostname
//   --repo       GitHub repository name under aniqatc
//   --summary    Entry summary
//   --blurb      Short project card description
//   --draft      Mark the entry as a draft
//   --yes        Skip prompts and use defaults for missing options
//
// Each entry gets an index.md and preview.astro file from its template.
// Template placeholders {{title}} and {{slug}} are replaced in other files.
//
// Projects appear in Selected Work; experiments appear in the Lab.
// Experiments can link to an external site or run a sketch directly on the page.

// Imports and constants for scaffolding new content entries.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

// Paths and configuration for content and templates.
const CONTENT = 'src/content';
const TEMPLATES = 'templates';

// Default frontmatter and dependencies for each embedded sketch type (templates/experiment-<kind>/)
const SKETCHES = {
  // a canvas-based generative sketch
  canvas: { type: 'Generative sketch', stack: 'Canvas / JS', needs: [] },
  // a p5.js-based generative sketch
  p5: { type: 'Generative sketch', stack: 'p5.js', needs: ['p5', '@types/p5'] },
  // a three.js-based 3D sketch
  three: { type: '3D', stack: 'Three.js', needs: ['three', '@types/three'] },
  // a CSS-based art piece
  css: { type: 'CSS art', stack: 'HTML / CSS', needs: [] },
  // a study: one idea with controls, in a stage that grows to fit it (stage: fit)
  study: { type: 'CSS study', stack: 'HTML / CSS', needs: [] },
};

// Aliases for command-line flags and shorthand references.
const ALIASES = { selected: 'project', portfolio: 'project', lab: 'experiment', ts: 'canvas', astro: 'css' };

// --key value pairs; a bare --flag is true
const flags = {};
// Parse command-line flags into the `flags` object.
for (let i = 2; i < argv.length; i++) {
  // Match command-line flags of the form --key
  const m = argv[i].match(/^--([\w-]+)$/);
  // If the current argument is not a flag, skip it.
  if (!m) continue;
  // Determine the value for this flag: true if no value is provided, otherwise the next argument.
  const next = argv[i + 1];
  // Assign the value to the flag: true if no value is provided, otherwise the next argument.
  flags[m[1]] = next === undefined || next.startsWith('--') ? true : (i++, next);
}

// ---------- utility functions ----------
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

// ---------- interactive prompt setup ----------
const interactive = stdin.isTTY && !flags.yes;
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;

// ---------- prompt helper ----------
// Ask the user for input, using a flag if provided, an interactive prompt if available, or a fallback value.
async function ask(key, question, fallback = '') {
  if (flags[key] !== undefined) return flags[key] === true ? '' : String(flags[key]);
  if (!rl) return fallback;
  const hint = fallback ? ` (${fallback})` : '';
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  return answer || fallback;
}

// ---------- answers ----------
// Collect user input for the new project or experiment.
const rawKind = await ask('kind', 'Kind: project (portfolio) or experiment (lab)', 'experiment');
const kind = ALIASES[rawKind] ?? rawKind;
if (kind !== 'project' && kind !== 'experiment')
  fail(`--kind must be project or experiment (got "${rawKind}")`);
const isProject = kind === 'project';

/**
 * Prompt for the title of the new project or experiment.
 */
const title = await ask('title', 'Title');
if (!title) fail('A title is required: --title "Project Name"');

/**
 * Prompt for the folder name / URL slug of the new project or experiment.
 */
const slug = slugify(await ask('slug', 'Folder name / URL slug', slugify(title)));
for (const coll of ['projects', 'experiments']) {
  if (existsSync(`${CONTENT}/${coll}/${slug}`)) fail(`${CONTENT}/${coll}/${slug} already exists`);
}
const dir = `${CONTENT}/${isProject ? 'projects' : 'experiments'}/${slug}`;

/**
 * Prompt for the sketch type if this is an experiment.
 */
const rawSketch = isProject
  ? 'none'
  : await ask('sketch', 'Run it on the site? none (links out), canvas, p5, three, css or study', 'none');
const sketchKind = ALIASES[rawSketch] ?? rawSketch;
if (sketchKind !== 'none' && !SKETCHES[sketchKind]) {
  fail(`--sketch must be none, canvas, p5, three, css or study (got "${rawSketch}")`);
}
const sketch = SKETCHES[sketchKind];

/**
 * Prompt for the type, stack, release date, and other metadata of the new project or experiment.
 */
const type = await ask(
  'type',
  'Type, a label (Web app, Dashboard, Generative sketch, CSS study…)',
  sketch?.type ?? 'Web app',
);

/**
 * Prompt for the stack of the new project or experiment.
 */
const stack = await ask('stack', 'Stack, " / " between tools', sketch?.stack ?? '');

/**
 * Prompt for the release date of the new project or experiment.
 */
const released = await ask('released', 'Released (YYYY-MM)', thisMonth);
if (!/^\d{4}-\d{2}$/.test(released)) fail(`--released must be YYYY-MM (got "${released}")`);

/**
 * Prompt for the live host and GitHub repo of the new project or experiment.
 */
const live = sketch ? '' : await ask('live', 'Live host, no https:// (blank for none)');
const repo = await ask('repo', 'GitHub repo name under aniqatc (blank for none)');

/**
 * Prompt for the last revisited date of the new project or experiment.
 * This is a flag only, since most new entries haven't been revisited yet.
 */
const updated = typeof flags.updated === 'string' ? flags.updated : '';
if (updated && !/^\d{4}-\d{2}$/.test(updated)) fail(`--updated must be YYYY-MM (got "${updated}")`);

/**
 * Prompt for the summary and card blurb of the new project or experiment.
 */
const summary = await ask('summary', 'Summary, two sentences (blank to fill in later)');
const blurb = isProject ? await ask('blurb', 'Card blurb, one line (blank to fill in later)') : '';
rl?.close();

/**
 * Determine the order of the new project in the list of selected work.
 */
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
// ---------- fill index.md template ----------
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
/**
 * Convert a value to YAML-compatible string.
 */
const yaml = (v) =>
  typeof v === 'string' && /^[\s\-?[\]{},&*!|>'"%@`~]|: | #|^\d+$/.test(v)
    ? `'${v.replace(/'/g, "''")}'`
    : String(v);

/**
 * Determine the source template directory for the new project or experiment.
 */
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

// ---------- create project directory and copy template files ----------
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
