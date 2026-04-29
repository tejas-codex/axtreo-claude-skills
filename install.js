#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const args      = process.argv.slice(2);
const isProject = args.includes('--project');
const isList    = args.includes('--list');

const targetDir = isProject
  ? path.join(process.cwd(), '.claude', 'commands')
  : path.join(os.homedir(), '.claude', 'commands');

const commandsDir = path.join(__dirname, 'commands');
const files       = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));

if (isList) {
  console.log('Commands in this package:');
  files.forEach(f => console.log('  /' + f.replace('.md', '')));
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

const installed = [];
const updated   = [];

for (const file of files) {
  const dest    = path.join(targetDir, file);
  const exists  = fs.existsSync(dest);
  fs.copyFileSync(path.join(commandsDir, file), dest);
  (exists ? updated : installed).push('/' + file.replace('.md', ''));
}

const scope = isProject ? 'this project (.claude/commands/)' : 'your user account (~/.claude/commands/)';
console.log(`\nAxtreo Claude Skills installed to ${scope}`);
if (installed.length) console.log(`  New:     ${installed.join('  ')}`);
if (updated.length)   console.log(`  Updated: ${updated.join('  ')}`);
console.log('\nRestart Claude Code to pick up the commands.\n');
