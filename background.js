/**
 * Background Service Worker
 */

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

    console.log('WebDAV request:', method, url.toString());
    
    try {
      const response = await fetch(url, options);
      console.log('WebDAV response:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`WebDAV error: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error('WebDAV request failed:', error);
      throw error;
    }
  }

  async ensureBookmarksFolder() {
    try {
      await this.request('PROPFIND', 'bookmarks/');
      console.log('Bookmarks folder exists');
    } catch (error) {
      if (error.message.includes('404')) {
        console.log('Creating bookmarks folder');
        await this.request('MKCOL', 'bookmarks/');
        console.log('Bookmarks folder created');
      } else {
        throw error;
      }
    }
  }

  async uploadBookmarks(bookmarks) {
    await this.ensureBookmarksFolder();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bookmarks_backup_${timestamp}.json`;
    
    const data = {
      bookmarks,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    await this.request('PUT', `bookmarks/${filename}`, data);
    return filename;
  }

  async downloadBookmarks(filename = 'bookmarks.json') {
    try {
      await this.ensureBookmarksFolder();
      const response = await this.request('GET', `bookmarks/${filename}`);
      return response.json();
    } catch (error) {
      console.error('Download bookmarks failed:', error);
      throw error;
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
    return new Promise((resolve) => {
      const promises = [];

      chrome.bookmarks.getChildren('1', (children) => {
        children.forEach(child => {
          promises.push(new Promise((res) => {
            chrome.bookmarks.removeTree(child.id, res);
          }));
        });

        chrome.bookmarks.getChildren('2', (children) => {
          children.forEach(child => {
            promises.push(new Promise((res) => {
              chrome.bookmarks.removeTree(child.id, res);
            }));
          });

          Promise.all(promises).then(resolve);
        });
      });
    });
  }

  static async importBookmarks(bookmarks, merge = false) {
    if (!merge) {
      await this.clearAllBookmarks();
    }

    return new Promise((resolve) => {
      const importNode = async (parentId, node) => {
        if (node.url) {
          const children = await new Promise((res) => {
            chrome.bookmarks.getChildren(parentId, res);
          });
          const existingBookmark = children.find(child => child.url === node.url);
          
          if (!existingBookmark) {
            chrome.bookmarks.create({
              parentId,
              title: node.title,
              url: node.url
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
            chrome.bookmarks.create({
              parentId,
              title: node.title
            }, (folder) => {
              node.children.forEach(child => {
                importNode(folder.id, child);
              });
            });
          }
        }
      };

      const root = bookmarks[0];
      if (root.children) {
        root.children.forEach(child => {
          if (child.id === '1') {
            child.children?.forEach(subChild => {
              importNode('1', subChild);
            });
          } else if (child.id === '2') {
            child.children?.forEach(subChild => {
              importNode('2', subChild);
            });
          }
        });
      }

      setTimeout(resolve, 1000);
    });
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
      console.error('WebDAV client not initialized');
      return false;
    }

    try {
      const bookmarks = await BookmarkManager.getAllBookmarks();
      const filename = await this.client.uploadBookmarks(bookmarks);
      console.log('Bookmarks backed up successfully:', filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  async restoreBookmarks(filename, merge = false) {
    if (!this.client) {
      console.error('WebDAV client not initialized');
      return false;
    }

    try {
      const data = await this.client.downloadBookmarks(filename);
      await BookmarkManager.importBookmarks(data.bookmarks, merge);
      console.log('Bookmarks restored successfully');
      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const syncManager = new SyncManager();

// ============================================
// 事件监听
// ============================================

// 安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Bookmark Manager 已安装');
    
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
  console.log('Received message:', message);
  
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
    console.log('Side panel opened via action click');
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
});
