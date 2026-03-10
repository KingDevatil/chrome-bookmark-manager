/**
 * 设置页面脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  ThemeManager.init();
  await loadSettings();
  setupEventListeners();
  await loadFrequentlyUsedSettings();
});

async function loadSettings() {
  const result = await Storage.get(['webdavConfig', 'backupSettings', 'layoutSettings']);

  const webdavConfig = result.webdavConfig || { enabled: false, url: '', username: '', password: '' };
  const backupSettings = result.backupSettings || { autoBackup: false, backupInterval: 60, backupOnStartup: false };
  const layoutSettings = result.layoutSettings || { bookmarkHeight: 32, treeIndent: 20 };

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
  
  // WebDAV 按钮
  document.getElementById('test-connection-btn').addEventListener('click', testWebDAVConnection);
  document.getElementById('save-webdav-btn').addEventListener('click', saveWebDAVConfig);
  
  // 备份设置按钮
  document.getElementById('save-backup-settings-btn').addEventListener('click', saveBackupSettings);
  
  // 手动操作按钮
  document.getElementById('backup-now-btn').addEventListener('click', backupNow);
  document.getElementById('restore-btn').addEventListener('click', restoreBackup);
  
  // 标签备份按钮
  document.getElementById('export-tags-btn').addEventListener('click', exportTags);
  document.getElementById('import-tags-btn').addEventListener('click', () => {
    document.getElementById('import-tags-file').click();
  });
  document.getElementById('import-tags-file').addEventListener('change', handleImportTagsFile);

  // 标签清理按钮
  document.getElementById('detect-tags-btn').addEventListener('click', detectOrphanedTags);
  document.getElementById('clean-tags-btn').addEventListener('click', cleanOrphanedTags);
  
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
    bookmarkIndent: parseInt(document.getElementById('bookmark-indent-slider').value)
  };

  await Storage.set({ layoutSettings: settings });
  showStatus('layout-status', '布局设置已保存', 'success');
}

async function resetLayoutSettings() {
  const defaultSettings = {
    bookmarkHeight: 30,
    treeIndent: 5,
    bookmarkIndent: 5
  };

  document.getElementById('bookmark-height-slider').value = defaultSettings.bookmarkHeight;
  document.getElementById('bookmark-height-value').textContent = `${defaultSettings.bookmarkHeight}px`;
  document.getElementById('tree-indent-slider').value = defaultSettings.treeIndent;
  document.getElementById('tree-indent-value').textContent = `${defaultSettings.treeIndent}px`;
  document.getElementById('bookmark-indent-slider').value = defaultSettings.bookmarkIndent;
  document.getElementById('bookmark-indent-value').textContent = `${defaultSettings.bookmarkIndent}px`;

  updateLayoutPreview(defaultSettings.bookmarkHeight, defaultSettings.treeIndent, defaultSettings.bookmarkIndent);

  await Storage.set({ layoutSettings: defaultSettings });
  showStatus('layout-status', '已恢复默认设置', 'success');
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
  document.getElementById('help-section').style.display = section === 'help' ? 'block' : 'none';
}

async function testWebDAVConnection() {
  const config = {
    url: document.getElementById('webdav-url').value.trim(),
    username: document.getElementById('webdav-username').value.trim(),
    password: document.getElementById('webdav-password').value
  };
  
  if (!config.url) {
    showStatus('webdav-status', '请输入服务器地址', 'error');
    return;
  }
  
  showStatus('webdav-status', '正在测试连接...', 'info');
  document.getElementById('test-connection-btn').disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'testWebDAV',
      config
    });
    
    if (response.success) {
      showStatus('webdav-status', '连接成功！', 'success');
    } else {
      showStatus('webdav-status', `连接失败: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus('webdav-status', `连接失败: ${error.message}`, 'error');
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
    showStatus('webdav-status', '启用 WebDAV 时需要填写服务器地址', 'error');
    return;
  }
  
  await Storage.set({ webdavConfig: config });
  await chrome.runtime.sendMessage({ action: 'init' });
  
  showStatus('webdav-status', '配置已保存', 'success');
}

async function saveBackupSettings() {
  const settings = {
    autoBackup: document.getElementById('auto-backup-enabled').checked,
    backupInterval: parseInt(document.getElementById('backup-interval').value),
    backupOnStartup: document.getElementById('backup-on-startup').checked
  };
  
  await Storage.set({ backupSettings: settings });
  await chrome.runtime.sendMessage({ action: 'init' });
  
  showStatus('backup-settings-status', '备份设置已保存', 'success');
}

async function backupNow() {
  const result = await Storage.get('webdavConfig');
  if (!result.webdavConfig || !result.webdavConfig.enabled) {
    showStatus('backup-now-status', '请先启用并配置 WebDAV', 'error');
    return;
  }
  
  showStatus('backup-now-status', '正在备份...', 'info');
  document.getElementById('backup-now-btn').disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'backup' });
    
    if (response.success) {
      showStatus('backup-now-status', `备份成功: ${response.filename}`, 'success');
    } else {
      showStatus('backup-now-status', `备份失败: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus('backup-now-status', `备份失败: ${error.message}`, 'error');
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
  const modeText = merge ? '合并' : '覆盖';
  
  if (!confirm(`确定要恢复备份吗？这将使用${modeText}模式恢复书签。`)) {
    return;
  }
  
  showStatus('restore-status', '正在恢复...', 'info');
  document.getElementById('restore-btn').disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'restore',
      filename: 'bookmarks.json',
      merge
    });
    
    if (response.success) {
      showStatus('restore-status', '恢复成功！请刷新页面查看', 'success');
    } else {
      showStatus('restore-status', `恢复失败: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus('restore-status', `恢复失败: ${error.message}`, 'error');
  } finally {
    document.getElementById('restore-btn').disabled = false;
  }
}

function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status-message ${type} visible`;
  
  setTimeout(() => {
    element.classList.remove('visible');
  }, 5000);
}

// ============================================
// 标签备份功能
// ============================================

async function exportTags() {
  try {
    const result = await chrome.storage.local.get('bookmark_tags');
    const tags = result.bookmark_tags || {};
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tags: tags
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-tags-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('export-tags-status', '标签导出成功', 'success');
  } catch (error) {
    showStatus('export-tags-status', `导出失败：${error.message}`, 'error');
  }
}

function handleImportTagsFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  document.getElementById('import-tags-filename').textContent = file.name;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // 验证数据格式
      if (!importedData.tags || typeof importedData.tags !== 'object') {
        throw new Error('文件格式不正确');
      }
      
      // 显示确认对话框
      const tagCount = Object.keys(importedData.tags).length;
      if (!confirm(`确定要导入 ${tagCount} 个书签的标签数据吗？\n\n这将合并到现有标签数据中，冲突的标签将被覆盖。`)) {
        return;
      }
      
      // 合并标签数据
      const existing = await chrome.storage.local.get('bookmark_tags');
      const merged = {
        ...(existing.bookmark_tags || {}),
        ...importedData.tags
      };
      
      await chrome.storage.local.set({ bookmark_tags: merged });
      
      showStatus('import-tags-status', `导入成功！共导入 ${tagCount} 个书签的标签`, 'success');
      document.getElementById('import-tags-file').value = '';
      document.getElementById('import-tags-filename').textContent = '';
    } catch (error) {
      showStatus('import-tags-status', `导入失败：${error.message}`, 'error');
    }
  };
  
  reader.onerror = () => {
    showStatus('import-tags-status', '文件读取失败', 'error');
  };
  
  reader.readAsText(file);
}

// ============================================
// 标签清理功能
// ============================================

async function detectOrphanedTags() {
  try {
    const detectBtn = document.getElementById('detect-tags-btn');
    detectBtn.disabled = true;
    detectBtn.textContent = '检测中...';
    
    showStatus('detect-tags-status', '正在检测孤立标签...', 'info');
    
    const orphaned = await BookmarkTags.detectOrphanedTags();
    const count = Object.keys(orphaned).length;
    
    if (count === 0) {
      showStatus('detect-tags-status', '检测完成，未发现孤立标签', 'success');
    } else {
      showStatus('detect-tags-status', `检测到 ${count} 个孤立标签，请点击"清理无效标签"按钮进行清理`, 'info');
    }
    
    detectBtn.disabled = false;
    detectBtn.textContent = '开始检测';
  } catch (error) {
    showStatus('detect-tags-status', `检测失败：${error.message}`, 'error');
  }
}

async function cleanOrphanedTags() {
  try {
    const cleanBtn = document.getElementById('clean-tags-btn');
    
    // 先检测是否有孤立标签
    const orphaned = await BookmarkTags.detectOrphanedTags();
    const count = Object.keys(orphaned).length;
    
    if (count === 0) {
      showStatus('clean-tags-status', '没有需要清理的孤立标签', 'info');
      return;
    }
    
    // 显示确认对话框
    if (!confirm(`检测到 ${count} 个孤立标签，确定要清理吗？\n\n清理后将删除这些书签的标签数据，此操作不可撤销。`)) {
      return;
    }
    
    cleanBtn.disabled = true;
    cleanBtn.textContent = '清理中...';
    showStatus('clean-tags-status', '正在清理孤立标签...', 'info');
    
    // 执行清理
    const result = await BookmarkTags.cleanOrphanedTags();
    
    showStatus('clean-tags-status', `清理完成！共删除 ${result.cleaned} 个孤立标签`, 'success');
    
    cleanBtn.disabled = false;
    cleanBtn.textContent = '清理无效标签';
  } catch (error) {
    showStatus('clean-tags-status', `清理失败：${error.message}`, 'error');
  }
}

// ============================================
// 常用目录设置
// ============================================

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
    removeBtn.textContent = '移除';
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
    removeBtn.textContent = '取消置顶';
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
      showStatus('frequently-used-status', '设置已保存', 'success');
    } catch (error) {
      console.error('保存常用目录设置失败:', error);
      showStatus('frequently-used-status', '保存失败，请重试', 'error');
    }
  });
  
  document.getElementById('reset-frequently-used-btn').addEventListener('click', async () => {
    try {
      await FrequentlyUsedConfig.resetConfig();
      await loadFrequentlyUsedSettings();
      showStatus('frequently-used-status', '已恢复默认设置', 'success');
    } catch (error) {
      console.error('重置常用目录设置失败:', error);
      showStatus('frequently-used-status', '重置失败，请重试', 'error');
    }
  });
  
  document.getElementById('clear-all-pinned-btn').addEventListener('click', async () => {
    if (!confirm('确定要清空所有置顶链接吗？')) {
      return;
    }
    try {
      const config = await FrequentlyUsedConfig.getConfig();
      config.pinned = [];
      await FrequentlyUsedConfig.saveConfig(config);
      await renderPinnedList();
      showStatus('frequently-used-status', '已清空所有置顶', 'success');
    } catch (error) {
      console.error('清空置顶失败:', error);
      showStatus('frequently-used-status', '清空失败，请重试', 'error');
    }
  });
  
  document.getElementById('add-blacklist-btn').addEventListener('click', async () => {
    try {
      const domainInput = document.getElementById('blacklist-domain-input');
      const domain = domainInput.value.trim();
      
      if (!domain) {
        showStatus('frequently-used-status', '请输入域名', 'error');
        return;
      }
      
      await FrequentlyUsedConfig.addToBlacklist(domain);
      domainInput.value = '';
      await renderBlacklist();
      showStatus('frequently-used-status', '已添加到黑名单', 'success');
    } catch (error) {
      console.error('添加到黑名单失败:', error);
      showStatus('frequently-used-status', '添加失败，请重试', 'error');
    }
  });
}

// ============================================
// 标签总览功能
// ============================================

async function loadTagsOverview() {
  try {
    const loading = document.getElementById('tags-loading');
    const tagsList = document.getElementById('tags-list');
    
    loading.style.display = 'block';
    tagsList.innerHTML = '';
    
    const allTags = await BookmarkTags.getAll();
    
    // 统计每个标签的书签数量
    const tagStats = {};
    Object.values(allTags).forEach(tags => {
      tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });
    
    loading.style.display = 'none';
    
    const tagNames = Object.keys(tagStats).sort();
    
    if (tagNames.length === 0) {
      tagsList.innerHTML = '<div class="empty-state">暂无标签</div>';
      return;
    }
    
    tagNames.forEach(tagName => {
      const count = tagStats[tagName];
      const tagItem = document.createElement('div');
      tagItem.className = 'tag-item';
      tagItem.innerHTML = `
        <div class="tag-info">
          <span class="tag-name">${tagName}</span>
          <span class="tag-count">${count} 个书签</span>
        </div>
      `;
      
      tagItem.addEventListener('click', () => showTagDetail(tagName));
      tagsList.appendChild(tagItem);
    });
  } catch (error) {
    console.error('加载标签总览失败:', error);
  }
}

async function showTagDetail(tagName) {
  try {
    const tagDetailCard = document.getElementById('tag-detail-card');
    const tagDetailTitle = document.getElementById('tag-detail-title');
    const tagBookmarksList = document.getElementById('tag-bookmarks-list');
    
    tagDetailTitle.textContent = `#${tagName}`;
    tagDetailCard.style.display = 'block';
    tagBookmarksList.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>加载中...</p></div>';
    
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
          chrome.bookmarks.get(id, resolve);
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
      tagBookmarksList.innerHTML = '<div class="empty-state">暂无书签</div>';
      return;
    }
    
    bookmarks.forEach(bookmark => {
      const bookmarkItem = document.createElement('div');
      bookmarkItem.className = 'tag-bookmark-item';
      bookmarkItem.innerHTML = `
        <div class="tag-bookmark-title">${bookmark.title || '无标题'}</div>
        <div class="tag-bookmark-url">${bookmark.url}</div>
      `;
      
      bookmarkItem.addEventListener('click', () => {
        window.open(bookmark.url, '_blank');
      });
      
      tagBookmarksList.appendChild(bookmarkItem);
    });
  } catch (error) {
    console.error('加载标签详情失败:', error);
  }
}


