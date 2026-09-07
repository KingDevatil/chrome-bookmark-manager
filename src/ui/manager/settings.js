/**
 * 设置页面脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Settings page loaded');
  ThemeManager.init();
  await I18n.init();
  await loadSettings();
  await loadLanguageSettings();
  setupEventListeners();
  await loadFrequentlyUsedSettings();
});

async function loadSettings() {
  const result = await Storage.get(['webdavConfig', 'backupSettings', 'layoutSettings']);

  const webdavConfig = result.webdavConfig || { enabled: false, url: '', username: '', password: '' };
  const backupSettings = result.backupSettings || { autoBackup: false, backupInterval: 60, backupOnStartup: false };
  const layoutSettings = result.layoutSettings || { 
    bookmarkHeight: 32, 
    treeIndent: 20
  };

  // WebDAV 设置
  document.getElementById('webdav-enabled').checked = webdavConfig.enabled;
  document.getElementById('webdav-config').classList.toggle('visible', webdavConfig.enabled);
  document.getElementById('webdav-url').value = webdavConfig.url || '';
  document.getElementById('webdav-username').value = webdavConfig.username || '';
  document.getElementById('webdav-password').value = webdavConfig.password || '';

  // 备份设置
  document.getElementById('auto-backup-enabled').checked = backupSettings.autoBackup;
  document.getElementById('auto-backup-config').classList.toggle('visible', backupSettings.autoBackup);
  document.getElementById('backup-interval').value = String(backupSettings.backupInterval || 60);
  document.getElementById('backup-on-startup').checked = backupSettings.backupOnStartup || false;

  // 布局设置
  document.getElementById('bookmark-height-slider').value = layoutSettings.bookmarkHeight || 30;
  document.getElementById('bookmark-height-value').textContent = `${layoutSettings.bookmarkHeight || 30}px`;
  document.getElementById('tree-indent-slider').value = layoutSettings.treeIndent || 5;
  document.getElementById('tree-indent-value').textContent = `${layoutSettings.treeIndent || 5}px`;
  document.getElementById('bookmark-indent-slider').value = layoutSettings.bookmarkIndent || 5;
  document.getElementById('bookmark-indent-value').textContent = `${layoutSettings.bookmarkIndent || 5}px`;
  document.getElementById('shortcut-icon-size-slider').value = layoutSettings.shortcutIconSize || 60;
  document.getElementById('shortcut-icon-size-value').textContent = `${layoutSettings.shortcutIconSize || 60}px`;
  document.getElementById('favicon-size-slider').value = layoutSettings.faviconSize || 16;
  document.getElementById('favicon-size-value').textContent = `${layoutSettings.faviconSize || 16}px`;
  document.getElementById('shortcut-icon-scale-slider').value = layoutSettings.shortcutIconScale || 70;
  document.getElementById('shortcut-icon-scale-value').textContent = `${layoutSettings.shortcutIconScale || 70}%`;

  // 更新预览
  updateLayoutPreview(
    layoutSettings.bookmarkHeight || 30,
    layoutSettings.treeIndent || 5,
    layoutSettings.bookmarkIndent || 5
  );
}

function setupEventListeners() {
  // 菜单切换
  document.querySelectorAll('.settings-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      
      // 特殊处理标签总览页面
      if (section === 'tags') {
        loadTagsOverview();
      }
      
      switchSection(section);
    });
  });
  
  // 常用目录事件监听
  setupFrequentlyUsedEventListeners();
  
  // WebDAV 开关
  document.getElementById('webdav-enabled').addEventListener('change', (e) => {
    document.getElementById('webdav-config').classList.toggle('visible', e.target.checked);
  });
  
  // 自动备份开关
  document.getElementById('auto-backup-enabled').addEventListener('change', (e) => {
    document.getElementById('auto-backup-config').classList.toggle('visible', e.target.checked);
  });

  // 自动清理开关由 saveBackupSettings 统一保存，此处不再单独监听，避免竞态条件覆盖其他备份设置
  
  // WebDAV 按钮
  document.getElementById('test-connection-btn').addEventListener('click', testWebDAVConnection);
  document.getElementById('save-webdav-btn').addEventListener('click', saveWebDAVConfig);
  
  // 备份设置按钮
  document.getElementById('save-backup-settings-btn').addEventListener('click', saveBackupSettings);
  
  // 手动操作按钮
  document.getElementById('backup-now-btn').addEventListener('click', backupNow);
  document.getElementById('restore-btn').addEventListener('click', restoreBackup);
  document.getElementById('backup-layout-btn').addEventListener('click', backupLayoutToWebDAV);
  document.getElementById('restore-layout-btn').addEventListener('click', restoreLayoutFromWebDAV);
  
  // 统一导出/导入按钮
  document.getElementById('export-all-btn').addEventListener('click', exportAllConfig);
  document.getElementById('import-all-btn').addEventListener('click', () => {
    document.getElementById('import-all-file').click();
  });
  document.getElementById('import-all-file').addEventListener('change', handleImportAllConfig);

  // 标签清理按钮
  document.getElementById('detect-tags-btn').addEventListener('click', detectOrphanedTags);
  document.getElementById('clean-tags-btn').addEventListener('click', cleanOrphanedTags);
  
  // 书签查重功能
  initDuplicateDetection();

  // 云端备份管理
  initCloudBackupManagement();

  // 标签分组管理
  document.getElementById('create-tag-group-btn').addEventListener('click', showNewGroupModal);
  document.getElementById('cancel-group-btn').addEventListener('click', hideNewGroupModal);
  document.getElementById('confirm-group-btn').addEventListener('click', createTagGroup);
  document.getElementById('new-group-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createTagGroup();
  });
  document.getElementById('new-group-modal').addEventListener('click', (e) => {
    if (e.target.id === 'new-group-modal') hideNewGroupModal();
  });
  
  // 关闭标签详情
  const closeBtn = document.getElementById('close-tag-detail');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('tag-detail-card').style.display = 'none';
    });
  }

  // 布局设置滑块
  const heightSlider = document.getElementById('bookmark-height-slider');
  const heightValue = document.getElementById('bookmark-height-value');
  const treeIndentSlider = document.getElementById('tree-indent-slider');
  const treeIndentValue = document.getElementById('tree-indent-value');
  const bookmarkIndentSlider = document.getElementById('bookmark-indent-slider');
  const bookmarkIndentValue = document.getElementById('bookmark-indent-value');

  heightSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    heightValue.textContent = `${value}px`;
    updateLayoutPreview(value, parseInt(treeIndentSlider.value), parseInt(bookmarkIndentSlider.value));
  });

  treeIndentSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    treeIndentValue.textContent = `${value}px`;
    updateLayoutPreview(parseInt(heightSlider.value), value, parseInt(bookmarkIndentSlider.value));
  });

  bookmarkIndentSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    bookmarkIndentValue.textContent = `${value}px`;
    updateLayoutPreview(parseInt(heightSlider.value), parseInt(treeIndentSlider.value), value);
  });

  const shortcutIconSizeSlider = document.getElementById('shortcut-icon-size-slider');
  const shortcutIconSizeValue = document.getElementById('shortcut-icon-size-value');

  shortcutIconSizeSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    shortcutIconSizeValue.textContent = `${value}px`;
    document.documentElement.style.setProperty('--shortcut-icon-size', `${value}px`);
  });

  const faviconSizeSlider = document.getElementById('favicon-size-slider');
  const faviconSizeValue = document.getElementById('favicon-size-value');

  faviconSizeSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    faviconSizeValue.textContent = `${value}px`;
  });

  const shortcutIconScaleSlider = document.getElementById('shortcut-icon-scale-slider');
  const shortcutIconScaleValue = document.getElementById('shortcut-icon-scale-value');

  shortcutIconScaleSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    shortcutIconScaleValue.textContent = `${value}%`;
  });

  // 布局设置按钮
  document.getElementById('save-layout-btn').addEventListener('click', saveLayoutSettings);
  document.getElementById('reset-layout-btn').addEventListener('click', resetLayoutSettings);
}

function updateLayoutPreview(height, treeIndent, bookmarkIndent) {
  const preview = document.getElementById('layout-preview');
  if (preview) {
    preview.style.setProperty('--preview-height', `${height}px`);
    preview.style.setProperty('--preview-tree-indent', `${treeIndent}px`);
    preview.style.setProperty('--preview-bookmark-indent', `${bookmarkIndent}px`);
  }
}

async function saveLayoutSettings() {
  const settings = {
    bookmarkHeight: parseInt(document.getElementById('bookmark-height-slider').value),
    treeIndent: parseInt(document.getElementById('tree-indent-slider').value),
    bookmarkIndent: parseInt(document.getElementById('bookmark-indent-slider').value),
    shortcutIconSize: parseInt(document.getElementById('shortcut-icon-size-slider').value),
    faviconSize: parseInt(document.getElementById('favicon-size-slider').value),
    shortcutIconScale: parseInt(document.getElementById('shortcut-icon-scale-slider').value)
  };

  await Storage.set({ layoutSettings: settings });
  showStatus('layout-status', I18n.t('layout.layoutSaved'), 'success');
}

async function resetLayoutSettings() {
  const defaultSettings = {
    bookmarkHeight: 30,
    treeIndent: 5,
    bookmarkIndent: 5,
    shortcutIconSize: 60,
    faviconSize: 16,
    shortcutIconScale: 70
  };

  document.getElementById('bookmark-height-slider').value = defaultSettings.bookmarkHeight;
  document.getElementById('bookmark-height-value').textContent = `${defaultSettings.bookmarkHeight}px`;
  document.getElementById('tree-indent-slider').value = defaultSettings.treeIndent;
  document.getElementById('tree-indent-value').textContent = `${defaultSettings.treeIndent}px`;
  document.getElementById('bookmark-indent-slider').value = defaultSettings.bookmarkIndent;
  document.getElementById('bookmark-indent-value').textContent = `${defaultSettings.bookmarkIndent}px`;
  document.getElementById('shortcut-icon-size-slider').value = defaultSettings.shortcutIconSize;
  document.getElementById('shortcut-icon-size-value').textContent = `${defaultSettings.shortcutIconSize}px`;
  document.getElementById('favicon-size-slider').value = defaultSettings.faviconSize;
  document.getElementById('favicon-size-value').textContent = `${defaultSettings.faviconSize}px`;
  document.getElementById('shortcut-icon-scale-slider').value = defaultSettings.shortcutIconScale;
  document.getElementById('shortcut-icon-scale-value').textContent = `${defaultSettings.shortcutIconScale}%`;

  updateLayoutPreview(defaultSettings.bookmarkHeight, defaultSettings.treeIndent, defaultSettings.bookmarkIndent);
  document.documentElement.style.setProperty('--shortcut-icon-size', `${defaultSettings.shortcutIconSize}px`);

  await Storage.set({ layoutSettings: defaultSettings });
  showStatus('layout-status', I18n.t('common.resetSuccess'), 'success');
}

function switchSection(section) {
  document.querySelectorAll('.settings-menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });

  document.getElementById('webdav-section').style.display = section === 'webdav' ? 'block' : 'none';
  document.getElementById('backup-section').style.display = section === 'backup' ? 'block' : 'none';
  document.getElementById('tags-section').style.display = section === 'tags' ? 'block' : 'none';
  document.getElementById('layout-section').style.display = section === 'layout' ? 'block' : 'none';
  document.getElementById('frequently-used-section').style.display = section === 'frequently-used' ? 'block' : 'none';
  document.getElementById('language-section').style.display = section === 'language' ? 'block' : 'none';
  document.getElementById('help-section').style.display = section === 'help' ? 'block' : 'none';
  
  // 切换后翻译新显示的内容
  setTimeout(() => I18n.translatePage(), 100);
}

async function testWebDAVConnection() {
  const config = {
    url: document.getElementById('webdav-url').value.trim(),
    username: document.getElementById('webdav-username').value.trim(),
    password: document.getElementById('webdav-password').value
  };
  
  if (!config.url) {
    showStatus('webdav-status', I18n.t('webdav.enterUrl'), 'error');
    return;
  }

  showStatus('webdav-status', I18n.t('webdav.testingConnection'), 'info');
  document.getElementById('test-connection-btn').disabled = true;

  try {
    const response = await ExtensionAPI.runtime.sendMessage({
      action: 'testWebDAV',
      config
    });

    if (response.success) {
      showStatus('webdav-status', I18n.t('webdav.connectionSuccess') + '！', 'success');
    } else {
      showStatus('webdav-status', I18n.t('webdav.connectionFailed') + ': ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('webdav-status', I18n.t('webdav.connectionFailed') + ': ' + error.message, 'error');
  } finally {
    document.getElementById('test-connection-btn').disabled = false;
  }
}

async function saveWebDAVConfig() {
  const config = {
    enabled: document.getElementById('webdav-enabled').checked,
    url: document.getElementById('webdav-url').value.trim(),
    username: document.getElementById('webdav-username').value.trim(),
    password: document.getElementById('webdav-password').value
  };
  
  if (config.enabled && !config.url) {
    showStatus('webdav-status', I18n.t('webdav.enableNeedUrl'), 'error');
    return;
  }

  try {
    if (config.enabled) {
      const url = new URL(config.url);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('请填写不含账号、查询参数或锚点的 HTTP(S) WebDAV 地址');
    }
    await Storage.set({ webdavConfig: config });
    const response = await ExtensionAPI.runtime.sendMessage({ action: 'init' });
    if (!response?.success) throw new Error(response?.error || '配置已保存，但后台未能应用，请刷新页面后重试');
    showStatus('webdav-status', I18n.t('webdav.configSaved'), 'success');
  } catch (error) { showStatus('webdav-status', error, 'error'); }
}

async function saveBackupSettings() {
  const settings = {
    autoBackup: document.getElementById('auto-backup-enabled').checked,
    backupInterval: parseInt(document.getElementById('backup-interval').value),
    backupOnStartup: document.getElementById('backup-on-startup').checked,
    autoCleanup: document.getElementById('auto-cleanup-enabled') ? document.getElementById('auto-cleanup-enabled').checked : false
  };

  try {
  if (!Number.isFinite(settings.backupInterval) || settings.backupInterval < 1) throw new Error('备份间隔必须是至少 1 分钟的整数');
  await Storage.set({ backupSettings: settings });
  const response = await ExtensionAPI.runtime.sendMessage({ action: 'init' });
  if (!response?.success) throw new Error(response?.error || '设置已保存，但后台未能应用，请刷新页面后重试');

  showStatus('backup-settings-status', I18n.t('backup.settingsSaved'), 'success');
  } catch (error) { showStatus('backup-settings-status', error, 'error'); }
}

async function backupNow() {
  const result = await Storage.get('webdavConfig');
  if (!result.webdavConfig || !result.webdavConfig.enabled) {
    showStatus('backup-now-status', I18n.t('webdav.enableFirst'), 'error');
    return;
  }

  showStatus('backup-now-status', I18n.t('backup.backingUp'), 'info');
  document.getElementById('backup-now-btn').disabled = true;

  try {
    const response = await ExtensionAPI.runtime.sendMessage({ action: 'backup' });

    if (response.success) {
      showStatus('backup-now-status', response.skipped ? '未执行备份，请检查 WebDAV 和备份设置' : response.warning || I18n.t('backup.backupSuccess') + ': ' + response.filename, response.warning ? 'error' : response.skipped ? 'info' : 'success');
    } else {
      showStatus('backup-now-status', I18n.t('backup.backupFailed') + ': ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('backup-now-status', I18n.t('backup.backupFailed') + ': ' + error.message, 'error');
  } finally {
    document.getElementById('backup-now-btn').disabled = false;
  }
}

async function restoreBackup() {
  const result = await Storage.get('webdavConfig');
  if (!result.webdavConfig || !result.webdavConfig.enabled) {
    showStatus('restore-status', '请先启用并配置 WebDAV', 'error');
    return;
  }
  
  const merge = document.querySelector('input[name="restore-mode"]:checked').value === 'merge';
  const modeText = merge ? I18n.t('backup.merge') : I18n.t('backup.overwrite');

  
  showStatus('restore-status', I18n.t('backup.restoring'), 'info');
  document.getElementById('restore-btn').disabled = true;
  
  try {
    const response = await previewAndRestore({
      filename: 'bookmarks.json',
      merge
    });
    
    if (response.success) {
      showStatus('restore-status', I18n.t('backup.restoreSuccess') + ' ' + I18n.t('common.refreshPage'), 'success');
    } else {
      showStatus('restore-status', I18n.t('backup.restoreFailed') + ': ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('restore-status', I18n.t('backup.restoreFailed') + ': ' + error.message, 'error');
  } finally {
    document.getElementById('restore-btn').disabled = false;
  }
}

// 备份布局到 WebDAV
async function backupLayoutToWebDAV() {
  try { const r=await ExtensionAPI.runtime.sendMessage({action:'backupLayout'}); if(!r.success) throw new Error(r.error); showStatus('backup-layout-status','备份完成','success'); }
  catch(e) { showStatus('backup-layout-status',e.message,'error'); }
}

// 从 WebDAV 恢复布局
async function restoreLayoutFromWebDAV() {
  if (!await showConfirm(I18n.t('backup.restoreLayoutConfirm'))) return;
  try { const r=await ExtensionAPI.runtime.sendMessage({action:'restoreLayout'}); if(!r.success) throw new Error(r.error); await loadSettings(); showStatus('restore-layout-status','恢复完成','success'); }
  catch(e) { showStatus('restore-layout-status',e.message,'error'); }
}

function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (!element) return;
  message = globalThis.operationErrorMessage(message);
  if (message.includes('已取消恢复')) { message = '已取消恢复，未修改数据'; type = 'info'; }
  clearTimeout(element.statusTimer);
  element.setAttribute('role', type === 'error' ? 'alert' : 'status');
  element.textContent = message;
  element.className = `status-message ${type} visible`;

  if (type === 'success') element.statusTimer = setTimeout(() => {
    element.classList.remove('visible');
  }, 5000);
}

// ============================================
// 标签备份功能
// ============================================

async function exportTags() {
  try {
    const response = await ExtensionAPI.runtime.sendMessage({action:'exportData'});
    if (!response.success) throw new Error(response.error);
    delete response.data.sections.shortcuts; delete response.data.sections.layoutSettings;
    Utils.downloadJSON(response.data, 'bookmark-tags-with-tree.json');
  } catch(e) { await showAlert(e.message); }
}

// 统一导出配置
async function exportAllConfig() {
  try {
    const response = await ExtensionAPI.runtime.sendMessage({ action: 'exportData' });
    if (!response.success) throw new Error(response.error);
    const data = response.data;
    const includeTags = document.getElementById('export-tags').checked;
    const includeBookmarks = document.getElementById('export-bookmarks').checked;
    if (!includeTags && !includeBookmarks) delete data.sections.bookmarks;
    else if (!includeTags) { const strip = nodes => nodes.forEach(n => { delete n.tags; if(n.children) strip(n.children); }); data.sections.bookmarks.roots.forEach(r => strip(r.children)); }
    if (!includeTags) delete data.sections.tagGroups;
    if (!document.getElementById('export-layout').checked) delete data.sections.layoutSettings;
    Utils.downloadJSON(data, 'bookmark-config-' + new Date().toISOString().slice(0,10) + '.json');
    showStatus('export-all-status', I18n.t('config.exportSuccess'), 'success');
  } catch(e) { showStatus('export-all-status', e.message, 'error'); }
}

// 统一导入配置
async function handleImportAllConfig(event) {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024) throw new Error('文件不能超过 20 MB');
    await previewAndRestore({ data: JSON.parse(await file.text()), merge: true });
    showStatus('import-all-status', I18n.t('config.importSuccess'), 'success');
  } catch(e) { showStatus('import-all-status', e, 'error'); }
  finally { event.target.value = ''; }
}

// 递归合并书签 - 参考background.js的逻辑
async function previewAndRestore(options) {
  const preview = await ExtensionAPI.runtime.sendMessage({ action: 'previewRestore', ...options });
  if (!preview?.success) throw new Error(preview?.error || '后台未返回预览结果，请刷新页面后重新预览');
  if (!preview.token || !Array.isArray(preview.diff?.entries)) throw new Error('预览数据不完整，请重新加载扩展和设置页面后重试');
  const mode = options.merge === false ? '覆盖所选根目录的内容' : '合并（保留本地内容）';
  if (!await showRestoreDiff(preview, mode, options.merge !== false)) throw new Error('已取消恢复');
  const response = await ExtensionAPI.runtime.sendMessage({ action: 'importData', token: preview.token, merge: options.merge !== false, confirmed: true });
  if (!response?.success) throw new Error(response?.error || '未收到恢复结果，请先刷新页面查看恢复快照状态，避免重复操作');
  return response;
}

let closeRestoreDiff;
function showRestoreDiff(preview, mode, merge) {
  closeRestoreDiff?.();
  if (typeof document.createElement('dialog').showModal !== 'function') return Promise.reject(new Error('当前浏览器不支持恢复预览窗口，请升级浏览器后重试；尚未修改数据'));
  return new Promise(resolve => {
    const previousFocus = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'restore-diff';
    dialog.setAttribute('aria-label', '恢复差异预览');
    const element = (tag, text, parent = dialog) => {
      const node = document.createElement(tag); node.textContent = text; parent.appendChild(node); return node;
    };
    element('h2', '恢复差异预览');
    element('p', mode + '。确认后才会保存快照并开始恢复。');
    element('p', merge ? '按同目录、标题、网址及重复出现次序匹配。本地独有内容保留；改名或移动会表现为新增，不自动猜测对应关系。' : '下方展示内容差异。覆盖时所选目录的可写节点会先删除再重建，内容相同项也会产生新 ID；未包含的根目录不受影响。');
    if (preview.warning) element('p', preview.warning);
    const labels = { added: '新增', deleted: '删除', changed: '变更', matched: '匹配内容', retained: '本地保留', skipped: '受管跳过' };
    const diff = preview.diff || { entries: [], counts: {} };
    element('p', Object.entries(labels).map(([key, label]) => `${label} ${diff.counts[key] || 0}`).join(' · '));
    const controls = element('div', ''); controls.className = 'restore-diff-controls';
    const filter = element('select', '', controls); filter.setAttribute('aria-label', '差异类型');
    for (const [value, label] of [['differences', '仅看差异'], ['all', '全部'], ...Object.entries(labels)]) {
      const option = element('option', label, filter); option.value = value;
    }
    const search = element('input', '', controls); search.placeholder = '搜索目录、标题、网址或标签'; search.setAttribute('aria-label', search.placeholder);
    const list = element('div', ''); list.className = 'restore-diff-list';
    const pager = element('div', ''); pager.className = 'restore-diff-controls';
    const prev = element('button', '上一页', pager); const count = element('span', '', pager); const next = element('button', '下一页', pager);
    const rows = diff.entries.map(entry => ({ entry, text: JSON.stringify(entry).toLowerCase() }));
    let page = 0;
    const render = () => {
      const query = search.value.toLowerCase();
      const selected = rows.filter(({ entry, text }) => (filter.value === 'all' || (filter.value === 'differences' ? ['added', 'deleted', 'changed'].includes(entry.status) : entry.status === filter.value)) && text.includes(query));
      const pages = Math.max(1, Math.ceil(selected.length / 50)); page = Math.min(page, pages - 1);
      list.replaceChildren();
      if (!selected.length) element('p', '没有符合条件的差异。', list);
      for (const { entry } of selected.slice(page * 50, (page + 1) * 50)) {
        const row = element('details', '', list);
        element('summary', `${labels[entry.status]} · ${entry.kind} · ${entry.path}`, row);
        element('p', '当前本地', row); element('pre', entry.before === null ? '无' : JSON.stringify(entry.before, null, 2), row);
        element('p', '恢复后', row); element('pre', entry.after === null ? '无' : JSON.stringify(entry.after, null, 2), row);
      }
      count.textContent = `${selected.length} 项 · 第 ${page + 1}/${pages} 页`; prev.disabled = page === 0; next.disabled = page + 1 >= pages;
    };
    filter.onchange = search.oninput = () => { page = 0; render(); };
    prev.onclick = () => { page--; render(); }; next.onclick = () => { page++; render(); };
    const actions = element('div', ''); actions.className = 'restore-diff-controls';
    const cancel = element('button', '取消', actions); const confirm = element('button', merge ? '确认合并恢复' : '确认覆盖恢复', actions);
    let settled = false;
    const finish = value => {
      if (settled) return; settled = true; closeRestoreDiff = null; dialog.remove(); previousFocus?.focus(); resolve(value);
    };
    closeRestoreDiff = () => finish(false);
    cancel.onclick = () => finish(false); confirm.onclick = () => finish(true);
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    dialog.addEventListener('close', () => finish(false));
    document.body.appendChild(dialog); render(); dialog.showModal(); cancel.focus();
  });
}

// 导出布局
async function exportLayout() {
  try {
    const result = await Storage.get('layoutSettings');
    const layoutSettings = result.layoutSettings || {};
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      type: 'layout-settings',
      layoutSettings: layoutSettings
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('export-layout-status', I18n.t('layout.exportSuccess'), 'success');
  } catch (error) {
    showStatus('export-layout-status', I18n.t('layout.exportFailed') + '：' + error.message, 'error');
  }
}

// 导入布局
async function handleImportLayout(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    if (file.size > 20 * 1024 * 1024) throw new Error('文件过大');
    const text = await file.text();
    const data = JSON.parse(text);

    document.getElementById('import-layout-filename').textContent = file.name;

    const response = await ExtensionAPI.runtime.sendMessage({ action: 'importLayout', data });
    if (!response?.success) throw new Error(response?.error || I18n.t('backup.invalidLayoutFile'));
    await loadSettings();
    showStatus('import-layout-status', I18n.t('layout.importSuccess'), 'success');
  } catch (error) {
    showStatus('import-layout-status', I18n.t('layout.importFailed') + '：' + error.message, 'error');
  }

  event.target.value = '';
}

async function handleImportTagsFile(event) {
  const file = event.target.files[0]; if (!file) return;
  try { if(file.size > 20*1024*1024) throw new Error('文件过大'); await previewAndRestore({data:JSON.parse(await file.text()),merge:true}); showStatus('import-tags-status','导入完成','success'); }
  catch(e) { showStatus('import-tags-status',e,'error'); }
  finally { event.target.value=''; }
}

// ============================================
// 标签清理功能
// ============================================

async function detectOrphanedTags() {
  try {
    const detectBtn = document.getElementById('detect-tags-btn');
    detectBtn.disabled = true;
    detectBtn.textContent = I18n.t('common.detecting');
    
    showStatus('detect-tags-status', I18n.t('cleanup.detectingOrphan'), 'info');
    
    const orphaned = await BookmarkTags.detectOrphanedTags();
    const count = Object.keys(orphaned).length;
    
    if (count === 0) {
      showStatus('detect-tags-status', I18n.t('cleanup.noOrphanFound'), 'success');
    } else {
      showStatus('detect-tags-status', I18n.t('cleanup.orphanFound', { count: count }), 'info');
    }
    
    detectBtn.disabled = false;
    detectBtn.textContent = I18n.t('cleanup.startDetection');
  } catch (error) {
    showStatus('detect-tags-status', I18n.t('cleanup.detectFailed') + '：' + error.message, 'error');
  }
}

async function cleanOrphanedTags() {
  try {
    const cleanBtn = document.getElementById('clean-tags-btn');
    
    // 先检测是否有孤立标签
    const orphaned = await BookmarkTags.detectOrphanedTags();
    const count = Object.keys(orphaned).length;
    
    if (count === 0) {
      showStatus('clean-tags-status', I18n.t('cleanup.noOrphanToClean'), 'info');
      return;
    }
    
    // 显示确认对话框
    const confirmed = await showConfirm(I18n.t('cleanup.confirmClean', { count: count }), { danger: true });
    if (!confirmed) {
      return;
    }
    
    cleanBtn.disabled = true;
    cleanBtn.textContent = I18n.t('common.cleaning');
    showStatus('clean-tags-status', I18n.t('cleanup.cleaningOrphan'), 'info');
    
    // 执行清理
    const result = await BookmarkTags.cleanOrphanedTags();
    
    showStatus('clean-tags-status', I18n.t('cleanup.cleanSuccess', { count: result.cleaned }), 'success');
    
    cleanBtn.disabled = false;
    cleanBtn.textContent = I18n.t('cleanup.cleanInvalid');
  } catch (error) {
    showStatus('clean-tags-status', I18n.t('cleanup.cleanFailed') + '：' + error.message, 'error');
  }
}

// ============================================
// 书签查重功能
// ============================================

let duplicatesData = [];

async function detectDuplicateBookmarks() {
  try {
    const detectBtn = document.getElementById('detect-duplicates-btn');
    
    detectBtn.disabled = true;
    detectBtn.textContent = '检测中...';
    showStatus('detect-duplicates-status', '正在扫描书签...', 'info');
    
    // 获取所有书签
    const tree = await ExtensionAPI.bookmarks.getTree();
    const allBookmarks = [];
    
    function flattenBookmarks(nodes) {
      for (const node of nodes) {
        if (node.url) {
          allBookmarks.push({
            id: node.id,
            title: node.title,
            url: node.url,
            parentId: node.parentId
          });
        }
        if (node.children) {
          flattenBookmarks(node.children);
        }
      }
    }
    flattenBookmarks(tree);
    
    // 按URL分组查找重复
    const urlMap = new Map();
    for (const bookmark of allBookmarks) {
      const url = bookmark.url;
      if (!urlMap.has(url)) {
        urlMap.set(url, []);
      }
      urlMap.get(url).push(bookmark);
    }
    
    // 找出有重复的URL
    duplicatesData = [];
    for (const [url, bookmarks] of urlMap) {
      if (bookmarks.length > 1) {
        duplicatesData.push({
          url: url,
          bookmarks: bookmarks
        });
      }
    }
    
    const resultDiv = document.getElementById('duplicates-result');
    const listDiv = document.getElementById('duplicates-list');
    
    if (duplicatesData.length === 0) {
      showStatus('detect-duplicates-status', '没有发现重复书签', 'success');
      resultDiv.style.display = 'none';
    } else {
      showStatus('detect-duplicates-status', `检测到 ${duplicatesData.length} 组重复书签（共 ${duplicatesData.reduce((sum, d) => sum + d.bookmarks.length, 0)} 个）`, 'success');
      
      // 渲染结果
      listDiv.innerHTML = '';
      for (const group of duplicatesData) {
        const groupDiv = document.createElement('div');
        groupDiv.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--border-color, #e2e8f0);';
        
        const urlDiv = document.createElement('div');
        urlDiv.style.cssText = 'font-size: 13px; color: var(--text-secondary, #64748b); word-break: break-all; margin-bottom: 8px;';
        urlDiv.textContent = group.url;
        groupDiv.appendChild(urlDiv);
        
        for (const bookmark of group.bookmarks) {
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 6px 0;';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.dataset.bookmarkId = bookmark.id;
          checkbox.style.cssText = 'width: auto;';
          
          const titleSpan = document.createElement('span');
          titleSpan.style.cssText = 'flex: 1; font-size: 14px;';
          titleSpan.textContent = bookmark.title || bookmark.url;
          
          itemDiv.appendChild(checkbox);
          itemDiv.appendChild(titleSpan);
          groupDiv.appendChild(itemDiv);
        }
        
        listDiv.appendChild(groupDiv);
      }
      
      resultDiv.style.display = 'block';
    }
    
    detectBtn.disabled = false;
    detectBtn.textContent = '开始检测';
  } catch (error) {
    showStatus('detect-duplicates-status', `检测失败：${error.message}`, 'error');
    const detectBtn = document.getElementById('detect-duplicates-btn');
    detectBtn.disabled = false;
    detectBtn.textContent = '开始检测';
  }
}

async function deleteSelectedDuplicates() {
  try {
    const checkboxes = document.querySelectorAll('#duplicates-list input[type="checkbox"]:checked');
    const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.bookmarkId);
    
    if (idsToDelete.length === 0) {
      await showAlert(I18n.t('duplicate.selectFirst'));
      return;
    }

    const confirmed = await showConfirm(I18n.t('confirm.deleteBookmarks', { count: idsToDelete.length }), { danger: true });
    if (!confirmed) {
      return;
    }
    
    const deleteBtn = document.getElementById('delete-duplicates-btn');
    deleteBtn.disabled = true;
    deleteBtn.textContent = I18n.t('common.deleting');
    
    // 删除选中的书签
    for (const id of idsToDelete) {
      await ExtensionAPI.bookmarks.remove(id);
    }
    
    // 重新检测
    await detectDuplicateBookmarks();
    
    deleteBtn.disabled = false;
    deleteBtn.textContent = I18n.t('duplicate.deleteSelected');
  } catch (error) {
    await showAlert(I18n.t('common.delete') + I18n.t('common.error') + '：' + error.message);
    const deleteBtn = document.getElementById('delete-duplicates-btn');
    deleteBtn.disabled = false;
    deleteBtn.textContent = I18n.t('duplicate.deleteSelected');
  }
}

// 全选功能
function setupDuplicateCheckboxes() {
  const selectAll = document.getElementById('select-all-duplicates');
  const listDiv = document.getElementById('duplicates-list');
  
  selectAll.addEventListener('change', (e) => {
    const checkboxes = listDiv.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
}

// 云端备份管理功能
// ============================================

async function loadBackupSettings() {
  const result = await Storage.get('backupSettings');
  const settings = result.backupSettings || {};
  document.getElementById('auto-cleanup-enabled').checked = settings.autoCleanup || false;
}

async function refreshBackupList() {
  const container = document.getElementById('backup-files-container');
  const loading = document.getElementById('backups-loading');

  container.innerHTML = '';
  container.style.visibility = 'hidden';
  loading.style.visibility = 'visible';

  try {
    const response = await ExtensionAPI.runtime.sendMessage({ action: 'listBackups' });

    loading.style.visibility = 'hidden';
    container.style.visibility = 'visible';

    if (!response || response.success === false) {
      container.innerHTML = '<div class="backup-empty">' + I18n.t('backup.loadFailed') + ': ' + escapeHtml(response?.error || 'Unknown error') + '</div>';
      return;
    }

    if (!Array.isArray(response) || response.length === 0) {
      container.innerHTML = '<div class="backup-empty">' + I18n.t('backup.noBackups') + '</div>';
      return;
    }

    response.forEach(backup => {
      const item = document.createElement('div');
      item.className = 'backup-file-item';

      const date = new Date(backup.lastModified);
      const dateStr = date.toLocaleString();
      const sizeStr = formatFileSize(backup.size);

      item.innerHTML = `
        <div class="backup-file-info">
          <div class="backup-file-name">${escapeHtml(backup.filename)}</div>
          <div class="backup-file-meta">${Utils.escapeHtml(String(dateStr))} · ${Utils.escapeHtml(String(sizeStr))}</div>
        </div>
        <div class="backup-file-actions">
          <button class="btn btn-sm restore-backup-btn" data-filename="${escapeHtml(backup.filename)}">${Utils.escapeHtml(String(I18n.t('backup.restore')))}</button>
          <button class="btn btn-sm btn-danger delete-backup-btn" data-filename="${escapeHtml(backup.filename)}">${Utils.escapeHtml(String(I18n.t('backup.delete')))}</button>
        </div>
      `;

      container.appendChild(item);
    });

    document.querySelectorAll('.restore-backup-btn').forEach(btn => {
      btn.addEventListener('click', () => restoreFromBackup(btn.dataset.filename));
    });

    document.querySelectorAll('.delete-backup-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBackup(btn.dataset.filename));
    });

  } catch (error) {
    loading.style.display = 'none';
    container.innerHTML = '<div class="backup-empty">' + I18n.t('backup.loadFailed') + ': ' + escapeHtml(error.message) + '</div>';
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) { return Utils.escapeHtml(String(text)); }

async function restoreFromBackup(filename) {

  const result = await Storage.get('webdavConfig');
  if (!result.webdavConfig || !result.webdavConfig.enabled) {
    showStatus('restore-backup-status', I18n.t('webdav.enableFirst'), 'error');
    return;
  }

  try {
    const response = await previewAndRestore({
      filename: filename,
      merge: false
    });

    if (response.success) {
      showStatus('restore-backup-status', I18n.t('backup.restoreSuccess'), 'success');
    } else {
      showStatus('restore-backup-status', I18n.t('backup.restoreFailed') + ': ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('restore-backup-status', I18n.t('backup.restoreFailed') + ': ' + error.message, 'error');
  }
}

async function deleteBackup(filename) {
  const confirmed = await showConfirm(I18n.t('backup.confirmDelete', { filename: filename }));
  if (!confirmed) return;

  try {
    const response = await ExtensionAPI.runtime.sendMessage({
      action: 'deleteBackup',
      filename: filename
    });

    if (response.success) {
      showStatus('backup-files-status', I18n.t('backup.deleteSuccess'), 'success');
      refreshBackupList();
    } else {
      showStatus('backup-files-status', I18n.t('backup.deleteFailed') + ': ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('backup-files-status', I18n.t('backup.deleteFailed') + ': ' + error.message, 'error');
  }
}

function initCloudBackupManagement() {
  loadBackupSettings();
  refreshBackupList();

  document.getElementById('refresh-backups-btn').addEventListener('click', refreshBackupList);
}

// 初始化书签查重功能
function initDuplicateDetection() {
  document.getElementById('detect-duplicates-btn').addEventListener('click', detectDuplicateBookmarks);
  document.getElementById('delete-duplicates-btn').addEventListener('click', deleteSelectedDuplicates);
  setupDuplicateCheckboxes();
}

// ============================================
// 常用目录设置
// ============================================

async function loadLanguageSettings() {
  const result = await Storage.get(['language']);
  const currentLang = result.language || 'zh-CN';
  document.getElementById('language-select').value = currentLang;
  
  document.getElementById('save-language-btn').addEventListener('click', async () => {
    const selectedLang = document.getElementById('language-select').value;
    await I18n.setLanguage(selectedLang);
  });
}

async function loadFrequentlyUsedSettings() {
  try {
    const config = await FrequentlyUsedConfig.getConfig();
    
    document.getElementById('frequently-used-enabled').checked = config.enabled;
    document.getElementById('frequently-used-config').classList.toggle('visible', config.enabled);
    
    const daysRangeRadios = document.querySelectorAll('input[name="days-range"]');
    daysRangeRadios.forEach(radio => {
      radio.checked = parseInt(radio.value) === config.daysRange;
    });
    
    document.getElementById('display-count-slider').value = config.displayCount;
    document.getElementById('display-count-value').textContent = `${config.displayCount}个`;
    
    await renderBlacklist();
    await renderPinnedList();
  } catch (error) {
    console.error('加载常用目录设置失败:', error);
  }
}

async function renderBlacklist() {
  const config = await FrequentlyUsedConfig.getConfig();
  const container = document.getElementById('blacklist-container');
  const emptyMsg = document.getElementById('blacklist-empty');
  
  if (!config.blacklist || config.blacklist.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyMsg);
    emptyMsg.style.display = 'block';
    return;
  }
  
  container.innerHTML = '';
  
  const blacklistList = document.createElement('div');
  blacklistList.style.display = 'flex';
  blacklistList.style.flexDirection = 'column';
  blacklistList.style.gap = '8px';
  
  config.blacklist.forEach(domain => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.padding = '8px 12px';
    item.style.backgroundColor = 'var(--bg-secondary, #f8fafc)';
    item.style.borderRadius = '6px';
    item.style.border = '1px solid var(--border-color, #e2e8f0)';
    
    const domainSpan = document.createElement('span');
    domainSpan.textContent = domain;
    domainSpan.style.fontWeight = '500';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = I18n.t('common.remove');
    removeBtn.className = 'btn';
    removeBtn.style.padding = '4px 12px';
    removeBtn.style.fontSize = '12px';
    removeBtn.addEventListener('click', async () => {
      await FrequentlyUsedConfig.removeFromBlacklist(domain);
      await renderBlacklist();
    });
    
    item.appendChild(domainSpan);
    item.appendChild(removeBtn);
    blacklistList.appendChild(item);
  });
  
  container.appendChild(blacklistList);
}

async function renderPinnedList() {
  const config = await FrequentlyUsedConfig.getConfig();
  const container = document.getElementById('pinned-list-container');
  const emptyMsg = document.getElementById('pinned-empty');
  
  if (!config.pinned || config.pinned.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyMsg);
    emptyMsg.style.display = 'block';
    return;
  }
  
  container.innerHTML = '';
  
  const pinnedList = document.createElement('div');
  pinnedList.style.display = 'flex';
  pinnedList.style.flexDirection = 'column';
  pinnedList.style.gap = '8px';
  
  for (const pinnedItem of config.pinned) {
    const url = typeof pinnedItem === 'string' ? pinnedItem : pinnedItem.url;
    const title = typeof pinnedItem === 'string' ? pinnedItem : (pinnedItem.title || url);
    
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.padding = '8px 12px';
    item.style.backgroundColor = 'var(--bg-secondary, #f8fafc)';
    item.style.borderRadius = '6px';
    item.style.border = '1px solid var(--border-color, #e2e8f0)';
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.style.fontSize = '13px';
    titleSpan.style.fontWeight = '500';
    titleSpan.style.color = 'var(--text-primary, #1e293b)';
    titleSpan.style.wordBreak = 'break-all';
    
    const urlSpan = document.createElement('span');
    urlSpan.textContent = url;
    urlSpan.style.fontSize = '11px';
    urlSpan.style.color = 'var(--text-tertiary, #94a3b8)';
    urlSpan.style.wordBreak = 'break-all';
    urlSpan.style.marginTop = '4px';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = I18n.t('common.unpin');
    removeBtn.className = 'btn';
    removeBtn.style.padding = '4px 12px';
    removeBtn.style.fontSize = '12px';
    removeBtn.style.marginTop = '8px';
    removeBtn.style.alignSelf = 'flex-start';
    removeBtn.addEventListener('click', async () => {
      await FrequentlyUsedConfig.unpinUrl(url);
      await renderPinnedList();
    });
    
    item.appendChild(titleSpan);
    item.appendChild(urlSpan);
    item.appendChild(removeBtn);
    pinnedList.appendChild(item);
  }
  
  container.appendChild(pinnedList);
}

function setupFrequentlyUsedEventListeners() {
  document.getElementById('frequently-used-enabled').addEventListener('change', (e) => {
    document.getElementById('frequently-used-config').classList.toggle('visible', e.target.checked);
  });
  
  const displayCountSlider = document.getElementById('display-count-slider');
  const displayCountValue = document.getElementById('display-count-value');
  
  displayCountSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    displayCountValue.textContent = `${value}个`;
  });
  
  document.getElementById('save-frequently-used-btn').addEventListener('click', async () => {
    try {
      const enabled = document.getElementById('frequently-used-enabled').checked;
      const daysRangeRadio = document.querySelector('input[name="days-range"]:checked');
      const daysRange = parseInt(daysRangeRadio.value);
      const displayCount = parseInt(document.getElementById('display-count-slider').value);
      
      const config = {
        enabled,
        daysRange,
        displayCount,
        blacklist: (await FrequentlyUsedConfig.getConfig()).blacklist || []
      };
      
      await FrequentlyUsedConfig.saveConfig(config);
      showStatus('frequently-used-status', I18n.t('common.saveSuccess'), 'success');
    } catch (error) {
      console.error(I18n.t('freq.saveFailed'), error);
      showStatus('frequently-used-status', I18n.t('common.saveFailed'), 'error');
    }
  });

  document.getElementById('reset-frequently-used-btn').addEventListener('click', async () => {
    try {
      await FrequentlyUsedConfig.resetConfig();
      await loadFrequentlyUsedSettings();
      showStatus('frequently-used-status', I18n.t('common.resetSuccess'), 'success');
    } catch (error) {
      console.error(I18n.t('freq.resetFailed'), error);
      showStatus('frequently-used-status', I18n.t('common.resetFailed'), 'error');
    }
  });

  document.getElementById('clear-all-pinned-btn').addEventListener('click', async () => {
    const confirmed = await showConfirm(I18n.t('common.confirmClearPinned'), { danger: true });
    if (!confirmed) {
      return;
    }
    try {
      const config = await FrequentlyUsedConfig.getConfig();
      config.pinned = [];
      await FrequentlyUsedConfig.saveConfig(config);
      await renderPinnedList();
      const statusEl = document.getElementById('frequently-used-status');
      if (statusEl) {
        statusEl.textContent = I18n.t('common.clearSuccess');
        statusEl.className = 'status-message success visible';
        setTimeout(() => statusEl.classList.remove('visible'), 3000);
      }
    } catch (error) {
      console.error(I18n.t('pinned.clearFailed'), error);
      const statusEl = document.getElementById('frequently-used-status');
      if (statusEl) {
        statusEl.textContent = I18n.t('common.clearFailed') + ': ' + error.message;
        statusEl.className = 'status-message error visible';
        setTimeout(() => statusEl.classList.remove('visible'), 3000);
      }
    }
  });

  document.getElementById('add-blacklist-btn').addEventListener('click', async () => {
    try {
      const domainInput = document.getElementById('blacklist-domain-input');
      const domain = domainInput.value.trim();

      if (!domain) {
        showStatus('frequently-used-status', I18n.t('common.enterDomain'), 'error');
        return;
      }

      await FrequentlyUsedConfig.addToBlacklist(domain);
      domainInput.value = '';
      await renderBlacklist();
      showStatus('frequently-used-status', I18n.t('blacklist.addSuccess'), 'success');
    } catch (error) {
      console.error(I18n.t('blacklist.addFailed'), error);
      showStatus('frequently-used-status', I18n.t('common.addFailed'), 'error');
    }
  });
  
  // 选择标签弹窗事件
  document.getElementById('cancel-select-tags-btn').addEventListener('click', hideSelectTagsModal);
  document.getElementById('confirm-select-tags-btn').addEventListener('click', confirmAddTagsToGroup);
}

// ============================================
// 标签分组管理功能
// ============================================

async function loadTagsOverview() {
  try {
    const groupsLoading = document.getElementById('tag-groups-loading');
    const groupsList = document.getElementById('tag-groups-list');
    const ungroupedList = document.getElementById('ungrouped-tags-list');
    
    groupsLoading.style.display = 'block';
    groupsList.innerHTML = '';
    ungroupedList.innerHTML = '';
    
    // 获取所有标签
    const allTags = await BookmarkTags.getAllTags();
    
    // 获取分组数据
    const groupsData = await TagGroups.getAll();
    
    groupsLoading.style.display = 'none';
    
    // 渲染分组
    if (groupsData.groups && groupsData.groups.length > 0) {
      groupsData.groups.forEach(group => {
        const groupCard = createTagGroupCard(group);
        groupsList.appendChild(groupCard);
      });
    } else {
      groupsList.innerHTML = '<div class="empty-state">' + I18n.t('tagGroup.noGroups') + '</div>';
    }
    
    // 获取未分组的标签
    const ungroupedTags = await TagGroups.getUngroupedTags(allTags);
    
    if (ungroupedTags.length > 0) {
      ungroupedTags.forEach(tagName => {
        const tagEl = document.createElement('span');
        tagEl.className = 'ungrouped-tag';
        tagEl.textContent = tagName;
        tagEl.addEventListener('click', () => showTagDetail(tagName));
        ungroupedList.appendChild(tagEl);
      });
    } else {
      ungroupedList.innerHTML = '<div class="empty-state">' + I18n.t('tagGroup.allGrouped') + '</div>';
    }
  } catch (error) {
    console.error(I18n.t('tagGroup.loadFailed'), error);
  }
}

function createTagGroupCard(group) {
  const card = document.createElement('div');
  card.className = 'tag-group-card';
  card.dataset.groupId = group.id;
  
  // 头部
  const header = document.createElement('div');
  header.className = 'tag-group-header';
  header.innerHTML = `
    <div class="tag-group-title">
      <span>📁</span>
      <span>${Utils.escapeHtml(String(group.name))}</span>
      <span class="tag-group-count">${Utils.escapeHtml(String(group.tags.length))} ${Utils.escapeHtml(String(I18n.t('tagGroup.tags')))}</span>
    </div>
    <div class="tag-group-actions">
      <button class="btn btn-sm edit-group-btn">${Utils.escapeHtml(String(I18n.t('common.edit')))}</button>
      <button class="btn btn-sm delete-group-btn" style="color: #dc2626;">${Utils.escapeHtml(String(I18n.t('common.delete')))}</button>
    </div>
  `;
  
  // 内容区
  const content = document.createElement('div');
  content.className = 'tag-group-content';
  
  group.tags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag-group-tag';
    tagEl.innerHTML = `${Utils.escapeHtml(String(tag))}<span class="remove-tag">×</span>`;
    tagEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-tag')) {
        removeTagFromGroup(group.id, tag);
      } else {
        showTagDetail(tag);
      }
    });
    content.appendChild(tagEl);
  });
  
  // 添加标签按钮
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-sm';
  addBtn.textContent = '+ ' + I18n.t('common.addTags');
  addBtn.style.marginTop = '8px';
  addBtn.addEventListener('click', () => {
    showSelectTagsModal(group.id);
  });
  
  content.appendChild(addBtn);
  
  // 事件绑定
  header.querySelector('.edit-group-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    renameGroup(group.id, group.name);
  });
  
  header.querySelector('.delete-group-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteGroup(group.id, group.name);
  });
  
  card.appendChild(header);
  card.appendChild(content);
  
  return card;
}

function showNewGroupModal() {
  document.getElementById('new-group-modal').classList.add('visible');
  document.getElementById('new-group-name-input').value = '';
  document.getElementById('new-group-name-input').focus();
}

function hideNewGroupModal() {
  document.getElementById('new-group-modal').classList.remove('visible');
}

async function createTagGroup() {
  const name = document.getElementById('new-group-name-input').value.trim();
  if (!name) {
    await showAlert(I18n.t('tagGroup.enterName'));
    return;
  }

  try {
    await TagGroups.createGroup(name);
    hideNewGroupModal();
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.createGroupFailed'), error);
    await showAlert(I18n.t('tags.createGroupFailed'));
  }
}

async function deleteGroup(groupId, groupName) {
  const confirmed = await showConfirm(I18n.t('tagGroup.confirmDelete', { name: groupName }), { danger: true });
  if (!confirmed) {
    return;
  }

  try {
    await TagGroups.deleteGroup(groupId);
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.deleteGroupFailed'), error);
    await showAlert(I18n.t('tags.deleteGroupFailed'));
  }
}

async function renameGroup(groupId, currentName) {
  const newName = await showPrompt(I18n.t('tagGroup.enterNewName'), currentName);
  if (!newName || !newName.trim() || newName.trim() === currentName) return;

  try {
    await TagGroups.renameGroup(groupId, newName.trim());
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.renameGroupFailed'), error);
    await showAlert(I18n.t('tags.renameGroupFailed'));
  }
}

async function addTagToGroup(groupId, tagName) {
  try {
    await TagGroups.addTagToGroup(groupId, tagName);
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.addTagToGroupFailed'), error);
    await showAlert(I18n.t('tags.addFailed'));
  }
}

async function removeTagFromGroup(groupId, tagName) {
  try {
    await TagGroups.removeTagFromGroup(groupId, tagName);
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.removeTagFromGroupFailed'), error);
    await showAlert(I18n.t('common.removeFailed'));
  }
}

// 当前正在编辑的分组ID
let currentEditingGroupId = null;
// 已选择的标签集合
let selectedTagsForGroup = new Set();

async function showSelectTagsModal(groupId) {
  const modal = document.getElementById('select-tags-modal');
  
  if (!modal) {
    return;
  }
  
  const container = document.getElementById('select-tags-container');
  const preview = document.getElementById('selected-tags-preview');
  const countEl = document.getElementById('selected-tags-count');
  
  currentEditingGroupId = groupId;
  selectedTagsForGroup = new Set();
  
  // 清空容器
  container.innerHTML = '';
  preview.innerHTML = '';
  countEl.textContent = '0';
  
  // 获取当前分组的标签（用于排除）
  const groupsData = await TagGroups.getAll();
  const currentGroup = groupsData.groups.find(g => g.id === groupId);
  const currentGroupTags = new Set(currentGroup ? currentGroup.tags : []);
  
  // 获取所有标签
  const allTags = (await BookmarkTags.getAllTags()) || [];
  
  // 渲染其他分组
  if (groupsData.groups && groupsData.groups.length > 0) {
    groupsData.groups.forEach(group => {
      // 跳过当前分组
      if (group.id === groupId) return;
      
      // 过滤出不在当前分组的标签
      const availableTags = group.tags.filter(tag => !currentGroupTags.has(tag));
      
      if (availableTags.length > 0) {
        const groupEl = document.createElement('div');
        groupEl.className = 'select-tag-group';
        
        const header = document.createElement('div');
        header.className = 'select-tag-group-header';
        header.innerHTML = `<span>📁</span><span>${Utils.escapeHtml(String(group.name))}</span><span style="margin-left:auto;font-weight:normal">(${Utils.escapeHtml(String(availableTags.length))})</span>`;
        
        const content = document.createElement('div');
        content.className = 'select-tag-group-content';
        
        availableTags.forEach(tag => {
          const tagEl = createSelectableTagItem(tag);
          content.appendChild(tagEl);
        });
        
        groupEl.appendChild(header);
        groupEl.appendChild(content);
        container.appendChild(groupEl);
      }
    });
  }
  
  // 获取未分组标签
  const ungroupedTags = await TagGroups.getUngroupedTags(allTags);
  const availableUngroupedTags = ungroupedTags.filter(tag => !currentGroupTags.has(tag));
  
  if (availableUngroupedTags.length > 0) {
    const ungroupedEl = document.createElement('div');
    ungroupedEl.className = 'select-tag-group';
    
    const header = document.createElement('div');
    header.className = 'select-tag-group-header';
    header.innerHTML = `<span>📋</span><span>${Utils.escapeHtml(String(I18n.t('tagGroup.ungrouped')))}</span><span style="margin-left:auto;font-weight:normal">(${Utils.escapeHtml(String(availableUngroupedTags.length))})</span>`;
    
    const content = document.createElement('div');
    content.className = 'select-tag-group-content';
    
    availableUngroupedTags.forEach(tag => {
      const tagEl = createSelectableTagItem(tag);
      content.appendChild(tagEl);
    });
    
    ungroupedEl.appendChild(header);
    ungroupedEl.appendChild(content);
    container.appendChild(ungroupedEl);
  }
  
  // 如果没有可选择的标签
  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-state">' + I18n.t('tagGroup.noTagsToSelect') + '</div>';
  }
  
  modal.classList.add('visible');
}

function createSelectableTagItem(tag) {
  const tagEl = document.createElement('div');
  tagEl.className = 'select-tag-item';
  tagEl.dataset.tag = tag;
  tagEl.innerHTML = `
    <span class="checkbox"></span>
    <span>${Utils.escapeHtml(String(tag))}</span>
  `;
  
  tagEl.addEventListener('click', () => {
    toggleSelectTag(tag, tagEl);
  });
  
  return tagEl;
}

function toggleSelectTag(tag, element) {
  const preview = document.getElementById('selected-tags-preview');
  const countEl = document.getElementById('selected-tags-count');
  
  if (selectedTagsForGroup.has(tag)) {
    selectedTagsForGroup.delete(tag);
    element.classList.remove('selected');
    element.querySelector('.checkbox').textContent = '';
    
    // 从预览中移除
    const previewTag = preview.querySelector(`[data-tag="${CSS.escape(tag)}"]`);
    if (previewTag) previewTag.remove();
  } else {
    selectedTagsForGroup.add(tag);
    element.classList.add('selected');
    element.querySelector('.checkbox').textContent = '✓';
    
    // 添加到预览
    const previewTag = document.createElement('span');
    previewTag.className = 'preview-tag';
    previewTag.dataset.tag = tag;
    previewTag.textContent = tag;
    preview.appendChild(previewTag);
  }
  
  countEl.textContent = selectedTagsForGroup.size;
}

async function confirmAddTagsToGroup() {
  if (selectedTagsForGroup.size === 0) {
    hideSelectTagsModal();
    return;
  }

  try {
    // 将选中的标签添加到当前分组
    for (const tag of selectedTagsForGroup) {
      await TagGroups.addTagToGroup(currentEditingGroupId, tag);
    }

    hideSelectTagsModal();
    await loadTagsOverview();
  } catch (error) {
    console.error(I18n.t('tags.addTagToGroupFailed'), error);
    await showAlert(I18n.t('tags.addFailed'));
  }
}

function hideSelectTagsModal() {
  const modal = document.getElementById('select-tags-modal');
  modal.classList.remove('visible');
  currentEditingGroupId = null;
  selectedTagsForGroup = new Set();
}

async function showTagDetail(tagName) {
  try {
    const tagDetailCard = document.getElementById('tag-detail-card');
    const tagDetailTitle = document.getElementById('tag-detail-title');
    const tagBookmarksList = document.getElementById('tag-bookmarks-list');
    
    tagDetailTitle.textContent = `#${tagName}`;
    tagDetailCard.style.display = 'block';
    tagBookmarksList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>' + I18n.t('common.loading') + '</p></div>';
    
    // 获取所有使用该标签的书签
    const allTags = await BookmarkTags.getAll();
    const bookmarkIds = [];
    
    Object.entries(allTags).forEach(([bookmarkId, tags]) => {
      if (tags.includes(tagName)) {
        bookmarkIds.push(bookmarkId);
      }
    });
    
    // 获取书签详情
    const bookmarks = [];
    for (const id of bookmarkIds) {
      try {
        const results = await new Promise((resolve) => {
          ExtensionAPI.bookmarks.get(id, resolve);
        });
        if (results && results.length > 0) {
          bookmarks.push(results[0]);
        }
      } catch (error) {
        // 书签可能已被删除
      }
    }
    
    tagBookmarksList.innerHTML = '';
    
    if (bookmarks.length === 0) {
      tagBookmarksList.innerHTML = '<div class="empty-state">' + I18n.t('common.noBookmark') + '</div>';
      return;
    }

    bookmarks.forEach(bookmark => {
      const bookmarkItem = document.createElement('div');
      bookmarkItem.className = 'tag-bookmark-item';
      bookmarkItem.innerHTML = `
        <div class="tag-bookmark-title">${Utils.escapeHtml(String(bookmark.title || I18n.t('common.noTitle')))}</div>
        <div class="tag-bookmark-url">${Utils.escapeHtml(String(bookmark.url))}</div>
      `;
      
      bookmarkItem.addEventListener('click', () => {
        window.open(bookmark.url, '_blank');
      });
      
      tagBookmarksList.appendChild(bookmarkItem);
    });
  } catch (error) {
    console.error(I18n.t('tagGroup.loadDetailFailed'), error);
  }
}



// Recovery remains available after a failed or interrupted import.
document.addEventListener('DOMContentLoaded', async () => {
  const status = await ExtensionAPI.runtime.sendMessage({action:'recoverySnapshot'});
  if (!status.restore_snapshot) return;
  const panel=document.createElement('div'); panel.className='settings-card';
  const title=document.createElement('p'); title.textContent='恢复快照：' + (status.restore_job?.status || '可用'); panel.appendChild(title);
  for(const [label,action] of [['导出恢复快照','export'],['恢复到快照','recover']]) {
    const button=document.createElement('button'); button.className='btn'; button.textContent=label;
    button.addEventListener('click',async()=>{try {
      if(action==='export') { Utils.downloadJSON(status.restore_snapshot,'recovery-snapshot.json'); return; }
      if(!await showConfirm('将用快照覆盖当前书签及关联数据。是否继续？',{danger:true})) return;
      button.disabled=true; const r=await ExtensionAPI.runtime.sendMessage({action:'recover',confirmed:true}); if(!r.success) throw new Error(r.error); location.reload();
    }catch(e){await showAlert(e.message);}finally{button.disabled=false;}}); panel.appendChild(button);
  }
  (document.getElementById('backup-files-container')?.parentElement || document.body).appendChild(panel);
});
