/**
 * Chrome Bookmark Manager - 公共工具函数
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
// 存储操作封装
// ============================================

const Storage = {
  /**
   * 获取存储数据
   * @param {string|Array|Object} keys - 要获取的键
   * @returns {Promise<Object>}
   */
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * 设置存储数据
   * @param {Object} items - 要存储的键值对
   * @returns {Promise<void>}
   */
  set(items) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  },
  
  /**
   * 移除存储数据
   * @param {string|Array} keys - 要移除的键
   * @returns {Promise<void>}
   */
  remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  },
  
  /**
   * 清空所有存储数据
   * @returns {Promise<void>}
   */
  clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
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
// 书签操作工具
// ============================================

const BookmarkUtils = {
  /**
   * 获取所有书签树
   * @returns {Promise<Array>}
   */
  getTree() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree) => {
        resolve(tree);
      });
    });
  },
  
  /**
   * 获取指定文件夹下的书签
   * @param {string} parentId - 父文件夹ID
   * @returns {Promise<Array>}
   */
  getChildren(parentId) {
    return new Promise((resolve) => {
      chrome.bookmarks.getChildren(parentId, (children) => {
        resolve(children);
      });
    });
  },
  
  /**
   * 搜索书签
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array>}
   */
  search(query) {
    return new Promise((resolve) => {
      chrome.bookmarks.search(query, (results) => {
        resolve(results);
      });
    });
  },
  
  /**
   * 创建书签
   * @param {Object} bookmark - 书签对象
   * @returns {Promise<Object>}
   */
  create(bookmark) {
    return new Promise((resolve) => {
      chrome.bookmarks.create(bookmark, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * 更新书签
   * @param {string} id - 书签ID
   * @param {Object} changes - 更改内容
   * @returns {Promise<Object>}
   */
  update(id, changes) {
    return new Promise((resolve) => {
      chrome.bookmarks.update(id, changes, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * 移动书签
   * @param {string} id - 书签ID
   * @param {Object} destination - 目标位置
   * @returns {Promise<Object>}
   */
  move(id, destination) {
    return new Promise((resolve) => {
      chrome.bookmarks.move(id, destination, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * 删除书签
   * @param {string} id - 书签ID
   * @returns {Promise<void>}
   */
  remove(id) {
    return new Promise((resolve) => {
      chrome.bookmarks.remove(id, () => {
        resolve();
      });
    });
  },
  
  /**
   * 删除书签树（文件夹）
   * @param {string} id - 文件夹ID
   * @returns {Promise<void>}
   */
  removeTree(id) {
    return new Promise((resolve) => {
      chrome.bookmarks.removeTree(id, () => {
        resolve();
      });
    });
  },
  
  /**
   * 获取书签的收藏夹图标URL
   * @param {string} url - 网页URL
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
   * @param {string} id - 书签ID
   * @returns {Promise<Array>}
   */
  async getPath(id) {
    const path = [];
    let currentId = id;
    
    while (currentId) {
      const node = await new Promise((resolve) => {
        chrome.bookmarks.get(currentId, (results) => {
          resolve(results[0]);
        });
      });
      
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
// 导出模块（如果在模块环境中）
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    Storage,
    DOM,
    BookmarkUtils,
    Utils
  };
}
