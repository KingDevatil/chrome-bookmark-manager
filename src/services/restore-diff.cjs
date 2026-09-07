const { role, mergeShortcuts } = require('./backup.cjs');

// Compare by the same parent/title/URL and occurrence rules used by restore.
function restoreDiff(backup, tree, data, merge) {
  const entries = [];
  const add = (status, path, before, after, kind = '书签') => entries.push({ status, path, kind, before, after });
  const view = n => ({ title: n.title, ...(n.url ? { url: n.url, tags: n.tags || data.bookmark_tags?.[n.id] || [] } : {}) });
  function walk(old, incoming, path) {
    const used = new Set();
    for (const node of incoming) {
      const found = old.find(n => !n.unmodifiable && !used.has(n.id) && n.title === node.title && (node.type === 'bookmark' ? n.url === node.url : !n.url));
      const location = `${path} / ${node.title || '(未命名)'}`;
      const kind = node.type === 'bookmark' ? '书签' : '文件夹';
      if (found) used.add(found.id);
      const before = found ? view(found) : null;
      const after = view(node);
      if (found && node.type === 'bookmark' && merge) after.tags = [...new Set([...before.tags, ...after.tags])];
      add(!found ? 'added' : JSON.stringify(before) !== JSON.stringify(after) ? 'changed' : 'matched', location, before, after, kind);
      if (node.type === 'folder') walk(found?.children || [], node.children, location);
    }
    const remainder = (node, path, status) => {
      const location = `${path} / ${node.title || '(未命名)'}`;
      add(status, location, view(node), status === 'deleted' ? null : view(node), node.url ? '书签' : '文件夹');
      for (const child of node.children || []) remainder(child, location, status);
    };
    for (const node of old) if (!used.has(node.id)) remainder(node, path, node.unmodifiable ? 'skipped' : merge ? 'retained' : 'deleted');
    if (!merge) {
      const oldOrder = old.filter(n => !n.unmodifiable).map(n => [n.title, n.url || null]);
      const newOrder = incoming.map(n => [n.title, n.url || null]);
      if (JSON.stringify(oldOrder) !== JSON.stringify(newOrder)) add('changed', path, oldOrder, newOrder, '目录顺序');
    }
  }
  const roots = tree[0].children.filter(n => !n.unmodifiable);
  const fallback = roots.find(n => role(n) === 'other') || roots[0];
  for (const root of backup.sections.bookmarks?.roots || []) {
    let target = roots.find(n => role(n) === root.role);
    let path = target?.title || `Imported (${root.role}) ${root.title || ''}`;
    if (!target) {
      if (!fallback) throw new Error('No writable bookmark roots');
      target = fallback.children.find(n => !n.url && !n.unmodifiable && n.title === path);
      path = `${fallback.title} / ${path}`;
      if (!target) add('added', path, null, { title: path.split(' / ').at(-1) }, '文件夹');
    }
    walk(target?.children || [], root.children, path);
  }
  if (backup.sections.shortcuts) {
    const simplify = items => items.map(({ title, url }, order) => ({ title, url, order }));
    const before = simplify(data.shortcuts || []);
    const after = simplify(mergeShortcuts(data.shortcuts || [], backup.sections.shortcuts, merge));
    for (const item of after) {
      const local = before.find(n => n.url === item.url);
      add(!local ? 'added' : JSON.stringify(local) === JSON.stringify(item) ? 'matched' : 'changed', `捷径 / ${item.title}`, local || null, item, '捷径');
    }
    for (const item of before) if (!after.some(n => n.url === item.url)) add('deleted', `捷径 / ${item.title}`, item, null, '捷径');
  }
  if (backup.sections.tagGroups) {
    const before = (data.tagGroups?.groups || []).map(({ name, tags }) => ({ name, tags }));
    const after = merge ? structuredClone(before) : [];
    for (const group of backup.sections.tagGroups.groups) {
      const match = after.find(g => g.name === group.name);
      if (match) match.tags = [...new Set([...match.tags, ...group.tags])];
      else after.push({ name: group.name, tags: group.tags });
    }
    if (JSON.stringify(before) !== JSON.stringify(after)) add('changed', '标签分组', before, after, '标签分组');
  }
  for (const [key, value] of Object.entries(backup.sections.layoutSettings || {})) {
    if (data.layoutSettings?.[key] !== value) add('changed', `布局 / ${key}`, data.layoutSettings?.[key] ?? null, value, '布局');
  }
  const counts = {};
  for (const entry of entries) counts[entry.status] = (counts[entry.status] || 0) + 1;
  return { entries, counts };
}
module.exports = { restoreDiff };
