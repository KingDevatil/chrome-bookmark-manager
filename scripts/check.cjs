const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(x => x.isDirectory() ? walk(path.join(dir, x.name)) : [path.join(dir, x.name)]); }
for (const file of walk('src').filter(f => /\.(js|cjs)$/.test(f))) {
  const ast = acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 'latest', sourceType: 'script' });
  const seen = new Set();
  for (const node of ast.body) if (node.type === 'FunctionDeclaration') { if (seen.has(node.id.name)) throw new Error(`${file}: duplicate ${node.id.name}`); seen.add(node.id.name); }
}
for (const browser of ['chrome', 'firefox']) {
  const dir = path.join('dist', browser);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
  const resources = [manifest.background.service_worker, ...(manifest.background.scripts || []), manifest.side_panel?.default_path, manifest.sidebar_action?.default_panel].filter(Boolean);
  for (const f of resources) if (!fs.existsSync(path.join(dir, f))) throw new Error(`Missing ${browser}/${f}`);
  for (const file of walk(dir).filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) if (!fs.existsSync(path.resolve(path.dirname(file), match[1]))) throw new Error(`Missing resource in ${file}: ${match[1]}`);
  }
}
console.log('Source syntax, duplicate declarations and both extension packages checked.');
