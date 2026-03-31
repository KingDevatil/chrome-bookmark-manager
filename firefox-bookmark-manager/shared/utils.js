/**
 * Firefox Bookmark Manager - 公共工具函数
 */

// ============================================
// 主题管理
// ============================================

const ThemeManager = {
  STORAGE_KEY: 'bookmark_manager_theme',

  /**
   * 初始化主题
   */
  async init() {
    await this.loadTheme();
    this.setupThemeToggle();
  },

  /**
   * 加载保存的主题设置
   */
  async loadTheme() {
    const result = await Storage.get(this.STORAGE_KEY);
    const theme = result[this.STORAGE_KEY] || 'light';
    this.setTheme(theme);
  },

  /**
   * 设置主题
   * @param {string} theme - 'light' 或 'dark'
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.set({ [this.STORAGE_KEY]: theme });
  },
  
  /**
   * 切换主题
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },
  
  /**
   * 设置主题切换按钮
   */
  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }
};

// ============================================
// 存储操作封装 (Firefox browser.* API)
// ============================================

const Storage = {
  /**
   * 获取存储数据
   * @param {string|Array|Object} keys - 要获取的键
   * @returns {Promise<Object>}
   */
  async get(keys) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.storage.local.get(keys);
  },
  
  /**
   * 设置存储数据
   * @param {Object} items - 要存储的键值对
   * @returns {Promise<void>}
   */
  async set(items) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    await browser.storage.local.set(items);
  },
  
  /**
   * 移除存储数据
   * @param {string|Array} keys - 要移除的键
   * @returns {Promise<void>}
   */
  async remove(keys) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    await browser.storage.local.remove(keys);
  },
  
  /**
   * 清空所有存储数据
   * @returns {Promise<void>}
   */
  async clear() {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    await browser.storage.local.clear();
  }
};

// ============================================
// DOM 操作工具
// ============================================

const DOM = {
  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} options - 选项
   * @returns {HTMLElement}
   */
  create(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
      element.className = options.className;
    }
    
    if (options.id) {
      element.id = options.id;
    }
    
    if (options.text) {
      element.textContent = options.text;
    }
    
    if (options.html) {
      element.innerHTML = options.html;
    }
    
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }
    
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    
    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    
    return element;
  },
  
  /**
   * 查找元素
   * @param {string} selector - CSS 选择器
   * @param {HTMLElement} context - 上下文元素
   * @returns {HTMLElement|null}
   */
  $(selector, context = document) {
    return context.querySelector(selector);
  },
  
  /**
   * 查找所有匹配元素
   * @param {string} selector - CSS 选择器
   * @param {HTMLElement} context - 上下文元素
   * @returns {NodeList}
   */
  $$(selector, context = document) {
    return context.querySelectorAll(selector);
  },
  
  /**
   * 显示元素
   * @param {HTMLElement} element
   */
  show(element) {
    element.style.display = '';
  },
  
  /**
   * 隐藏元素
   * @param {HTMLElement} element
   */
  hide(element) {
    element.style.display = 'none';
  },
  
  /**
   * 切换元素显示状态
   * @param {HTMLElement} element
   */
  toggle(element) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  },
  
  /**
   * 添加类名
   * @param {HTMLElement} element
   * @param {string} className
   */
  addClass(element, className) {
    element.classList.add(className);
  },
  
  /**
   * 移除类名
   * @param {HTMLElement} element
   * @param {string} className
   */
  removeClass(element, className) {
    element.classList.remove(className);
  },
  
  /**
   * 切换类名
   * @param {HTMLElement} element
   * @param {string} className
   */
  toggleClass(element, className) {
    element.classList.toggle(className);
  },
  
  /**
   * 检查是否包含类名
   * @param {HTMLElement} element
   * @param {string} className
   * @returns {boolean}
   */
  hasClass(element, className) {
    return element.classList.contains(className);
  }
};

// ============================================
// 书签操作工具 (Firefox browser.* API)
// ============================================

const BookmarkUtils = {
  /**
   * 获取所有书签树
   * @returns {Promise<Array>}
   */
  async getTree() {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.getTree();
  },
  
  /**
   * 获取指定文件夹下的书签
   * @param {string} parentId - 父文件夹 ID
   * @returns {Promise<Array>}
   */
  async getChildren(parentId) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.getChildren(parentId);
  },
  
  /**
   * 搜索书签
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array>}
   */
  async search(query) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.search(query);
  },
  
  /**
   * 创建书签
   * @param {Object} bookmark - 书签对象
   * @returns {Promise<Object>}
   */
  async create(bookmark) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.create(bookmark);
  },
  
  /**
   * 更新书签
   * @param {string} id - 书签 ID
   * @param {Object} changes - 更改内容
   * @returns {Promise<Object>}
   */
  async update(id, changes) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.update(id, changes);
  },
  
  /**
   * 移动书签
   * @param {string} id - 书签 ID
   * @param {Object} destination - 目标位置
   * @returns {Promise<Object>}
   */
  async move(id, destination) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    return await browser.bookmarks.move(id, destination);
  },
  
  /**
   * 删除书签
   * @param {string} id - 书签 ID
   * @returns {Promise<void>}
   */
  async remove(id) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    await browser.bookmarks.remove(id);
  },
  
  /**
   * 删除书签树（文件夹）
   * @param {string} id - 文件夹 ID
   * @returns {Promise<void>}
   */
  async removeTree(id) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    await browser.bookmarks.removeTree(id);
  },
  
  /**
   * 获取书签的收藏夹图标 URL
   * @param {string} url - 网页 URL
   * @returns {string}
   */
  getFaviconUrl(url) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
  },
  
  /**
   * 扁平化书签树
   * @param {Array} tree - 书签树
   * @returns {Array}
   */
  flatten(tree) {
    const result = [];
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    
    traverse(tree);
    return result;
  },
  
  /**
   * 获取文件夹路径
   * @param {string} id - 书签 ID
   * @returns {Promise<Array>}
   */
  async getPath(id) {
    // 确保 browser 对象存在
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      window.browser = chrome;
    }
    
    const path = [];
    let currentId = id;
    
    while (currentId) {
      const results = await browser.bookmarks.get(currentId);
      const node = results[0];
      
      if (node) {
        path.unshift(node);
        currentId = node.parentId;
      } else {
        break;
      }
    }
    
    return path;
  }
};

// ============================================
// 工具函数
// ============================================

const Utils = {
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function}
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * 格式化日期
   * @param {number} timestamp - 时间戳
   * @returns {string}
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * 复制到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  },
  
  /**
   * 生成唯一ID
   * @returns {string}
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  /**
   * 下载JSON文件
   * @param {Object} data - 数据对象
   * @param {string} filename - 文件名
   */
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// ============================================
// 常用文件夹配置管理
// ============================================

const FrequentlyUsedConfig = {
  STORAGE_KEY: 'bookmark_manager_frequently_used_config',
  
  // 默认配置
  DEFAULT_CONFIG: {
    enabled: false,           // 是否启用
    daysRange: 7,            // 统计时间范围（天）
    displayCount: 10,        // 展示数量
    blacklist: [],           // 黑名单域名列表
    pinned: []               // 置顶的 URL 列表
  },
  
  /**
   * 获取配置
   * @returns {Promise<Object>} 配置对象
   */
  async getConfig() {
    try {
      const result = await Storage.get(this.STORAGE_KEY);
      const config = result[this.STORAGE_KEY] || { ...this.DEFAULT_CONFIG };
      
      // 确保所有字段都存在
      return {
        ...this.DEFAULT_CONFIG,
        ...config
      };
    } catch (error) {
      console.error('获取配置失败:', error);
      return { ...this.DEFAULT_CONFIG };
    }
  },
  
  /**
   * 保存配置
   * @param {Object} config - 配置对象
   */
  async saveConfig(config) {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = {
        ...currentConfig,
        ...config
      };
      
      await Storage.set({
        [this.STORAGE_KEY]: newConfig
      });
      
      return newConfig;
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  },
  
  /**
   * 更新单个配置项
   * @param {string} key - 配置项名称
   * @param {any} value - 配置值
   */
  async updateConfig(key, value) {
    return await this.saveConfig({ [key]: value });
  },
  
  /**
   * 添加到黑名单
   * @param {string} domain - 域名
   */
  async addToBlacklist(domain) {
    const config = await this.getConfig();
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    
    if (!config.blacklist.includes(normalizedDomain)) {
      config.blacklist.push(normalizedDomain);
      await this.saveConfig(config);
    }
  },
  
  /**
   * 从黑名单移除
   * @param {string} domain - 域名
   */
  async removeFromBlacklist(domain) {
    const config = await this.getConfig();
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    
    config.blacklist = config.blacklist.filter(d => d !== normalizedDomain);
    await this.saveConfig(config);
  },
  
  /**
   * 检查域名是否在黑名单中
   * @param {string} domain - 域名
   * @returns {Promise<boolean>}
   */
  async isInBlacklist(domain) {
    const config = await this.getConfig();
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    return config.blacklist.includes(normalizedDomain);
  },
  
  /**
   * 置顶链接
   * @param {string} url - 要置顶的 URL
   * @param {string} title - 链接标题（可选）
   */
  async pinUrl(url, title = '') {
    const config = await this.getConfig();
    if (!config.pinned) {
      config.pinned = [];
    }
    
    // 检查是否已存在（兼容字符串或对象格式）
    const exists = config.pinned.some(item => {
      const itemUrl = typeof item === 'string' ? item : item.url;
      return itemUrl === url;
    });
    if (!exists) {
      config.pinned.push({
        url: url,
        title: title || url
      });
      await this.saveConfig(config);
    }
  },
  
  /**
   * 取消置顶
   * @param {string} url - 要取消置顶的 URL
   */
  async unpinUrl(url) {
    const config = await this.getConfig();
    if (config.pinned) {
      // 兼容字符串或对象格式
      config.pinned = config.pinned.filter(item => {
        const itemUrl = typeof item === 'string' ? item : item.url;
        return itemUrl !== url;
      });
      await this.saveConfig(config);
    }
  },
  
  /**
   * 检查是否已置顶
   * @param {string} url - 要检查的 URL
   * @returns {Promise<boolean>}
   */
  async isPinned(url) {
    const config = await this.getConfig();
    if (!config.pinned) return false;
    // 兼容字符串或对象格式
    return config.pinned.some(item => 
      (typeof item === 'string' ? item : item.url) === url
    );
  },
  
  /**
   * 获取所有置顶链接（返回 URL 数组）
   * @returns {Promise<string[]>}
   */
  async getPinnedUrls() {
    const config = await this.getConfig();
    if (!config.pinned) return [];
    return config.pinned.map(item => 
      typeof item === 'string' ? item : item.url
    );
  },

  /**
   * 获取所有置顶项（返回对象数组）
   * @returns {Promise<Array<{url: string, title: string}>>}
   */
  async getPinnedItems() {
    const config = await this.getConfig();
    if (!config.pinned) return [];
    return config.pinned.map(item => {
      if (typeof item === 'string') {
        return { url: item, title: item };
      }
      return { url: item.url, title: item.title || item.url };
    });
  },
  
  /**
   * 重置为默认配置
   */
  async resetConfig() {
    await Storage.set({
      [this.STORAGE_KEY]: this.DEFAULT_CONFIG
    });
    return this.DEFAULT_CONFIG;
  }
};

// ============================================
// 导出模块（如果在模块环境中）
// ============================================

const BookmarkTags = {
  STORAGE_KEY: 'bookmark_tags',

  async getAll() {
    const result = await Storage.get(this.STORAGE_KEY);
    return result[this.STORAGE_KEY] || {};
  },

  async getTags(bookmarkId) {
    const allTags = await this.getAll();
    return allTags[bookmarkId] || [];
  },

  async setTags(bookmarkId, tags) {
    const allTags = await this.getAll();
    allTags[bookmarkId] = tags;
    await Storage.set({ [this.STORAGE_KEY]: allTags });
  },

  async addTag(bookmarkId, tag) {
    const tags = await this.getTags(bookmarkId);
    if (!tags.includes(tag)) {
      tags.push(tag);
      await this.setTags(bookmarkId, tags);
    }
  },

  async removeTag(bookmarkId, tag) {
    const tags = await this.getTags(bookmarkId);
    const filteredTags = tags.filter(t => t !== tag);
    await this.setTags(bookmarkId, filteredTags);
  },

  async removeTags(bookmarkId) {
    const allTags = await this.getAll();
    delete allTags[bookmarkId];
    await Storage.set({ [this.STORAGE_KEY]: allTags });
  },

  async preserveTags(bookmarkId) {
    const tags = await this.getTags(bookmarkId);
    await this.removeTags(bookmarkId);
    return tags;
  },

  async getAllTags() {
    const allTags = await this.getAll();
    const tagSet = new Set();
    Object.values(allTags).forEach(tags => {
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  },

  async searchByTag(tag) {
    const allTags = await this.getAll();
    const bookmarkIds = [];
    Object.entries(allTags).forEach(([bookmarkId, tags]) => {
      if (tags.includes(tag)) {
        bookmarkIds.push(bookmarkId);
      }
    });
    return bookmarkIds;
  },

  /**
   * 搜索标签（完整匹配标签名）
   * @param {string} query - 搜索关键词
   * @returns {Promise<string[]>} 匹配的书签ID数组
   */
  async searchTags(query) {
    if (!query) return [];
    const allTags = await this.getAll();
    const bookmarkIds = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(allTags).forEach(([bookmarkId, tags]) => {
      // 检查是否有任何标签完整匹配查询字符串
      const hasMatch = tags.some(tag => tag.toLowerCase() === lowerQuery);
      if (hasMatch) {
        bookmarkIds.push(bookmarkId);
      }
    });
    return bookmarkIds;
  },

  /**
   * 模糊搜索标签（标签名包含查询字符串）
   * @param {string} query - 搜索关键词
   * @returns {Promise<string[]>} 匹配的书签ID数组
   */
  async fuzzySearchTags(query) {
    if (!query) return [];
    const allTags = await this.getAll();
    const bookmarkIds = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(allTags).forEach(([bookmarkId, tags]) => {
      // 检查是否有任何标签包含查询字符串
      const hasMatch = tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      if (hasMatch) {
        bookmarkIds.push(bookmarkId);
      }
    });
    return bookmarkIds;
  },

  async detectOrphanedTags() {
    const allTags = await this.getAll();
    const orphaned = {};
    
    for (const [bookmarkId, tags] of Object.entries(allTags)) {
      try {
        const bookmarks = await browser.bookmarks.get(bookmarkId);
        
        if (!bookmarks || bookmarks.length === 0) {
          orphaned[bookmarkId] = tags;
        }
      } catch (error) {
        if (error.message && error.message.includes('No bookmark with id')) {
          orphaned[bookmarkId] = tags;
        }
      }
    }
    
    return orphaned;
  },

  async cleanOrphanedTags() {
    const orphaned = await this.detectOrphanedTags();
    const orphanedIds = Object.keys(orphaned);
    
    if (orphanedIds.length > 0) {
      const allTags = await this.getAll();
      orphanedIds.forEach(id => {
        delete allTags[id];
      });
      await Storage.set({ [this.STORAGE_KEY]: allTags });
    }
    
    return {
      cleaned: orphanedIds.length,
      orphanedDetails: orphaned
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    Storage,
    DOM,
    BookmarkUtils,
    Utils,
    FrequentlyUsedConfig,
    BookmarkTags,
    TagGroups
  };
}

/**
 * 标签分组管理
 */
const TagGroups = {
  STORAGE_KEY: 'tagGroups',
  
  /**
   * 获取所有分组
   * @returns {Promise<{groups: Array}>}
   */
  async getAll() {
    const result = await Storage.get(this.STORAGE_KEY);
    return result[this.STORAGE_KEY] || { groups: [] };
  },
  
  /**
   * 保存分组
   * @param {Array} groups - 分组数组
   */
  async save(groups) {
    await Storage.set({ [this.STORAGE_KEY]: { groups } });
  },
  
  /**
   * 创建分组
   * @param {string} name - 分组名称
   * @returns {Promise<Object>} 新创建的分组
   */
  async createGroup(name) {
    const data = await this.getAll();
    const newGroup = {
      id: 'group-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11),
      name: name,
      tags: []
    };
    data.groups.push(newGroup);
    await this.save(data.groups);
    return newGroup;
  },
  
  /**
   * 删除分组
   * @param {string} groupId - 分组ID
   */
  async deleteGroup(groupId) {
    const data = await this.getAll();
    data.groups = data.groups.filter(g => g.id !== groupId);
    await this.save(data.groups);
  },
  
  /**
   * 重命名分组
   * @param {string} groupId - 分组ID
   * @param {string} newName - 新名称
   */
  async renameGroup(groupId, newName) {
    const data = await this.getAll();
    const group = data.groups.find(g => g.id === groupId);
    if (group) {
      group.name = newName;
      await this.save(data.groups);
    }
  },
  
  /**
   * 添加标签到分组
   * @param {string} groupId - 分组ID
   * @param {string} tag - 标签名
   */
  async addTagToGroup(groupId, tag) {
    const data = await this.getAll();
    const group = data.groups.find(g => g.id === groupId);
    if (group && !group.tags.includes(tag)) {
      group.tags.push(tag);
      await this.save(data.groups);
    }
  },
  
  /**
   * 从分组移除标签
   * @param {string} groupId - 分组ID
   * @param {string} tag - 标签名
   */
  async removeTagFromGroup(groupId, tag) {
    const data = await this.getAll();
    const group = data.groups.find(g => g.id === groupId);
    if (group) {
      group.tags = group.tags.filter(t => t !== tag);
      await this.save(data.groups);
    }
  },
  
  /**
   * 获取未分组的标签
   * @param {string[]} allTags - 所有标签
   * @returns {Promise<string[]>} 未分组的标签
   */
  async getUngroupedTags(allTags) {
    const data = await this.getAll();
    const groupedTags = new Set();
    data.groups.forEach(group => {
      group.tags.forEach(tag => groupedTags.add(tag));
    });
    return allTags.filter(tag => !groupedTags.has(tag));
  },
  
  /**
   * 获取标签所在的分组
   * @param {string} tag - 标签名
   * @returns {Promise<Object|null>} 分组对象或null
   */
  async getTagGroup(tag) {
    const data = await this.getAll();
    for (const group of data.groups) {
      if (group.tags.includes(tag)) {
        return group;
      }
    }
    return null;
  },
  
  /**
   * 清空所有分组
   */
  async clearAll() {
    await Storage.remove(this.STORAGE_KEY);
  }
};
