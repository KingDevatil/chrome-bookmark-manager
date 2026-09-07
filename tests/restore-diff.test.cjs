const { test } = require('node:test');
const assert = require('node:assert/strict');
const { restoreDiff } = require('../src/services/restore-diff.cjs');
const { normalize, restore, serialize } = require('../src/services/backup.cjs');
const { fakeAPI } = require('./helpers.cjs');
const incoming = () => normalize({ schemaVersion: 2, kind: 'bookmark-manager-backup', sections: { bookmarks: { roots: [{ role: 'toolbar', children: [
  { type: 'bookmark', title: 'Local', url: 'https://local.test', tags: ['remote'] },
  { type: 'bookmark', title: '<b>New</b>', url: 'https://new.test', tags: [] }
] }] } } });
test('merge diff reports node tags and additions without deleting local-only nodes', async () => {
 const f = fakeAPI(); await f.api.bookmarks.create({ parentId: '1', title: 'Only local', url: 'https://only.test' });
 const backup = incoming(); const diff = restoreDiff(backup, f.tree, f.data, true);
 assert.equal(diff.counts.added, 1); assert.equal(diff.counts.changed, 1); assert.equal(diff.counts.retained, 1); assert.equal(diff.counts.deleted, undefined);
 const changed = diff.entries.find(e => e.status === 'changed'); assert.deepEqual(changed.after.tags, ['local', 'remote']);
 await restore(f.api, backup, true); const exported = serialize(f.tree, f.data); assert.deepEqual(exported.sections.bookmarks.roots[0].children[0].tags, changed.after.tags);
});
test('overwrite diff reports removals and replacement tags', async () => {
 const f = fakeAPI(); await f.api.bookmarks.create({ parentId: '1', title: 'Only local', url: 'https://only.test' });
 const diff = restoreDiff(incoming(), f.tree, f.data, false);
 assert.equal(diff.counts.deleted, 1); assert.equal(diff.counts.added, 1);
 assert.deepEqual(diff.entries.find(e => e.kind === '书签' && e.status === 'changed').after.tags, ['remote']);
});
test('duplicate URLs are matched one-to-one and unsupported roots reuse imported folder', () => {
 const f = fakeAPI(); const b = incoming(); const nodes = b.sections.bookmarks.roots[0].children;
 nodes[1] = structuredClone(nodes[0]); const d = restoreDiff(b, f.tree, f.data, true); assert.equal(d.counts.added, 1);
 b.sections.bookmarks.roots[0].role = 'menu';
 f.tree[0].children[1].children.push({ id: '30', title: 'Imported (menu) ', children: [{ id: '31', title: 'Old', url: 'https://old.test' }] });
 const overwrite = restoreDiff(b, f.tree, f.data, false); assert.equal(overwrite.counts.deleted, 1); assert.equal(overwrite.counts.added, 2);
});
test('metadata-only diff compares shortcut deletion, groups and layout without bookmark mutations', () => {
 const f = fakeAPI(); const b = normalize({ shortcuts: [{ title: 'New', url: 'https://new.test' }], tagGroups: { groups: [{ name: 'Group', tags: ['tag'] }] }, layoutSettings: { bookmarkHeight: 32 } });
 const d = restoreDiff(b, f.tree, f.data, false); assert.equal(d.counts.added, 1); assert.equal(d.counts.deleted, 1); assert.equal(d.counts.changed, 2); assert(!d.entries.some(e => e.kind === '书签'));
});
