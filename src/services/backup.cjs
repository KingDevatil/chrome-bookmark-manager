const ROOT_ROLES = { '1': 'toolbar', '2': 'other', toolbar_____: 'toolbar', unfiled_____: 'other', menu________: 'menu', mobile______: 'mobile' };
function role(node) { const base = node.folderType === 'bookmarks-bar' ? 'toolbar' : node.folderType === 'other' ? 'other' : node.folderType || ROOT_ROLES[node.id] || `extra:${node.id}`; return node.syncing ? `${base}:account` : base; }
function strings(value) {
  if (!Array.isArray(value) || value.some(x => typeof x !== 'string' || x.length > 4096)) throw new Error('Invalid tags');
  return [...new Set(value)];
}
function validURL(value) {
  if (typeof value !== 'string' || value.length > 65536) throw new Error('Invalid URL');
  const url = new URL(value);
  // Preserve browser-supported bookmarklets and local bookmarks; never execute during import.
  if (!url.protocol) throw new Error('Invalid URL');
  return value;
}
function serialize(tree, data = {}) {
  const tags = data.bookmark_tags || {};
  const copy = n => n.url ? { type: 'bookmark', title: n.title || '', url: n.url, tags: tags[n.id] || [] } : { type: 'folder', title: n.title || '', children: (n.children || []).filter(n => !n.unmodifiable).map(copy) };
  return { schemaVersion: 2, kind: 'bookmark-manager-backup', createdAt: new Date().toISOString(), sections: {
    bookmarks: { roots: (tree[0]?.children || []).filter(n => !n.unmodifiable).map(n => ({ role: role(n), title: n.title || '', children: (n.children || []).filter(n => !n.unmodifiable).map(copy) })) },
    tagGroups: data.tagGroups || { groups: [] }, shortcuts: data.shortcuts || [], layoutSettings: data.layoutSettings || {}
  } };
}
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid backup');
  if (JSON.stringify(input).length > 20 * 1024 * 1024) throw new Error('Backup exceeds 20 MB');
  let backup;
  if (input.schemaVersion !== undefined) {
    if (input.schemaVersion !== 2 || input.kind !== 'bookmark-manager-backup') throw new Error('Unsupported backup version');
    backup = structuredClone(input);
  } else {
    if (input.version && !['1.0', '1.1', '1.2', '1.3', '1.4', '1.5'].includes(String(input.version))) throw new Error('Unsupported legacy version');
    const sections = {};
    if (input.bookmarks !== undefined) {
      if (!Array.isArray(input.bookmarks) || input.bookmarks.length !== 1 || !Array.isArray(input.bookmarks[0]?.children)) throw new Error('Invalid bookmark roots');
      let nodes = 0;
      const convert = (n, depth = 0) => {
        if (!n || typeof n !== 'object' || ++nodes > 100000 || depth > 64) throw new Error('Invalid or oversized bookmark tree');
        if (n.url !== undefined) return { type: 'bookmark', title: n.title, url: n.url, tags: input.tags?.[n.id] || input.tagsByUrl?.[n.url] || [] };
        if (!Array.isArray(n.children)) throw new Error('Invalid folder');
        return { type: 'folder', title: n.title, children: n.children.map(x => convert(x, depth + 1)) };
      };
      sections.bookmarks = { roots: input.bookmarks[0].children.map(n => ({ role: role(n), title: n.title || '', children: convert(n).children })) };
    } else if (input.tags) {
      throw new Error('标签文件缺少配套书签树，无法可靠映射 ID。请从原设备重新导出完整备份。');
    }
    for (const key of ['tagGroups', 'shortcuts', 'layoutSettings']) if (input[key] !== undefined) sections[key] = structuredClone(input[key]);
    backup = { schemaVersion: 2, kind: 'bookmark-manager-backup', sections };
    if (input.tagsByUrl) backup.warning = '旧 URL 标签格式无法还原同网址书签原有的标签差异。';
  }
  const s = backup.sections;
  if (!s || typeof s !== 'object' || !Object.keys(s).length || Object.keys(s).some(k => !['bookmarks', 'tagGroups', 'shortcuts', 'layoutSettings'].includes(k))) throw new Error('Invalid backup sections');
  for (const [key, value] of Object.entries(s)) {
    if (!value || typeof value !== 'object' || (key !== 'shortcuts' && Array.isArray(value))) throw new Error(`Invalid section: ${key}`);
  }
  let count = 0;
  function validateNode(n, depth) {
    if (!n || ++count > 100000 || depth > 64 || typeof n.title !== 'string' || n.title.length > 65536) throw new Error('Invalid bookmark node');
    if (n.type === 'bookmark') { validURL(n.url); n.tags = strings(n.tags || []); }
    else if (n.type === 'folder' && Array.isArray(n.children)) n.children.forEach(c => validateNode(c, depth + 1));
    else throw new Error('Invalid folder node');
  }
  if (s.bookmarks) {
    if (!Array.isArray(s.bookmarks.roots) || s.bookmarks.roots.length === 0 || s.bookmarks.roots.length > 100) throw new Error('Invalid roots');
    const roles = new Set();
    s.bookmarks.roots.forEach(r => {
      if (typeof r.role !== 'string' || roles.has(r.role) || !Array.isArray(r.children)) throw new Error('Invalid or duplicate root');
      roles.add(r.role); r.children.forEach(n => validateNode(n, 0));
    });
  }
  if (s.tagGroups) {
    if (!Array.isArray(s.tagGroups.groups)) throw new Error('Invalid tag groups');
    s.tagGroups.groups.forEach(g => { if (typeof g.name !== 'string') throw new Error('Invalid group name'); g.tags = strings(g.tags || []); });
  }
  if (s.shortcuts) {
    if (!Array.isArray(s.shortcuts)) throw new Error('Invalid shortcuts');
    s.shortcuts.forEach(s => { validURL(s.url); if (typeof s.title !== 'string') throw new Error('Invalid shortcut title'); });
  }
  if (s.layoutSettings) {
    const limits = { bookmarkHeight: [24, 48], treeIndent: [5, 20], bookmarkIndent: [5, 20], shortcutIconSize: [40, 120], faviconSize: [12, 24], shortcutIconScale: [40, 100] };
    const clean = {};
    for (const [key, value] of Object.entries(s.layoutSettings)) {
      if (limits[key]) { if (!Number.isFinite(value) || value < limits[key][0] || value > limits[key][1]) throw new Error(`Invalid layout: ${key}`); clean[key] = value; }
    }
    s.layoutSettings = clean;
  }
  return backup;
}
class SerialQueue {
  constructor() { this.tail = Promise.resolve(); }
  run(fn) { const next = this.tail.then(fn); this.tail = next.catch(() => {}); return next; }
}
// Extension storage may reorder object keys; array order and values must stay intact.
function canonicalJSON(value) {
  return JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}
function mergeShortcuts(local, incoming, merge) {
  const result = merge ? [...local] : [];
  for (const item of incoming) if (!result.some(x => x.url === item.url)) result.push({ ...item, id: crypto.randomUUID(), order: result.length });
  return result;
}
async function restore(api, input, merge = true, options = {}) {
  const backup = normalize(input);
  const current = await api.bookmarks.getTree();
  const data = await api.storage.local.get(['bookmark_tags', 'tagGroups', 'shortcuts', 'layoutSettings', 'restore_job']);
  if (['running', 'failed'].includes(data.restore_job?.status) && !options.recovery) throw new Error('上次恢复未完成。请先导出恢复快照或执行快照恢复。');
  const writable = current[0].children.filter(n => !n.unmodifiable);
  const fallback = writable.find(n => role(n) === 'other') || writable[0];
  if (backup.sections.bookmarks && !fallback) throw new Error('No writable bookmark roots');
  // Resolve all roots before deleting anything. Unsupported roots get a visible folder.
  const targets = (backup.sections.bookmarks?.roots || []).map(root => ({ root, target: writable.find(n => role(n) === root.role) }));
  const summary = { created: 0, matched: 0, deleted: 0, skipped: 0, warning: backup.warning };
  const job = { id: crypto.randomUUID(), status: 'running', startedAt: new Date().toISOString(), summary, nodeMap: {}, completedRoots: [] };
  const checkpoint = () => api.storage.local.set({ restore_job: { ...job, summary: { ...summary } } });
  const subtreeSizes = new Map();
  const countTree = node => { const size = 1 + (node.children || []).reduce((sum, child) => sum + countTree(child), 0); subtreeSizes.set(node.id, size); return size; };
  current.forEach(countTree);
  if (!options.recovery) {
    const snapshot = serialize(current, data);
    await api.storage.local.set({ restore_snapshot: snapshot });
    const persisted = await api.storage.local.get('restore_snapshot');
    if (canonicalJSON(persisted.restore_snapshot) !== canonicalJSON(snapshot)) throw new Error('恢复快照保存后校验失败，尚未修改书签，请重试');
  }
  await api.storage.local.set({ restore_job: job });
  const tags = { ...(data.bookmark_tags || {}) };
  let activeOperation = null, externalChange = false;
  const listeners = [];
  for (const name of ['onCreated', 'onRemoved', 'onMoved', 'onChanged', 'onChildrenReordered']) {
    const event = api.bookmarks[name];
    if (!event) continue;
    const listener = (id, node) => {
      const own = name === 'onCreated' && activeOperation?.kind === 'create' && node.parentId === activeOperation.parentId && node.title === activeOperation.title && node.url === activeOperation.url;
      const deletion = name === 'onRemoved' && activeOperation?.kind === 'remove' && id === activeOperation.id;
      if (!own && !deletion) externalChange = true;
    };
    event.addListener(listener); listeners.push([event, listener]);
  }
  const checkConflict = () => { if (externalChange) throw new Error('恢复期间检测到外部书签修改，已停止操作'); };
  async function create(node) {
    checkConflict(); activeOperation = { kind: 'create', ...node };
    try { return await api.bookmarks.create(node); } finally { activeOperation = null; }
  }
  function forget(n) { delete tags[n.id]; (n.children || []).forEach(forget); }
  async function apply(parentId, incoming, path) {
    const existing = await api.bookmarks.getChildren(parentId);
    const used = new Set();
    for (const [index, node] of incoming.entries()) {
      checkConflict();
      const nodePath = `${path}/${index}`;
      let found = merge && existing.find(n => !used.has(n.id) && !n.unmodifiable && n.title === node.title && (node.type === 'bookmark' ? n.url === node.url : !n.url));
      if (found) { used.add(found.id); summary.matched++; }
      else { found = await create({ parentId, title: node.title, ...(node.type === 'bookmark' ? { url: node.url } : {}) }); summary.created++; }
      job.nodeMap[nodePath] = found.id;
      if ((summary.created + summary.matched) % 50 === 0) await checkpoint();
      if (node.type === 'bookmark') tags[found.id] = merge ? [...new Set([...(tags[found.id] || []), ...node.tags])] : node.tags;
      else await apply(found.id, node.children, nodePath);
    }
  }
  try {
    if (JSON.stringify(await api.bookmarks.getTree()) !== JSON.stringify(current)) throw new Error('保存快照期间书签发生变化，请重试');
    for (const { root, target } of targets) {
      checkConflict();
      let parent = target;
      if (!parent) {
        const title = `Imported (${root.role}) ${root.title || ''}`;
        parent = (await api.bookmarks.getChildren(fallback.id)).find(n => !n.url && !n.unmodifiable && n.title === title);
        if (!parent) parent = await create({ parentId: fallback.id, title });
      }
      if (!merge) {
        for (const child of await api.bookmarks.getChildren(parent.id)) {
          if (child.unmodifiable) { summary.skipped += subtreeSizes.get(child.id) || 1; continue; }
          checkConflict(); activeOperation = { kind: 'remove', id: child.id };
          try { await api.bookmarks.removeTree(child.id); } finally { activeOperation = null; }
          forget(child); summary.deleted += subtreeSizes.get(child.id) || 1;
        }
      }
      await apply(parent.id, root.children, root.role);
      job.completedRoots.push(root.role);
      await checkpoint();
    }
    checkConflict();
    const update = {};
    if (backup.sections.bookmarks) {
      const live = new Set();
      const visit = nodes => nodes.forEach(n => { if(n.url)live.add(n.id); if(n.children)visit(n.children); });
      visit(await api.bookmarks.getTree());
      update.bookmark_tags = Object.fromEntries(Object.entries(tags).filter(([id]) => live.has(id)));
    }
    if (backup.sections.shortcuts) update.shortcuts = mergeShortcuts(data.shortcuts || [], backup.sections.shortcuts, merge);
    if (backup.sections.tagGroups) {
      const groups = merge ? structuredClone(data.tagGroups?.groups || []) : [];
      for (const g of backup.sections.tagGroups.groups) {
        const match = groups.find(x => x.name === g.name);
        if (match) match.tags = [...new Set([...match.tags, ...g.tags])];
        else groups.push({ name: g.name, tags: g.tags, id: crypto.randomUUID() });
      }
      update.tagGroups = { groups };
    }
    if (backup.sections.layoutSettings) update.layoutSettings = { ...(data.layoutSettings || {}), ...backup.sections.layoutSettings };
    checkConflict();
    await api.storage.local.set({ ...update, restore_job: { ...job, status: 'complete', summary } });
    return summary;
  } catch (error) {
    await api.storage.local.set({ restore_job: { ...job, status: 'failed', summary, error: error.message } }).catch(() => {});
    throw new Error(`恢复未完成：${error.message}。恢复快照已保留，请在设置中处理。`);
  } finally {
    for (const [event, listener] of listeners) event.removeListener(listener);
  }
}
module.exports = { normalize, serialize, restore, SerialQueue, mergeShortcuts, role, strings, validURL };
