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
