/**
 * 设置页面脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  ThemeManager.init();
  await loadSettings();
  setupEventListeners();
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
  document.getElementById('bookmark-height-slider').value = layoutSettings.bookmarkHeight || 32;
  document.getElementById('bookmark-height-value').textContent = `${layoutSettings.bookmarkHeight || 32}px`;
  document.getElementById('tree-indent-slider').value = layoutSettings.treeIndent || 20;
  document.getElementById('tree-indent-value').textContent = `${layoutSettings.treeIndent || 20}px`;

  // 更新预览
  updateLayoutPreview(layoutSettings.bookmarkHeight || 32, layoutSettings.treeIndent || 20);
}

function setupEventListeners() {
  // 菜单切换
  document.querySelectorAll('.settings-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      switchSection(section);
    });
  });
  
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
  const indentSlider = document.getElementById('tree-indent-slider');
  const indentValue = document.getElementById('tree-indent-value');

  heightSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    heightValue.textContent = `${value}px`;
    updateLayoutPreview(value, parseInt(indentSlider.value));
  });

  indentSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    indentValue.textContent = `${value}px`;
    updateLayoutPreview(parseInt(heightSlider.value), value);
  });

  // 布局设置按钮
  document.getElementById('save-layout-btn').addEventListener('click', saveLayoutSettings);
  document.getElementById('reset-layout-btn').addEventListener('click', resetLayoutSettings);
}

function updateLayoutPreview(height, indent) {
  const preview = document.getElementById('layout-preview');
  if (preview) {
    preview.style.setProperty('--preview-height', `${height}px`);
    preview.style.setProperty('--preview-indent', `${indent}px`);
  }
}

async function saveLayoutSettings() {
  const settings = {
    bookmarkHeight: parseInt(document.getElementById('bookmark-height-slider').value),
    treeIndent: parseInt(document.getElementById('tree-indent-slider').value)
  };

  await Storage.set({ layoutSettings: settings });
  showStatus('layout-status', '布局设置已保存', 'success');
}

async function resetLayoutSettings() {
  const defaultSettings = {
    bookmarkHeight: 32,
    treeIndent: 20
  };

  document.getElementById('bookmark-height-slider').value = defaultSettings.bookmarkHeight;
  document.getElementById('bookmark-height-value').textContent = `${defaultSettings.bookmarkHeight}px`;
  document.getElementById('tree-indent-slider').value = defaultSettings.treeIndent;
  document.getElementById('tree-indent-value').textContent = `${defaultSettings.treeIndent}px`;

  updateLayoutPreview(defaultSettings.bookmarkHeight, defaultSettings.treeIndent);

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
