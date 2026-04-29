#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Flags ─────────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const isProject  = args.includes('--project');    // install Claude commands project-local
const withSkills = args.includes('--skills');     // also install to ~/.claude/skills/
const forCursor  = args.includes('--cursor')  || args.includes('--all-tools');
const forWindsurf= args.includes('--windsurf')|| args.includes('--all-tools');
const forCopilot = args.includes('--copilot') || args.includes('--all-tools');
const forCodex   = args.includes('--codex')   || args.includes('--all-tools');
const force      = args.includes('--force');
const listOnly   = args.includes('--list');
const help       = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
axtreo-claude-skills — install Axtreo Claude Code commands + cross-tool adapters

Usage:
  npx github:tejas-codex/axtreo-claude-skills [flags]

Flags:
  (none)          Install commands globally to ~/.claude/commands/ (Claude Code / OpenCode)
  --skills        Also install custom skills to ~/.claude/skills/
  --project       Install commands into ./.claude/commands/ (project-local)
  --cursor        Write .cursor/rules/axtreo.mdc into current directory
  --windsurf      Write .windsurfrules into current directory
  --copilot       Write .github/copilot-instructions.md into current directory
  --codex         Append to AGENTS.md in current directory
  --all-tools     All of the above (cursor + windsurf + copilot + codex)
  --force         Overwrite existing files without prompting
  --list          List what would be installed, then exit
  --help          Show this help

Examples:
  npx github:tejas-codex/axtreo-claude-skills                  # Claude Code global
  npx github:tejas-codex/axtreo-claude-skills --all-tools      # every tool
  npx github:tejas-codex/axtreo-claude-skills --cursor --skills # Cursor + Claude skills
`);
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PKG_DIR  = __dirname;
const CWD      = process.cwd();

function read(rel)      { return fs.readFileSync(path.join(PKG_DIR, rel), 'utf8'); }
function exists(p)      { return fs.existsSync(p); }
function mkdirp(p)      { fs.mkdirSync(p, { recursive: true }); }
function write(p, c, label) {
  if (exists(p) && !force) {
    console.log(`  ~ Skipped (exists): ${label}  — use --force to overwrite`);
    return false;
  }
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, c, 'utf8');
  console.log(`  ✓ ${exists(p) ? 'Updated' : 'Written'}: ${label}`);
  return true;
}
function copyDir(src, dest) {
  mkdirp(dest);
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else write(d, fs.readFileSync(s, 'utf8'), path.relative(PKG_DIR, d));
  }
}

// ── List mode ─────────────────────────────────────────────────────────────────
if (listOnly) {
  const cmds   = fs.readdirSync(path.join(PKG_DIR, 'commands')).filter(f => f.endsWith('.md'));
  const skills = fs.readdirSync(path.join(PKG_DIR, 'skills'));
  console.log('\nCommands:'); cmds.forEach(f => console.log('  /' + f.replace('.md', '')));
  console.log('\nSkills (--skills flag):'); skills.forEach(s => console.log('  ' + s));
  console.log('\nAdapters (--cursor / --windsurf / --copilot / --codex / --all-tools):');
  console.log('  Cursor:   .cursor/rules/axtreo.mdc');
  console.log('  Windsurf: .windsurfrules');
  console.log('  Copilot:  .github/copilot-instructions.md');
  console.log('  Codex:    AGENTS.md');
  process.exit(0);
}

// ── 1. Claude Code / OpenCode commands ───────────────────────────────────────
console.log('\n── Claude Code / OpenCode commands');
const cmdSrc  = path.join(PKG_DIR, 'commands');
const cmdDest = isProject
  ? path.join(CWD, '.claude', 'commands')
  : path.join(os.homedir(), '.claude', 'commands');
mkdirp(cmdDest);

const scope    = isProject ? 'project (.claude/commands/)' : 'global (~/.claude/commands/)';
let   cmdCount = 0;
for (const f of fs.readdirSync(cmdSrc).filter(f => f.endsWith('.md'))) {
  if (write(path.join(cmdDest, f), fs.readFileSync(path.join(cmdSrc, f), 'utf8'), f)) cmdCount++;
}
console.log(`   → ${cmdCount} commands installed to ${scope}`);

// ── 2. Claude Code skills ─────────────────────────────────────────────────────
if (withSkills) {
  console.log('\n── Claude Code skills (~/.claude/skills/)');
  const skillsSrc  = path.join(PKG_DIR, 'skills');
  const skillsDest = path.join(os.homedir(), '.claude', 'skills');
  for (const skill of fs.readdirSync(skillsSrc)) {
    const src  = path.join(skillsSrc, skill);
    const dest = path.join(skillsDest, skill);
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      // flat .md file — wrap in folder
      const name = skill.replace('.md', '');
      mkdirp(path.join(skillsDest, name));
      write(path.join(skillsDest, name, 'SKILL.md'), fs.readFileSync(src, 'utf8'), `skills/${name}/SKILL.md`);
    }
  }
}

// ── 3. Cursor adapter ─────────────────────────────────────────────────────────
if (forCursor) {
  console.log('\n── Cursor (.cursor/rules/axtreo.mdc)');
  write(
    path.join(CWD, '.cursor', 'rules', 'axtreo.mdc'),
    read('adapters/cursor.mdc'),
    '.cursor/rules/axtreo.mdc'
  );
}

// ── 4. Windsurf adapter ───────────────────────────────────────────────────────
if (forWindsurf) {
  console.log('\n── Windsurf (.windsurfrules)');
  const dest = path.join(CWD, '.windsurfrules');
  const content = read('adapters/windsurf.rules');
  if (exists(dest) && !force) {
    console.log('  ~ Skipped (exists) — use --force to overwrite');
  } else {
    const existing = exists(dest) ? fs.readFileSync(dest, 'utf8') : '';
    const marker   = '# === Axtreo Rules (axtreo-claude-skills) ===';
    if (!existing.includes(marker)) {
      fs.writeFileSync(dest, (existing ? existing + '\n\n' : '') + marker + '\n' + content, 'utf8');
      console.log(`  ✓ ${existing ? 'Appended to' : 'Written'}: .windsurfrules`);
    } else {
      console.log('  ~ Already present in .windsurfrules');
    }
  }
}

// ── 5. GitHub Copilot adapter ─────────────────────────────────────────────────
if (forCopilot) {
  console.log('\n── GitHub Copilot (.github/copilot-instructions.md)');
  write(
    path.join(CWD, '.github', 'copilot-instructions.md'),
    read('adapters/copilot-instructions.md'),
    '.github/copilot-instructions.md'
  );
}

// ── 6. OpenAI Codex / AGENTS.md ──────────────────────────────────────────────
if (forCodex) {
  console.log('\n── OpenAI Codex (AGENTS.md)');
  const dest    = path.join(CWD, 'AGENTS.md');
  const content = read('adapters/agents.md');
  const marker  = '<!-- axtreo-claude-skills -->';
  if (exists(dest)) {
    const existing = fs.readFileSync(dest, 'utf8');
    if (!existing.includes(marker)) {
      fs.writeFileSync(dest, existing + '\n\n' + marker + '\n' + content, 'utf8');
      console.log('  ✓ Appended to AGENTS.md');
    } else {
      console.log('  ~ Axtreo section already present in AGENTS.md');
    }
  } else {
    write(dest, marker + '\n' + content, 'AGENTS.md');
  }
}

// ── Done ──────────────────────────────────────────────────────────────────────
console.log(`
✅ Done. Restart your AI tool to pick up the new rules.

Run again with --list to see everything, or --help for all flags.
`);
