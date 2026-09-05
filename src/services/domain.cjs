const { strings, validURL, normalize, mergeShortcuts } = require('./backup.cjs');
async function mutate(api, command) {
  const { domain, method, args = [] } = command;
  if (!Array.isArray(args)) throw new Error('Invalid command');
  const data = await api.storage.local.get(['bookmark_tags', 'tagGroups', 'shortcuts']);
  let result;
  if (domain === 'tags') {
    const tags = { ...(data.bookmark_tags || {}) };
    const [id, value] = args;
    if (['setTags', 'addTag', 'removeTag', 'removeTags'].includes(method) && typeof id !== 'string') throw new Error('Invalid bookmark ID');
    if (method === 'setTags') tags[id] = strings(value);
    else if (method === 'addTag') tags[id] = strings([...(tags[id] || []), value]);
    else if (method === 'removeTag') tags[id] = (tags[id] || []).filter(t => t !== value);
    else if (method === 'removeTags') delete tags[id];
    else if (method === 'batchAdd') { for (const id of args[0]) tags[id] = strings([...(tags[id] || []), ...args[1]]); }
    else if (method !== 'cleanOrphanedTags') throw new Error('Unknown tag command');
    const live = new Set();
    const visit = nodes => nodes.forEach(n => { if (n.url) live.add(n.id); if (n.children) visit(n.children); });
    visit(await api.bookmarks.getTree());
    const orphaned = {};
    for (const id of Object.keys(tags)) if (!live.has(id)) { orphaned[id] = tags[id]; delete tags[id]; }
    result = { cleaned: Object.keys(orphaned).length, orphanedDetails: orphaned };
    await api.storage.local.set({ bookmark_tags: tags });
  } else if (domain === 'groups') {
    let groups = structuredClone(data.tagGroups?.groups || []);
    const [id, value] = args; const g = groups.find(g => g.id === id);
    if (method === 'createGroup') { if (typeof id !== 'string' || !id.trim()) throw new Error('Invalid group name'); result = { id: crypto.randomUUID(), name: id, tags: [] }; groups.push(result); }
    else if (method === 'deleteGroup') groups = groups.filter(g => g.id !== id);
    else if (method === 'renameGroup') { if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid group name'); if (g) g.name = value; }
    else if (method === 'addTagToGroup') { if (g) g.tags = strings([...g.tags, value]); }
    else if (method === 'removeTagFromGroup') { if (g) g.tags = g.tags.filter(t => t !== value); }
    else if (method === 'clearAll') groups = [];
    else if (method === 'save') throw new Error('Whole-group writes are no longer supported');
    else throw new Error('Unknown group command');
    await api.storage.local.set({ tagGroups: { groups } });
  } else if (domain === 'shortcuts') {
    let items = structuredClone(data.shortcuts || []);
    const [id, value] = args;
    if (method === 'add') { validURL(value); if (items.some(s => s.url === value)) throw new Error('URL already exists'); result = { id: crypto.randomUUID(), title: String(id), url: value, order: items.length }; items.push(result); }
    else if (method === 'remove') items = items.filter(x => x.id !== id);
    else if (method === 'update') { const s = items.find(x => x.id === id); if (s) { validURL(value.url || s.url); if (items.some(x => x.id !== id && x.url === (value.url || s.url))) throw new Error('URL already exists'); Object.assign(s, { title: String(value.title ?? s.title), url: value.url || s.url }); } }
    else if (method === 'reorder') { if (!Array.isArray(id)) throw new Error('Invalid order'); const rank = new Map(id.map((x, i) => [x, i])); items.sort((a,b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity)); }
    else if (method === 'clear') items = [];
    else if (method === 'import') items = mergeShortcuts([], normalize({ shortcuts: id }).sections.shortcuts, false);
    else throw new Error('Unknown shortcut command');
    items.forEach((x, i) => x.order = i);
    await api.storage.local.set({ shortcuts: items });
  } else throw new Error('Unknown domain');
  return result;
}
module.exports = { mutate };
