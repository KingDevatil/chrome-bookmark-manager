/**
 * Favicon 本地缓存
 * 利用 browser.storage.local 持久化图标，标签页关闭后仍能显示
 */
const FaviconCache = {
  STORAGE_KEY: 'favicon_cache_v2',
  MAX_ENTRIES: 200,
  TTL: 30 * 24 * 60 * 60 * 1000, // 30天

  _storage() {
    if (typeof browser !== 'undefined' && browser.storage) {
      return browser.storage.local;
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.local;
    }
    return null;
  },

  async get(url) {
    const storage = this._storage();
    if (!storage) return null;
    try {
      const origin = new URL(url).origin;
      const data = await storage.get(this.STORAGE_KEY);
      const cache = data[this.STORAGE_KEY] || {};
      const entry = cache[origin];
      if (entry && (Date.now() - entry.ts < this.TTL)) {
        return entry.dataUrl;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async set(url, dataUrl) {
    const storage = this._storage();
    if (!storage) return;
    try {
      const origin = new URL(url).origin;
      const data = await storage.get(this.STORAGE_KEY);
      const cache = data[this.STORAGE_KEY] || {};
      cache[origin] = { dataUrl, ts: Date.now() };
      // LRU 淘汰
      const keys = Object.keys(cache);
      if (keys.length > this.MAX_ENTRIES) {
        keys.sort((a, b) => cache[a].ts - cache[b].ts);
        for (let i = 0; i < keys.length - this.MAX_ENTRIES; i++) {
          delete cache[keys[i]];
        }
      }
      await storage.set({ [this.STORAGE_KEY]: cache });
    } catch (e) {
      console.log('Favicon cache save failed:', e);
    }
  },

  /**
   * 将成功加载的图标保存到缓存
   * @param {string} iconUrl - 图标 URL（可能是 data URL 或 http URL）
   * @param {string} pageUrl - 对应页面 URL（用于生成缓存 key）
   */
  async saveIcon(iconUrl, pageUrl) {
    try {
      let dataUrl = iconUrl;
      // 如果不是 data URL，fetch 获取 blob 后转 base64
      if (!iconUrl.startsWith('data:')) {
        const resp = await fetch(iconUrl);
        const blob = await resp.blob();
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      await this.set(pageUrl, dataUrl);
    } catch (e) {
      console.log('Favicon cache save failed:', e);
    }
  }
};

/**
 * Favicon 服务模块
 * 用于获取和显示网站 favicon
 */

const FaviconService = {
  iconSize: 16,

  setIconSize(size) {
    this.iconSize = size || 16;
  },

  async initSize() {
    try {
      const result = await Storage.get('layoutSettings');
      const settings = result.layoutSettings || {};
      if (settings.faviconSize) {
        this.iconSize = settings.faviconSize;
      }
    } catch (e) {}
  },

  /**
   * 获取网站的 favicon URL（多个备选方案）
   * @param {string} url - 网站 URL
   * @returns {string[]} favicon URL 数组（按优先级排序）
   */
  getFaviconUrls(url) {
    if (!url) return [];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const origin = urlObj.origin;
      const protocol = urlObj.protocol;

      // 跳过扩展内部页面和特殊协议
      if (protocol === 'moz-extension:' ||
          protocol === 'chrome-extension:' ||
          protocol === 'chrome:' ||
          protocol === 'about:' ||
          protocol === 'edge:' ||
          protocol === 'file:' ||
          protocol === 'javascript:' ||
          protocol === 'data:') {
        return [];
      }

      return [
        // 方案1: Google Favicon Service（最稳定）
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        // 方案2: DuckDuckGo Favicon Service（隐私友好）
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        // 方案3: 直接访问网站的 favicon
        `${origin}/favicon.ico`
      ];
    } catch (error) {
      console.error('Invalid URL:', url);
      return [];
    }
  },

  /**
   * 获取网站的 favicon URL（单个，向后兼容）
   * @param {string} url - 网站 URL
   * @returns {string} favicon URL
   */
  getFaviconUrl(url) {
    const urls = this.getFaviconUrls(url);
    return urls[0] || '';
  },

  /**
   * 创建带有 favicon 的图标元素
   * @param {string} url - 网站 URL
   * @param {boolean} isFolder - 是否为文件夹
   * @param {boolean} isExpanded - 文件夹是否展开
   * @returns {HTMLElement} 图标元素
   */
  createIconElement(url, isFolder = false, isExpanded = false, fallbackText = '') {
    const iconContainer = document.createElement('span');
    iconContainer.className = 'tree-icon';

    if (isFolder) {
      iconContainer.textContent = isExpanded ? '📂' : '📁';
      return iconContainer;
    }

    let faviconUrls = this.getFaviconUrls(url);
    // 捷径场景过滤 chrome://favicon/，防止其默认占位图标阻断 fallback
    if (fallbackText) {
      faviconUrls = faviconUrls.filter(u => !u.startsWith('chrome://favicon/'));
    }

    if (faviconUrls.length > 0) {
      const img = document.createElement('img');
      img.alt = '';
      img.style.width = `${this.iconSize}px`;
      img.style.height = `${this.iconSize}px`;
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';
      iconContainer.appendChild(img);

      // 异步检查本地缓存，命中则直接显示缓存图标
      FaviconCache.get(url).then(cached => {
        if (cached && iconContainer.contains(img)) {
          img.src = cached;
          img.style.display = 'inline';
        }
      }).catch(() => {});

      // 尝试加载多个 favicon 源
      this.tryLoadFavicon(img, faviconUrls, 0, iconContainer, fallbackText, url);
    } else {
      iconContainer.textContent = fallbackText || '🔖';
    }

    return iconContainer;
  },

  /**
   * 从网页源码中解析 favicon 路径
   * @param {string} url - 网页 URL
   * @returns {Promise<string|null>} favicon URL
   */
  async fetchFaviconFromPage(url) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeout);

      // 只读取前 50KB 内容，避免大页面拖慢性能
      const reader = response.body.getReader();
      let chunks = '';
      let received = 0;
      const limit = 50 * 1024;
      while (received < limit) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks += new TextDecoder().decode(value, { stream: true });
        received += value.length;
        // 一旦读取到 </head> 就可以提前终止
        if (chunks.includes('</head>')) break;
      }
      reader.cancel();

      const parser = new DOMParser();
      const doc = parser.parseFromString(chunks, 'text/html');
      const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]'
      ];
      for (const selector of selectors) {
        const link = doc.querySelector(selector);
        if (link && link.href) {
          return new URL(link.href, url).href;
        }
      }
    } catch (error) {
      console.log('Failed to fetch favicon from page:', error);
    }
    return null;
  },

  /**
   * 从当前打开的标签页获取 favicon URL
   * 利用 browser.tabs.favIconUrl 获取浏览器实际显示的图标
   * @param {string} url - 网页 URL
   * @returns {Promise<string|null>} favicon URL
   */
  async tryTabFavicon(url) {
    try {
      let tabs;
      const urlObj = new URL(url);
      const originPattern = `${urlObj.origin}/*`;

      if (typeof browser !== 'undefined' && browser.tabs) {
        tabs = await browser.tabs.query({ url: originPattern });
      } else if (typeof chrome !== 'undefined' && chrome.tabs) {
        tabs = await new Promise((resolve, reject) => {
          chrome.tabs.query({ url: originPattern }, (result) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(result);
          });
        });
      } else {
        return null;
      }

      if (tabs && tabs.length > 0) {
        const exactMatch = tabs.find(t =>
          t.url === url ||
          (t.url && (t.url.startsWith(url + '?') || t.url.startsWith(url + '#')))
        );
        const tab = exactMatch || tabs[0];
        if (tab.favIconUrl) return tab.favIconUrl;
      }
    } catch (e) {
      console.log('Tab favicon query failed:', e);
    }
    return null;
  },

  /**
   * 尝试加载 favicon（带备选方案）
   * @param {HTMLImageElement} img - 图片元素
   * @param {string[]} urls - favicon URL 数组
   * @param {number} index - 当前尝试的索引
   * @param {HTMLElement} container - 容器元素
   * @param {string} fallbackText - fallback 文字
   * @param {string} pageUrl - 原始页面 URL（用于从页面源码解析 favicon）
   */
  tryLoadFavicon(img, urls, index, container, fallbackText = '', pageUrl = '') {
    if (index >= urls.length) {
      // 所有预设来源都失败，依次尝试：页面源码解析 → 当前标签页 favIconUrl
      if (pageUrl && fallbackText) {
        this.fetchFaviconFromPage(pageUrl).then(async (iconUrl) => {
          if (iconUrl) {
            img.src = iconUrl;
            img.onload = () => {
              img.style.display = 'inline';
              if (pageUrl) { FaviconCache.saveIcon(img.src, pageUrl); }
            };
            img.onerror = () => {
              img.style.display = 'none';
              container.textContent = fallbackText || '🔖';
            };
            return;
          }

          const tabIcon = await this.tryTabFavicon(pageUrl);
          if (tabIcon) {
            img.src = tabIcon;
            img.onload = () => {
              img.style.display = 'inline';
              if (pageUrl) { FaviconCache.saveIcon(img.src, pageUrl); }
            };
            img.onerror = () => {
              img.style.display = 'none';
              container.textContent = fallbackText || '🔖';
            };
            return;
          }

          img.style.display = 'none';
          container.textContent = fallbackText || '🔖';
        });
      } else {
        img.style.display = 'none';
        container.textContent = fallbackText || '🔖';
      }
      return;
    }

    img.src = urls[index];

    img.onload = () => {
      // 成功加载，确保图片可见
      img.style.display = 'inline';
      // 缓存成功加载的图标（排除远程聚合服务，避免缓存默认地球图标）
      if (pageUrl) {
        const src = urls[index];
        const isRemoteService = src && (
          src.includes('google.com/s2/favicons') ||
          src.includes('icons.duckduckgo.com')
        );
        if (!isRemoteService) {
          FaviconCache.saveIcon(img.src, pageUrl);
        }
      }
    };

    img.onerror = () => {
      // 当前方案失败，尝试下一个
      console.log(`Favicon load failed for ${urls[index]}, trying next...`);
      this.tryLoadFavicon(img, urls, index + 1, container, fallbackText, pageUrl);
    };
  },

  /**
   * 创建管理器中的 favicon 图标元素
   * @param {string} url - 网站 URL
   * @returns {HTMLElement} 图标元素
   */
  createManagerIconElement(url) {
    const iconContainer = document.createElement('span');
    iconContainer.className = 'bookmark-icon';
    iconContainer.style.display = 'inline-flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = `${this.iconSize + 4}px`;
    iconContainer.style.height = `${this.iconSize + 4}px`;
    iconContainer.style.flexShrink = '0';

    const faviconUrls = this.getFaviconUrls(url);

    if (faviconUrls.length > 0) {
      const img = document.createElement('img');
      img.alt = '';
      img.style.width = `${this.iconSize}px`;
      img.style.height = `${this.iconSize}px`;
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';

      // 异步检查本地缓存
      FaviconCache.get(url).then(cached => {
        if (cached && iconContainer.contains(img)) {
          img.src = cached;
          img.style.display = 'inline';
        }
      });

      // 尝试加载多个 favicon 源
      this.tryLoadFavicon(img, faviconUrls, 0, iconContainer, '', url);

      iconContainer.appendChild(img);
    } else {
      iconContainer.textContent = '🔖';
    }

    return iconContainer;
  },

  /**
   * 预加载 favicon（用于优化性能）
   * @param {string[]} urls - URL 数组
   */
  preloadFavicons(urls) {
    urls.forEach(url => {
      const faviconUrls = this.getFaviconUrls(url);
      if (faviconUrls.length > 0) {
        const img = new Image();
        // 只预加载第一个（最快的）
        img.src = faviconUrls[0];
      }
    });
  }
};

// 兼容模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FaviconService;
}
