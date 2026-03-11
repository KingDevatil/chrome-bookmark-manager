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
  const layoutSettings = result.layoutSettings || { 
    bookmarkHeight: 32, 
    treeIndent: 20,
    displayMode: 'sidebar',
    floatWidth: 400
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

  // 布局设置 - 显示模式
  const displayMode = layoutSettings.displayMode || 'sidebar';
  document.querySelectorAll('input[name="display-mode"]').forEach(radio => {
    radio.checked = radio.value === displayMode;
  });
  document.getElementById('float-width-field').style.display = displayMode === 'float' ? 'block' : 'none';
  document.getElementById('float-width-slider').value = layoutSettings.floatWidth || 400;
  document.getElementById('float-width-value').textContent = `${layoutSettings.floatWidth || 400}px`;

  // 布局设置 - 其他
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

  // 统一导出/导入按钮
  document.getElementById('export-all-btn').addEventListener('click', exportAllConfig);
  document.getElementById('import-all-btn').addEventListener('click', () => {
    document.getElementById('import-all-file').click();
  });
  document.getElementById('import-all-file').addEventListener('change', handleImportAllConfig);

  // 布局备份按钮
  document.getElementById('export-layout-btn').addEventListener('click', exportLayout);
  document.getElementById('import-layout-btn').addEventListener('click', () => {
    document.getElementById('import-layout-file').click();
  });
  document.getElementById('import-layout-file').addEventListener('change', handleImportLayout);

  // 标签清理按钮
  document.getElementById('detect-tags-btn').addEventListener('click', detectOrphanedTags);
  document.getElementById('clean-tags-btn').addEventListener('click', cleanOrphanedTags);
  
  // 书签查重功能
  initDuplicateDetection();
  
  // 标签分组管理
  document.getElementById('create-tag-group-btn').addEventListener('click', createTagGroup);
  
  // 关闭标签详情
  const closeBtn = document.getElementById('close-tag-detail');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('tag-detail-card').style.display = 'none';
    });
  }
  
  // 关闭标签详情卡片（新版）
  const closeDetailBtn = document.getElementById('close-tag-detail');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
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
  
  // 显示模式切换
  document.querySelectorAll('input[name="display-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const displayMode = e.target.value;
      document.getElementById('float-width-field').style.display = displayMode === 'float' ? 'block' : 'none';
    });
  });
  
  // 浮窗宽度滑块
  document.getElementById('float-width-slider').addEventListener('input', (e) => {
    document.getElementById('float-width-value').textContent = `${e.target.value}px`;
  });
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
  const displayMode = document.querySelector('input[name="display-mode"]:checked').value;
  const settings = {
    bookmarkHeight: parseInt(document.getElementById('bookmark-height-slider').value),
    treeIndent: parseInt(document.getElementById('tree-indent-slider').value),
    bookmarkIndent: parseInt(document.getElementById('bookmark-indent-slider').value),
    displayMode: displayMode,
    floatWidth: parseInt(document.getElementById('float-width-slider').value)
  };

  await Storage.set({ layoutSettings: settings });
  showStatus('layout-status', '布局设置已保存', 'success');
}

async function resetLayoutSettings() {
  const defaultSettings = {
    bookmarkHeight: 30,
    treeIndent: 5,
    bookmarkIndent: 5,
    displayMode: 'sidebar',
    floatWidth: 400
  };

  document.getElementById('bookmark-height-slider').value = defaultSettings.bookmarkHeight;
  document.getElementById('bookmark-height-value').textContent = `${defaultSettings.bookmarkHeight}px`;
  document.getElementById('tree-indent-slider').value = defaultSettings.treeIndent;
  document.getElementById('tree-indent-value').textContent = `${defaultSettings.treeIndent}px`;
  document.getElementById('bookmark-indent-slider').value = defaultSettings.bookmarkIndent;
  document.getElementById('bookmark-indent-value').textContent = `${defaultSettings.bookmarkIndent}px`;
  
  // 重置显示模式
  document.querySelectorAll('input[name="display-mode"]').forEach(radio => {
    radio.checked = radio.value === defaultSettings.displayMode;
  });
  document.getElementById('float-width-field').style.display = 'none';
  document.getElementById('float-width-slider').value = defaultSettings.floatWidth;
  document.getElementById('float-width-value').textContent = `${defaultSettings.floatWidth}px`;

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
    
    // 获取标签分组数据
    const tagGroupsData = await TagGroups.getAll();
    
    const exportData = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      tags: tags,
      tagGroups: tagGroupsData
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
    
    showStatus('export-tags-status', '标签和分组导出成功', 'success');
  } catch (error) {
    showStatus('export-tags-status', `导出失败：${error.message}`, 'error');
  }
}

// 统一导出配置
async function exportAllConfig() {
  try {
    const exportBookmarks = document.getElementById('export-bookmarks').checked;
    const exportLayout = document.getElementById('export-layout').checked;
    const exportTags = document.getElementById('export-tags').checked;
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      type: 'unified-export'
    };
    
    // 导出书签
    if (exportBookmarks) {
      const tree = await chrome.bookmarks.getTree();
      exportData.bookmarks = tree;
    }
    
    // 导出布局
    if (exportLayout) {
      const layoutResult = await Storage.get('layoutSettings');
      exportData.layoutSettings = layoutResult.layoutSettings || {};
    }
    
    // 导出标签
    if (exportTags) {
      const tagsResult = await chrome.storage.local.get('bookmark_tags');
      exportData.tags = tagsResult.bookmark_tags || {};
      const tagGroupsData = await TagGroups.getAll();
      exportData.tagGroups = tagGroupsData;
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('export-all-status', '配置导出成功', 'success');
  } catch (error) {
    showStatus('export-all-status', `导出失败：${error.message}`, 'error');
  }
}

// 统一导入配置
async function handleImportAllConfig(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    document.getElementById('import-all-filename').textContent = file.name;
    
    // 导入书签
    if (data.bookmarks) {
      // 合并模式：遍历导入的书签，添加到现有书签树
      for (const node of data.bookmarks) {
        await mergeBookmarks(node);
      }
    }
    
    // 导入布局
    if (data.layoutSettings) {
      await Storage.set({ layoutSettings: data.layoutSettings });
    }
    
    // 导入标签
    if (data.tags) {
      const existingTags = await chrome.storage.local.get('bookmark_tags');
      const mergedTags = { ...(existingTags.bookmark_tags || {}), ...data.tags };
      await chrome.storage.local.set({ bookmark_tags: mergedTags });
    }
    
    // 导入标签分组
    if (data.tagGroups) {
      for (const group of (data.tagGroups.groups || [])) {
        await TagGroups.createGroup(group.name, group.tags || []);
      }
    }
    
    showStatus('import-all-status', '配置导入成功', 'success');
  } catch (error) {
    showStatus('import-all-status', `导入失败：${error.message}`, 'error');
  }
  
  event.target.value = '';
}

// 递归合并书签
async function mergeBookmarks(node, parentId = '0') {
  if (node.url) {
    // 检查是否已存在
    const existing = await chrome.bookmarks.search({ url: node.url });
    if (existing.length === 0) {
      await chrome.bookmarks.create({
        parentId: parentId,
        title: node.title,
        url: node.url
      });
    }
  }
  if (node.children) {
    for (const child of node.children) {
      let newParentId = parentId;
      if (!child.url) {
        const folder = await chrome.bookmarks.create({
          parentId: parentId,
          title: child.title
        });
        newParentId = folder.id;
      }
      await mergeBookmarks(child, newParentId);
    }
  }
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
    
    showStatus('export-layout-status', '布局设置导出成功', 'success');
  } catch (error) {
    showStatus('export-layout-status', `导出失败：${error.message}`, 'error');
  }
}

// 导入布局
async function handleImportLayout(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    document.getElementById('import-layout-filename').textContent = file.name;
    
    if (data.layoutSettings) {
      await Storage.set({ layoutSettings: data.layoutSettings });
      showStatus('import-layout-status', '布局设置导入成功', 'success');
    } else {
      showStatus('import-layout-status', '无效的布局文件', 'error');
    }
  } catch (error) {
    showStatus('import-layout-status', `导入失败：${error.message}`, 'error');
  }
  
  event.target.value = '';
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
      const hasTagGroups = importedData.tagGroups && importedData.tagGroups.groups && importedData.tagGroups.groups.length > 0;
      const groupInfo = hasTagGroups ? `，${importedData.tagGroups.groups.length} 个标签分组` : '';
      
      if (!confirm(`确定要导入 ${tagCount} 个书签的标签数据${groupInfo}吗？\n\n这将合并到现有数据中，冲突的数据将被覆盖。`)) {
        return;
      }
      
      // 合并标签数据
      const existing = await chrome.storage.local.get('bookmark_tags');
      const merged = {
        ...(existing.bookmark_tags || {}),
        ...importedData.tags
      };
      
      await chrome.storage.local.set({ bookmark_tags: merged });
      
      // 导入标签分组（如果有）
      if (hasTagGroups) {
        const existingGroups = await TagGroups.getAll();
        // 合并分组（按名称匹配）
        const mergedGroups = [...(existingGroups.groups || [])];
        for (const importedGroup of importedData.tagGroups.groups) {
          const existingGroupIndex = mergedGroups.findIndex(g => g.name === importedGroup.name);
          if (existingGroupIndex >= 0) {
            // 合并标签到现有分组
            const existingGroup = mergedGroups[existingGroupIndex];
            const mergedTags = [...new Set([...existingGroup.tags, ...importedGroup.tags])];
            mergedGroups[existingGroupIndex].tags = mergedTags;
          } else {
            // 添加新分组
            mergedGroups.push(importedGroup);
          }
        }
        await TagGroups.save(mergedGroups);
      }
      
      showStatus('import-tags-status', `导入成功！共导入 ${tagCount} 个书签的标签${groupInfo}`, 'success');
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
    const tree = await chrome.bookmarks.getTree();
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
      alert('请选择要删除的书签');
      return;
    }
    
    if (!confirm(`确定要删除选中的 ${idsToDelete.length} 个书签吗？`)) {
      return;
    }
    
    const deleteBtn = document.getElementById('delete-duplicates-btn');
    deleteBtn.disabled = true;
    deleteBtn.textContent = '删除中...';
    
    // 删除选中的书签
    for (const id of idsToDelete) {
      await chrome.bookmarks.remove(id);
    }
    
    // 重新检测
    await detectDuplicateBookmarks();
    
    deleteBtn.disabled = false;
    deleteBtn.textContent = '删除选中';
  } catch (error) {
    alert(`删除失败：${error.message}`);
    const deleteBtn = document.getElementById('delete-duplicates-btn');
    deleteBtn.disabled = false;
    deleteBtn.textContent = '删除选中';
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

// 初始化书签查重功能
function initDuplicateDetection() {
  document.getElementById('detect-duplicates-btn').addEventListener('click', detectDuplicateBookmarks);
  document.getElementById('delete-duplicates-btn').addEventListener('click', deleteSelectedDuplicates);
  setupDuplicateCheckboxes();
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
      const statusEl = document.getElementById('frequently-used-status');
      if (statusEl) {
        statusEl.textContent = '已清空所有置顶';
        statusEl.className = 'status-message success visible';
        setTimeout(() => statusEl.classList.remove('visible'), 3000);
      }
    } catch (error) {
      console.error('清空置顶失败:', error);
      const statusEl = document.getElementById('frequently-used-status');
      if (statusEl) {
        statusEl.textContent = '清空失败: ' + error.message;
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
      groupsList.innerHTML = '<div class="empty-state">暂无分组，点击上方按钮创建</div>';
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
      ungroupedList.innerHTML = '<div class="empty-state">所有标签已分组</div>';
    }
  } catch (error) {
    console.error('加载标签总览失败:', error);
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
      <span>${group.name}</span>
      <span class="tag-group-count">${group.tags.length} 个标签</span>
    </div>
    <div class="tag-group-actions">
      <button class="btn btn-sm edit-group-btn">编辑</button>
      <button class="btn btn-sm delete-group-btn" style="color: #dc2626;">删除</button>
    </div>
  `;
  
  // 内容区
  const content = document.createElement('div');
  content.className = 'tag-group-content';
  
  group.tags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag-group-tag';
    tagEl.innerHTML = `${tag}<span class="remove-tag">×</span>`;
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
  addBtn.textContent = '+ 添加标签';
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

async function createTagGroup() {
  const name = prompt('请输入分组名称：');
  if (!name || !name.trim()) return;
  
  try {
    await TagGroups.createGroup(name.trim());
    await loadTagsOverview();
  } catch (error) {
    console.error('创建分组失败:', error);
    alert('创建分组失败');
  }
}

async function deleteGroup(groupId, groupName) {
  if (!confirm(`确定要删除分组「${groupName}」吗？\n分组内的标签将变为未分组状态。`)) {
    return;
  }
  
  try {
    await TagGroups.deleteGroup(groupId);
    await loadTagsOverview();
  } catch (error) {
    console.error('删除分组失败:', error);
    alert('删除分组失败');
  }
}

async function renameGroup(groupId, currentName) {
  const newName = prompt('请输入新的分组名称：', currentName);
  if (!newName || !newName.trim() || newName.trim() === currentName) return;
  
  try {
    await TagGroups.renameGroup(groupId, newName.trim());
    await loadTagsOverview();
  } catch (error) {
    console.error('重命名分组失败:', error);
    alert('重命名分组失败');
  }
}

async function addTagToGroup(groupId, tagName) {
  try {
    await TagGroups.addTagToGroup(groupId, tagName);
    await loadTagsOverview();
  } catch (error) {
    console.error('添加标签到分组失败:', error);
    alert('添加标签失败');
  }
}

async function removeTagFromGroup(groupId, tagName) {
  try {
    await TagGroups.removeTagFromGroup(groupId, tagName);
    await loadTagsOverview();
  } catch (error) {
    console.error('从分组移除标签失败:', error);
    alert('移除标签失败');
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
        header.innerHTML = `<span>📁</span><span>${group.name}</span><span style="margin-left:auto;font-weight:normal">(${availableTags.length})</span>`;
        
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
    header.innerHTML = `<span>📋</span><span>未分组</span><span style="margin-left:auto;font-weight:normal">(${availableUngroupedTags.length})</span>`;
    
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
    container.innerHTML = '<div class="empty-state">没有可选择的标签，所有标签已在此分组中</div>';
  }
  
  modal.classList.add('visible');
}

function createSelectableTagItem(tag) {
  const tagEl = document.createElement('div');
  tagEl.className = 'select-tag-item';
  tagEl.dataset.tag = tag;
  tagEl.innerHTML = `
    <span class="checkbox"></span>
    <span>${tag}</span>
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
    const previewTag = preview.querySelector(`[data-tag="${tag}"]`);
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
    console.error('添加标签到分组失败:', error);
    alert('添加标签失败');
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


