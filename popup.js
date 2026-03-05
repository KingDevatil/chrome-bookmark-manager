/**
 * 弹出窗口脚本
 */

const bookmarkCountEl = document.getElementById('bookmark-count');
const folderCountEl = document.getElementById('folder-count');
const btnOpenSidebar = document.getElementById('btn-open-sidebar');
const btnOpenManager = document.getElementById('btn-open-manager');
const btnAddCurrent = document.getElementById('btn-add-current');
const btnSettings = document.getElementById('btn-settings');

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  setupEventListeners();
  await initTheme();
});

async function initTheme() {
  const result = await chrome.storage.local.get('bookmark_manager_theme');
  const theme = result.bookmark_manager_theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeSwitch(theme);
}

function updateThemeSwitch(theme) {
  const themeSwitch = document.getElementById('theme-switch');
  const themeIcon = document.getElementById('theme-icon');
  
  if (theme === 'dark') {
    themeSwitch.classList.add('active');
    themeIcon.textContent = '☀️';
  } else {
    themeSwitch.classList.remove('active');
    themeIcon.textContent = '🌙';
  }
}

async function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  await chrome.storage.local.set({ bookmark_manager_theme: newTheme });
  updateThemeSwitch(newTheme);
}

async function loadStats() {
  try {
    const tree = await chrome.bookmarks.getTree();
    const stats = countBookmarks(tree);
    bookmarkCountEl.textContent = stats.bookmarkCount;
    folderCountEl.textContent = stats.folderCount;
  } catch (error) {
    console.error('加载统计信息失败:', error);
    bookmarkCountEl.textContent = '-';
    folderCountEl.textContent = '-';
  }
}

function countBookmarks(tree) {
  let bookmarkCount = 0;
  let folderCount = 0;

  function traverse(nodes) {
    nodes.forEach(node => {
      if (node.url) {
        bookmarkCount++;
      } else {
        if (node.id !== '0') {
          folderCount++;
        }
      }
      
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(tree);
  return { bookmarkCount, folderCount };
}

function setupEventListeners() {
  btnOpenSidebar.addEventListener('click', async () => {
    try {
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      window.close();
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      openManager();
    }
  });

  btnOpenManager.addEventListener('click', () => {
    openManager();
  });

  btnAddCurrent.addEventListener('click', async () => {
    await addCurrentPage();
  });

  btnSettings.addEventListener('click', () => {
    openSettings();
  });

  // 主题切换
  document.getElementById('theme-switch').addEventListener('click', toggleTheme);
}

function openManager() {
  const managerUrl = chrome.runtime.getURL('manager/manager.html');
  chrome.tabs.create({ url: managerUrl });
  window.close();
}

function openSettings() {
  const settingsUrl = chrome.runtime.getURL('manager/settings.html');
  chrome.tabs.create({ url: settingsUrl });
  window.close();
}

async function addCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      alert('无法获取当前页面信息');
      return;
    }

    const existing = await chrome.bookmarks.search({ url: tab.url });
    if (existing.length > 0) {
      if (!confirm('该书签已存在，是否继续添加？')) {
        return;
      }
    }

    await chrome.bookmarks.create({
      parentId: '1',
      title: tab.title,
      url: tab.url
    });

    showToast('书签添加成功！');
    await loadStats();
  } catch (error) {
    console.error('添加书签失败:', error);
    alert('添加书签失败: ' + error.message);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #10b981;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10000;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}
