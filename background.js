/**
 * Background Service Worker
 */

// 调试开关
const DEBUG = false;
const log = DEBUG ? console.log.bind(console) : () => {};
const error = console.error.bind(console);

// ============================================
// WebDAV 备份功能
// ============================================

class WebDAVClient {
  constructor(config) {
    this.config = config;
  }

  async request(method, path, body = null) {
    let baseUrl = this.config.url;
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
      'Depth': '1'
    };

    if (this.config.username && this.config.password) {
      const auth = btoa(`${this.config.username}:${this.config.password}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    };

    log('WebDAV request:', method, url.toString());
    
    try {
      const response = await fetch(url, options);
      log('WebDAV response:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`WebDAV error: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (err) {
      error('WebDAV request failed:', err);
      throw err;
    }
  }

  async ensureBookmarksFolder() {
    try {
      await this.request('PROPFIND', 'bookmarks/');
      log('Bookmarks folder exists');
    } catch (err) {
      if (err.message.includes('404')) {
        log('Creating bookmarks folder');
        await this.request('MKCOL', 'bookmarks/');
        log('Bookmarks folder created');
      } else {
        throw err;
      }
    }
  }

  async uploadBookmarks(data) {
    await this.ensureBookmarksFolder();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `bookmarks_backup_${timestamp}.json`;
    
    // 保存带时间戳的备份文件
    await this.request('PUT', `bookmarks/${backupFilename}`, data);
    
    // 同时保存一个固定的文件名用于恢复
    await this.request('PUT', 'bookmarks/bookmarks.json', data);
    
    return backupFilename;
  }

  async downloadBookmarks(filename = 'bookmarks.json') {
    try {
      await this.ensureBookmarksFolder();
      const response = await this.request('GET', `bookmarks/${filename}`);
      return response.json();
    } catch (err) {
      error('Download bookmarks failed:', err);
      throw err;
    }
  }
}

class BookmarkManager {
  static async getAllBookmarks() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree) => {
        resolve(tree);
      });
    });
  }

  static async clearAllBookmarks() {
    const removeChildren = async (parentId) => {
      const children = await new Promise((resolve) => {
        chrome.bookmarks.getChildren(parentId, resolve);
      });
      
      for (const child of children) {
        await new Promise((resolve) => {
          chrome.bookmarks.removeTree(child.id, resolve);
        });
      }
    };
    
    await removeChildren('1');
    await removeChildren('2');
  }

  static async importBookmarks(bookmarks, merge = false) {
    if (!merge) {
      await this.clearAllBookmarks();
    }

    const importNode = async (parentId, node) => {
      if (node.url) {
        const children = await new Promise((res) => {
          chrome.bookmarks.getChildren(parentId, res);
        });
        const existingBookmark = children.find(child => child.url === node.url);
        
        if (!existingBookmark) {
          await new Promise((res) => {
            chrome.bookmarks.create({
              parentId,
              title: node.title,
              url: node.url
            }, res);
          });
        }
      } else if (node.children) {
        const children = await new Promise((res) => {
          chrome.bookmarks.getChildren(parentId, res);
        });
        const existingFolder = children.find(child => !child.url && child.title === node.title);
        
        if (existingFolder) {
          for (const child of node.children) {
            await importNode(existingFolder.id, child);
          }
        } else {
          const folder = await new Promise((res) => {
            chrome.bookmarks.create({
              parentId,
              title: node.title
            }, res);
          });
          for (const child of node.children) {
            await importNode(folder.id, child);
          }
        }
      }
    };

    // 处理空数据情况
    if (!bookmarks || bookmarks.length === 0) {
      console.log('No bookmarks to import');
      return;
    }

    const root = bookmarks[0];
    if (!root) {
      console.log('Root bookmark is null');
      return;
    }

    if (root.children) {
      for (const child of root.children) {
        // 支持 Chrome 数字 ID 和 Firefox GUID 格式
        if (child.id === '1' || child.id === 'toolbar_____') {
          for (const subChild of (child.children || [])) {
            await importNode('1', subChild);
          }
        } else if (child.id === '2' || child.id === 'unfiled_____') {
          for (const subChild of (child.children || [])) {
            await importNode('2', subChild);
          }
        } else if (child.id === 'menu________') {
          // Firefox 书签菜单，在 Chrome 中创建为普通文件夹
          for (const subChild of (child.children || [])) {
            await importNode('2', subChild);
          }
        }
      }
    }
  }
}

class SyncManager {
  constructor() {
    this.client = null;
  }

  async init() {
    const config = await this.loadConfig();
    if (config) {
      this.client = new WebDAVClient(config);
      this.setupAlarms();
    }
  }

  async loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get('webdavConfig', (result) => {
        resolve(result.webdavConfig);
      });
    });
  }

  setupAlarms() {
    chrome.storage.local.get('settings', (result) => {
      const settings = result.settings || {};
      if (settings.autoBackup && settings.backupInterval) {
        chrome.alarms.create('backup', {
          periodInMinutes: settings.backupInterval
        });
      }
    });
  }

  async backupBookmarks() {
    if (!this.client) {
      error('WebDAV client not initialized');
      return false;
    }

    try {
      const bookmarks = await BookmarkManager.getAllBookmarks();
      const tagsById = await this.getBookmarkTags();
      
      // 将 ID-based 标签转换为 URL-based 标签（用于跨设备恢复）
      const tagsByUrl = {};
      if (tagsById) {
        const flattenBookmarks = (nodes) => {
          const result = [];
          nodes.forEach(node => {
            if (node.url) {
              result.push(node);
            }
            if (node.children) {
              result.push(...flattenBookmarks(node.children));
            }
          });
          return result;
        };
        
        const allBookmarks = flattenBookmarks(bookmarks);
        allBookmarks.forEach(bookmark => {
          if (tagsById[bookmark.id] && tagsById[bookmark.id].length > 0) {
            tagsByUrl[bookmark.url] = tagsById[bookmark.id];
          }
        });
      }
      
      // 获取标签分组数据
      const tagGroups = await this.getTagGroups();
      
      const data = {
        version: '1.3',
        timestamp: new Date().toISOString(),
        bookmarks,
        tagsByUrl: tagsByUrl || {},
        tagGroups: tagGroups || { groups: [] }
      };
      const filename = await this.client.uploadBookmarks(data);
      log('Bookmarks backed up successfully:', filename);
      return { success: true, filename };
    } catch (err) {
      error('Backup failed:', err);
      return { success: false, error: err.message };
    }
  }

  async restoreBookmarks(filename, merge = false) {
    if (!this.client) {
      error('WebDAV client not initialized');
      return false;
    }

    try {
      const data = await this.client.downloadBookmarks(filename);
      const backupData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // 恢复书签
      await BookmarkManager.importBookmarks(backupData.bookmarks, merge);
      
      // 恢复标签数据（如果存在）
      if (backupData.tagsByUrl) {
        log('Restoring tags from backup (URL-based)');
        await this.restoreTagsByUrl(backupData.tagsByUrl, merge);
      } else if (backupData.tags) {
        // 兼容旧版本备份格式（ID-based，可能无法正确恢复）
        log('Restoring tags from backup (legacy ID-based format)');
        await this.restoreBookmarkTags(backupData.tags, merge);
      } else {
        log('No tags found in backup, skipping tag restore');
      }
      
      // 恢复标签分组（如果存在）
      if (backupData.tagGroups) {
        log('Restoring tag groups from backup');
        await this.restoreTagGroups(backupData.tagGroups, merge);
      } else {
        log('No tag groups found in backup, skipping');
      }
      
      log('Bookmarks restored successfully');
      
      // 通知所有标签页刷新书签数据
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'refreshBookmarks' });
        } catch (e) {}
      }
      
      return { success: true };
    } catch (err) {
      error('Restore failed:', err);
      return { success: false, error: err.message };
    }
  }

  async getBookmarkTags() {
    return new Promise((resolve) => {
      chrome.storage.local.get('bookmark_tags', (result) => {
        resolve(result.bookmark_tags);
      });
    });
  }

  async getTagGroups() {
    return new Promise((resolve) => {
      chrome.storage.local.get('tagGroups', (result) => {
        resolve(result.tagGroups || { groups: [] });
      });
    });
  }

  async restoreTagGroups(tagGroups, merge = false) {
    if (!tagGroups || !tagGroups.groups) return;
    
    if (!merge) {
      // 覆盖模式：直接设置
      await chrome.storage.local.set({ tagGroups });
    } else {
      // 合并模式：按名称合并分组
      const existing = await this.getTagGroups();
      const mergedGroups = [...(existing.groups || [])];
      
      for (const importedGroup of tagGroups.groups) {
        const existingIndex = mergedGroups.findIndex(g => g.name === importedGroup.name);
        if (existingIndex >= 0) {
          // 合并标签到现有分组
          const mergedTags = [...new Set([...mergedGroups[existingIndex].tags, ...importedGroup.tags])];
          mergedGroups[existingIndex].tags = mergedTags;
        } else {
          // 添加新分组
          mergedGroups.push(importedGroup);
        }
      }
      
      await chrome.storage.local.set({ tagGroups: { groups: mergedGroups } });
    }
  }

  async restoreBookmarkTags(tags, merge = false) {
    if (!merge) {
      // 覆盖模式：直接设置
      await chrome.storage.local.set({ bookmark_tags: tags });
    } else {
      // 合并模式：合并现有标签
      const existing = await this.getBookmarkTags();
      const merged = {
        ...(existing || {}),
        ...tags
      };
      await chrome.storage.local.set({ bookmark_tags: merged });
    }
  }

  async restoreTagsByUrl(tagsByUrl, merge = false) {
    // 获取当前所有书签，建立 URL -> ID 的映射
    const bookmarks = await BookmarkManager.getAllBookmarks();
    const urlToId = {};
    
    const flattenBookmarks = (nodes) => {
      nodes.forEach(node => {
        if (node.url) {
          urlToId[node.url] = node.id;
        }
        if (node.children) {
          flattenBookmarks(node.children);
        }
      });
    };
    
    flattenBookmarks(bookmarks);
    
    // 将 URL-based 标签转换为 ID-based 标签
    const tagsById = {};
    for (const [url, tags] of Object.entries(tagsByUrl)) {
      if (urlToId[url]) {
        tagsById[urlToId[url]] = tags;
      }
    }
    
    if (!merge) {
      // 覆盖模式：直接设置
      await chrome.storage.local.set({ bookmark_tags: tagsById });
    } else {
      // 合并模式：合并现有标签
      const existing = await this.getBookmarkTags();
      const merged = {
        ...(existing || {}),
        ...tagsById
      };
      await chrome.storage.local.set({ bookmark_tags: merged });
    }
    
    log(`Restored tags for ${Object.keys(tagsById).length} bookmarks`);
  }
}

const syncManager = new SyncManager();

// ============================================
// 事件监听
// ============================================

// 安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    log('Bookmark Manager 已安装');
    
    chrome.storage.local.set({
      theme: 'light',
      autoBackup: false,
      backupInterval: 60,
      backupOnStartup: false
    });
  }
});

// 监听 alarm（用于自动备份）
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'backup') {
    syncManager.backupBookmarks();
  }
});

// 监听启动事件
chrome.runtime.onStartup.addListener(async () => {
  const settings = await syncManager.loadConfig();
  if (settings && settings.autoBackupOnStartup) {
    syncManager.backupBookmarks();
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('Received message:', message);
  
  switch (message.action) {
    case 'backup':
      syncManager.backupBookmarks().then((result) => {
        sendResponse(result);
      });
      return true;
      
    case 'restore':
      syncManager.restoreBookmarks(message.filename, message.merge).then((result) => {
        sendResponse(result);
      });
      return true;
      
    case 'init':
      syncManager.init().then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'testWebDAV':
      const client = new WebDAVClient(message.config);
      client.ensureBookmarksFolder().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// 初始化
syncManager.init();

// ============================================
// 扩展图标点击事件 - 打开侧边栏
// ============================================

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    log('Side panel opened via action click');
  } catch (err) {
    error('Failed to open side panel:', err);
  }
});

// ============================================
// 书签变动监听 - 同步标签数据
// ============================================

// 监听书签变更
chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
  // URL 变更时，保留标签（标签数据与书签 ID 关联，自动保留）
  if (changeInfo.url) {
    log('Bookmark URL changed, tags preserved automatically:', id);
  }
});

// 监听书签删除
chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
  // 书签删除时，通过消息通知清理标签数据
  chrome.runtime.sendMessage({
    action: 'cleanBookmarkTags',
    bookmarkId: id
  }).catch(() => {
    // 忽略错误（可能在非活动页面）
  });
  log('Bookmark removed, tags will be cleaned:', id);
});

// 监听书签创建
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  // 新书签创建时，标签默认为空
  log('Bookmark created:', id);
});

// 监听书签移动
chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
  // 书签移动文件夹时，标签保持不变
  log('Bookmark moved, tags preserved:', id);
});
