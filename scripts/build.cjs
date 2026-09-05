const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
function files(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name), path.join(prefix, entry.name)) : [path.join(prefix, entry.name)]);
}
async function build() {
  for (const browser of ['chrome', 'firefox']) {
    const out = path.join(root, 'dist', browser);
    fs.mkdirSync(out, { recursive: true });
    const expected = new Set(['manifest.json', 'background.js', path.join('shared', 'platform.js')]);
    for (const [source, destination] of [['src/ui/manager', 'manager'], ['src/ui/sidebar', 'sidebar'], ['src/shared', 'shared'], ['icons', 'icons']]) {
      for (const file of files(path.join(root, source))) expected.add(path.join(destination, file));
    }
    // Preserve unexpected old outputs outside the loadable package instead of shipping them.
    for (const file of files(out)) if (!expected.has(file)) {
      const archive = path.join(root, 'dist', '.stale', `${browser}-${Date.now()}`, file);
      fs.mkdirSync(path.dirname(archive), { recursive: true });
      fs.renameSync(path.join(out, file), archive);
    }
    for (const dir of ['manager', 'sidebar']) fs.cpSync(path.join(root, 'src/ui', dir), path.join(out, dir), { recursive: true });
    fs.cpSync(path.join(root, 'src/shared'), path.join(out, 'shared'), { recursive: true });
    fs.cpSync(path.join(root, 'icons'), path.join(out, 'icons'), { recursive: true });
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifests', `${browser}.json`)));
    manifest.version = require('../package.json').version;
    delete manifest.web_accessible_resources;
    if (browser === 'chrome') manifest.minimum_chrome_version = '116';
    else manifest.background = { scripts: ['background.js'], persistent: false };
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    for (const [input, output] of [['src/background.cjs', 'background.js'], ['src/platform/page.cjs', 'shared/platform.js']]) {
      await esbuild.build({ entryPoints: [path.join(root, input)], outfile: path.join(out, output), bundle: true, platform: 'browser', target: ['chrome116', 'firefox115'], legalComments: 'eof' });
    }
  }
}
build().catch(e => { console.error(e); process.exitCode = 1; });
