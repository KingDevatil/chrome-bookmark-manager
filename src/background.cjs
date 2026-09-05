const { createAPI } = require('./platform/api.cjs');
const { normalize, serialize, restore, SerialQueue, role } = require('./services/backup.cjs');
const { WebDAVClient } = require('./services/webdav.cjs');
const { mutate } = require('./services/domain.cjs');
const { createIconCache } = require('./services/favicon.cjs');
const api = createAPI(globalThis.browser || globalThis.chrome);
const saveIcon = createIconCache(api);
const queue = new SerialQueue();
let client, backupFlight;
const previews = new Map();
async function configure() {
  const { webdavConfig: config, backupSettings: settings = {} } = await api.storage.local.get(['webdavConfig', 'backupSettings']);
  client?.cancel();
  client = config?.enabled && config.url ? new WebDAVClient(config) : null;
  if (client && settings.autoBackup && Number.isFinite(settings.backupInterval) && settings.backupInterval >= 1) await api.alarms.create('backup', { periodInMinutes: settings.backupInterval });
  else await api.alarms.clear('backup');
}
const ready = configure();
ready.catch(console.error);
async function configured() { if (!client) throw new Error('WebDAV 未启用'); return client; }
async function backup(trigger = 'manual') {
  if (backupFlight) return backupFlight;
  backupFlight = queue.run(async () => {
    await ready;
    const data = await api.storage.local.get(null);
    if (['running', 'failed'].includes(data.restore_job?.status)) throw new Error('请先处理未完成的恢复');
    if (!data.webdavConfig?.enabled || (trigger === 'alarm' && !data.backupSettings?.autoBackup) || (trigger === 'startup' && !data.backupSettings?.backupOnStartup)) return { success: true, skipped: true };
    const c = await configured();
    const filename = await c.uploadBookmarks(serialize(await api.bookmarks.getTree(), data));
    let warning;
    if (data.backupSettings?.autoCleanup) try { await c.cleanupOldBackups(3); } catch(e) { warning = `备份成功，但清理失败：${e.message}`; }
    return { success: true, filename, warning };
  }).finally(() => { backupFlight = null; });
  return backupFlight;
}
async function dispatch(message) {
  await ready;
  if (message.action === 'cacheIcon') { await saveIcon(message.pageURL, message.iconURL); return { success: true }; }
  if (message.action === 'backup') return backup();
  return queue.run(async () => {
    switch (message.action) {
      case 'init': await configure(); return { success: true };
      case 'domain': {
        const { restore_job } = await api.storage.local.get('restore_job');
        if (['running', 'failed'].includes(restore_job?.status)) throw new Error('请先处理未完成的恢复');
        return { success: true, data: await mutate(api, message) };
      }
      case 'exportData': return { success: true, data: serialize(await api.bookmarks.getTree(), await api.storage.local.get(null)) };
      case 'previewRestore': {
        const data = message.data || await (await configured()).downloadBookmarks(message.filename);
        const normalized = normalize(data);
        let bookmarks = 0; const visit = nodes => nodes.forEach(n => { if(n.type === 'bookmark') bookmarks++; else visit(n.children); });
        normalized.sections.bookmarks?.roots.forEach(r => visit(r.children));
        const tree = await api.bookmarks.getTree();
        let deletes = 0;
        const count = nodes => nodes.reduce((sum, n) => sum + 1 + count(n.children || []), 0);
        const rootSummary = (normalized.sections.bookmarks?.roots || []).map(root => {
          const target = tree[0].children.find(n => role(n) === root.role && !n.unmodifiable);
          if (message.merge === false && target) deletes += count(target.children.filter(n => !n.unmodifiable));
          return target ? target.title : `Imported (${root.role}) ${root.title || ''}`;
        });
        const token = crypto.randomUUID();
        while (previews.size >= 4) previews.delete(previews.keys().next().value);
        previews.set(token, { backup: normalized, merge: message.merge !== false, tree: JSON.stringify(tree), time: Date.now() });
        return { success: true, token, bookmarks, deletes, rootSummary, warning: normalized.warning };
      }
      case 'importData':
      case 'restore':
      case 'restoreBackup': {
        const preview = previews.get(message.token);
        if (!preview || Date.now() - preview.time > 600000 || !message.confirmed) throw new Error('恢复需要先预览并确认；预览过期或后台重启后请重新预览');
        if (preview.merge !== (message.merge !== false)) throw new Error('恢复模式已改变，请重新预览');
        if (JSON.stringify(await api.bookmarks.getTree()) !== preview.tree) throw new Error('预览后书签发生变化，请重新预览');
        previews.delete(message.token);
        const data = preview.backup;
        const summary = await restore(api, data, message.merge !== false);
        await api.runtime.sendMessage({ action: 'refreshBookmarks' }).catch(() => {});
        return { success: true, ...summary };
      }
      case 'recoverySnapshot': { const data = await api.storage.local.get(['restore_snapshot', 'restore_job']); return { success: true, ...data }; }
      case 'recover': {
        if (!message.confirmed) throw new Error('请确认恢复快照');
        const { restore_snapshot } = await api.storage.local.get('restore_snapshot');
        if (!restore_snapshot) throw new Error('没有恢复快照');
        const summary = await restore(api, restore_snapshot, false, { recovery: true });
        await api.runtime.sendMessage({ action: 'refreshBookmarks' }).catch(() => {});
        return { success: true, ...summary };
      }
      case 'listBackups': return (await configured()).listBackups();
      case 'deleteBackup': return (await configured()).deleteBackup(message.filename);
      case 'testWebDAV': await new WebDAVClient(message.config).ensureBookmarksFolder(); return { success: true };
      case 'backupLayout': { const { layoutSettings = {} } = await api.storage.local.get('layoutSettings'); await (await configured()).request('PUT', 'layout-settings.json', { schemaVersion: 2, kind: 'bookmark-manager-backup', sections: { layoutSettings } }); return { success: true }; }
      case 'importLayout':
      case 'restoreLayout': {
        const data = normalize(message.action === 'importLayout' ? message.data : await (await configured()).downloadBookmarks('layout-settings.json'));
        if (!data.sections.layoutSettings) throw new Error('没有布局数据');
        const { restore_job, layoutSettings = {} } = await api.storage.local.get(['restore_job', 'layoutSettings']);
        if (['running', 'failed'].includes(restore_job?.status)) throw new Error('请先处理未完成的恢复');
        await api.storage.local.set({ layoutSettings: { ...layoutSettings, ...data.sections.layoutSettings } });
        return { success: true };
      }
      default: throw new Error('Unknown action');
    }
  });
}
api.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.action === 'refreshBookmarks') return false;
  if (sender.id !== api.runtime.id) return false;
  dispatch(message).then(respond, e => respond({ success: false, error: e.message }));
  return true;
});
api.runtime.onInstalled.addListener(() => configure().catch(console.error));
api.runtime.onStartup.addListener(() => backup('startup').catch(console.error));
api.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'backup') backup('alarm').catch(console.error); });
// Clear immediately on disable, even if a long backup currently owns the queue.
api.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.webdavConfig || changes.backupSettings) {
    client?.cancel();
    configure().catch(console.error);
  }
});
let cleanupTimer;
api.bookmarks.onRemoved.addListener(() => {
  clearTimeout(cleanupTimer);
  cleanupTimer = setTimeout(() => queue.run(async () => {
    const { restore_job } = await api.storage.local.get('restore_job');
    if (['running', 'failed'].includes(restore_job?.status)) return;
    await mutate(api, { domain: 'tags', method: 'cleanOrphanedTags' });
  }).catch(console.error), 150);
});
const action = api.action || api.browserAction;
action.onClicked.addListener(tab => {
  // Call sidePanel.open directly in the user gesture; no asynchronous wrapper before it.
  const native = globalThis.browser || globalThis.chrome;
  const promise = native.sidePanel ? native.sidePanel.open({ windowId: tab.windowId }) : native.sidebarAction.toggle();
  Promise.resolve(promise).catch(console.error);
});
api.tabs.onUpdated.addListener((id, changes, tab) => {
  if(changes.favIconUrl && tab.url)saveIcon(tab.url,changes.favIconUrl).catch(()=>{});
});
