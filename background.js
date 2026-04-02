/**
 * Background Service Worker
 */

// 调试开关
const DEBUG = false;
const log = DEBUG ? console.log.bind(console) : () => {};
const error = console.error.bind(console);

// ============================================
// Storage 工具
// ============================================

const Storage = {
  get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  },

  set(items) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

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

  async listBackups() {
    try {
      await this.ensureBookmarksFolder();
      const response = await this.request('PROPFIND', 'bookmarks/');
      const text = await response.text();
      return this.parsePropfindResponse(text);
    } catch (err) {
      error('List backups failed:', err);
      throw err;
    }
  }

  parsePropfindResponse(xmlText) {
    const backups = [];
    const responseRegex = /<D:response[\s\S]*?<\/D:response>/gi;
    const matches = xmlText.match(responseRegex) || [];

    matches.forEach(responseXml => {
      const hrefMatch = responseXml.match(/<D:href>([^<]+)<\/D:href>/i);
      const displayNameMatch = responseXml.match(/<D:displayname>([^<]+)<\/D:displayname>/i);
      const lastModifiedMatch = responseXml.match(/<D:getlastmodified>([^<]+)<\/D:getlastmodified>/i);
      const contentLengthMatch = responseXml.match(/<D:getcontentlength>([^<]+)<\/D:getcontentlength>/i);

      const href = hrefMatch ? hrefMatch[1] : '';
      const displayName = displayNameMatch ? displayNameMatch[1] : '';

      if (href && displayName && displayName.startsWith('bookmarks_backup_') && displayName.endsWith('.json')) {
        backups.push({
          filename: displayName,
          href: href,
          lastModified: lastModifiedMatch ? lastModifiedMatch[1] : '',
          size: contentLengthMatch ? parseInt(contentLengthMatch[1]) : 0
        });
      }
    });

    backups.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    return backups;
  }

  async deleteBackup(filename) {
    try {
      await this.request('DELETE', `bookmarks/${filename}`);
      log('Backup deleted:', filename);
      return { success: true };
    } catch (err) {
      error('Delete backup failed:', err);
      throw err;
    }
  }

  async cleanupOldBackups(keepCount = 3) {
    try {
      const backups = await this.listBackups();
      if (backups.length <= keepCount) {
        return { cleaned: 0 };
      }

      const toDelete = backups.slice(keepCount);
      let cleaned = 0;

      for (const backup of toDelete) {
        try {
          await this.deleteBackup(backup.filename);
          cleaned++;
        } catch (e) {
          log('Failed to delete backup:', backup.filename, e);
        }
      }

      return { cleaned };
    } catch (err) {
      error('Cleanup old backups failed:', err);
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

  static async deleteNodeWithTrashCheck(nodeId, isFolder = false) {
    const deleteMethod = isFolder ? 'removeTree' : 'remove';
    
    return new Promise((resolve) => {
      chrome.bookmarks[deleteMethod](nodeId, () => {
        resolve();
      });
    });
  }

  static async clearAllBookmarks() {
    // 获取完整的书签树（包括回收站）
    const fullTree = await this.getAllBookmarks();
    const rootNode = fullTree[0];

    if (!rootNode || !rootNode.children) {
      log('No bookmarks to clear');
      return;
    }

    // 系统根节点：0 是根，1 是书签栏，2 是其他书签
    const systemNodeIds = ['0', '1', '2'];

    // 收集所有书签节点
    const allBookmarkNodes = [];

    const collectNodes = (node) => {
      if (!node) return;
      if (!systemNodeIds.includes(node.id)) {
        allBookmarkNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(collectNodes);
      }
    };

    rootNode.children.forEach(collectNodes);

    // 第一轮：尝试直接删除书签栏和其他书签的内容
    const toolbarChildren = await new Promise((resolve) => {
      chrome.bookmarks.getChildren('1', resolve);
    });
    const otherChildren = await new Promise((resolve) => {
      chrome.bookmarks.getChildren('2', resolve);
    });

    const deleteChildren = async (children) => {
      for (const child of children) {
        try {
          // 使用 removeTree 来尝试直接删除（某些浏览器会绕过回收站）
          await new Promise((resolve) => {
            chrome.bookmarks.removeTree(child.id, () => resolve());
          });
        } catch (e) {}
      }
    };

    await deleteChildren(toolbarChildren);
    await deleteChildren(otherChildren);

    // 等待一段时间让浏览器处理删除操作
    await new Promise(resolve => setTimeout(resolve, 500));

    // 第二轮：检查并清空回收站
    // 尝试查找回收站节点（ID 可能是 '3'，或者通过标题查找）
    const findTrashNode = (nodes) => {
      return nodes?.find(n => 
        n.id === '3' || 
        n.title === '回收站' || 
        n.title === 'Trash' ||
        n.title === '垃圾桶'
      );
    };

    const trashNode = findTrashNode(rootNode.children);
    
    if (trashNode) {
      log('Found trash node, attempting to clear it:', trashNode.id);
      
      // 循环删除回收站内容，直到清空为止
      let trashCleared = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!trashCleared && attempts < maxAttempts) {
        const trashChildren = await new Promise((resolve) => {
          chrome.bookmarks.getChildren(trashNode.id, resolve);
        });

        if (trashChildren.length === 0) {
          trashCleared = true;
          break;
        }

        for (const child of trashChildren) {
          try {
            await new Promise((resolve) => {
              chrome.bookmarks.removeTree(child.id, () => resolve());
            });
          } catch (e) {}
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    log('clearAllBookmarks completed');
  }

  static async importBookmarks(bookmarks, merge = false) {
    if (!merge) {
      // 覆盖模式：先清除所有书签和标签
      await this.clearAllBookmarks();
      // 同时清除标签存储
      await chrome.storage.local.set({ bookmark_tags: {} });
    }

    const importNode = async (parentId, node) => {
      if (node.url) {
        if (merge) {
          // 合并模式：检查是否已存在
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
        } else {
          // 覆盖模式：直接创建，不检查
          await new Promise((res) => {
            chrome.bookmarks.create({
              parentId,
              title: node.title,
              url: node.url
            }, res);
          });
        }
      } else if (node.children) {
        if (merge) {
          // 合并模式：检查文件夹是否已存在
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
        } else {
          // 覆盖模式：直接创建文件夹
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
      if (tagsById && Object.keys(tagsById).length > 0) {
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

      // 获取捷径数据
      const shortcutsResult = await Storage.get('shortcuts');
      const shortcuts = shortcutsResult.shortcuts || [];
      
      const data = {
        version: '1.5',
        timestamp: new Date().toISOString(),
        bookmarks,
        tagsByUrl: tagsByUrl || {},
        tagGroups: tagGroups || { groups: [] },
        shortcuts: shortcuts
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

      // 恢复捷径数据（如果存在）
      if (backupData.shortcuts && Array.isArray(backupData.shortcuts)) {
        log('Restoring shortcuts from backup');
        await Storage.set({ shortcuts: backupData.shortcuts });
      } else {
        log('No shortcuts found in backup, skipping');
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

  async listBackups() {
    if (!this.client) {
      error('WebDAV client not initialized');
      throw new Error('WebDAV not configured');
    }
    return await this.client.listBackups();
  }

  async deleteBackup(filename) {
    if (!this.client) {
      error('WebDAV client not initialized');
      throw new Error('WebDAV not configured');
    }
    return await this.client.deleteBackup(filename);
  }

  async cleanupOldBackups(keepCount = 3) {
    if (!this.client) {
      error('WebDAV client not initialized');
      throw new Error('WebDAV not configured');
    }
    return await this.client.cleanupOldBackups(keepCount);
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
    // 等待一段时间确保书签已完全创建
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 获取当前所有书签，建立 URL -> ID 的映射
    // 注意：不能使用 getAllBookmarks()，因为它会包含回收站中的书签
    const urlToId = {};
    
    const buildUrlToId = (nodes) => {
      if (!nodes) return;
      nodes.forEach(node => {
        if (node.url) {
          const normalizedUrl = node.url.replace(/\:$/, '');
          urlToId[normalizedUrl] = node.id;
          urlToId[node.url] = node.id;
        }
        if (node.children) {
          buildUrlToId(node.children);
        }
      });
    };
    
    // 只获取书签栏和其他书签，不包括回收站
    const toolbarBookmarks = await new Promise((resolve) => {
      chrome.bookmarks.getSubTree('1', resolve);
    });
    const otherBookmarks = await new Promise((resolve) => {
      chrome.bookmarks.getSubTree('2', resolve);
    });
    
    buildUrlToId(toolbarBookmarks);
    buildUrlToId(otherBookmarks);
    
    // 将 URL-based 标签转换为 ID-based 标签
    const tagsById = {};
    for (const [url, tags] of Object.entries(tagsByUrl)) {
      const normalizedUrl = url.replace(/\:$/, '');
      const matchedId = urlToId[url] || urlToId[normalizedUrl];
      if (matchedId) {
        tagsById[matchedId] = tags;
      }
    }
    
    if (!merge) {
      await chrome.storage.local.set({ bookmark_tags: {} });
      await chrome.storage.local.set({ bookmark_tags: tagsById });
    } else {
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
      syncManager.backupBookmarks().then(async (result) => {
        if (result.success) {
          log('Backup successful, checking autoCleanup setting...');
          const settings = await Storage.get('backupSettings');
          log('Backup settings:', settings);
          const autoCleanup = settings?.backupSettings?.autoCleanup || settings?.autoCleanup || false;
          log('autoCleanup value:', autoCleanup);
          if (autoCleanup) {
            log('Starting auto cleanup...');
            try {
              const cleanupResult = await syncManager.cleanupOldBackups(3);
              log('Auto cleanup completed:', cleanupResult);
            } catch (cleanupError) {
              log('Auto cleanup error:', cleanupError);
            }
          } else {
            log('Auto cleanup is disabled');
          }
        }
        sendResponse(result);
      });
      return true;
      
    case 'restore':
      syncManager.restoreBookmarks(message.filename, message.merge).then((result) => {
        sendResponse(result);
      });
      return true;

    case 'restoreBackup':
      syncManager.restoreBookmarks(message.filename, message.merge).then(async (result) => {
        if (result.success) {
          const settings = await Storage.get('backupSettings');
          const autoCleanup = settings?.backupSettings?.autoCleanup || settings?.autoCleanup || false;
          if (autoCleanup) {
            const cleanupResult = await syncManager.cleanupOldBackups(3);
            log('Auto cleanup result:', cleanupResult);
          }
        }
        sendResponse(result);
      });
      return true;

    case 'listBackups':
      syncManager.listBackups().then((result) => {
        sendResponse(result);
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'deleteBackup':
      syncManager.deleteBackup(message.filename).then((result) => {
        sendResponse(result);
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
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
