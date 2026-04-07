/**
 * Favicon 服务模块
 * 用于获取和显示网站 favicon
 */

const FaviconService = {
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
          protocol === 'edge:') {
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
  createIconElement(url, isFolder = false, isExpanded = false) {
    const iconContainer = document.createElement('span');
    iconContainer.className = 'tree-icon';

    if (isFolder) {
      iconContainer.textContent = isExpanded ? '📂' : '📁';
      return iconContainer;
    }

    const faviconUrls = this.getFaviconUrls(url);

    if (faviconUrls.length > 0) {
      const img = document.createElement('img');
      img.alt = '';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';

      // 尝试加载多个 favicon 源
      this.tryLoadFavicon(img, faviconUrls, 0, iconContainer);

      iconContainer.appendChild(img);
    } else {
      iconContainer.textContent = '🔖';
    }

    return iconContainer;
  },

  /**
   * 尝试加载 favicon（带备选方案）
   * @param {HTMLImageElement} img - 图片元素
   * @param {string[]} urls - favicon URL 数组
   * @param {number} index - 当前尝试的索引
   * @param {HTMLElement} container - 容器元素
   */
  tryLoadFavicon(img, urls, index, container) {
    if (index >= urls.length) {
      // 所有方案都失败，使用默认图标
      img.style.display = 'none';
      container.textContent = '🔖';
      return;
    }

    img.src = urls[index];

    img.onload = () => {
      // 成功加载，确保图片可见
      img.style.display = 'inline';
    };

    img.onerror = () => {
      // 当前方案失败，尝试下一个
      console.log(`Favicon load failed for ${urls[index]}, trying next...`);
      this.tryLoadFavicon(img, urls, index + 1, container);
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
    iconContainer.style.width = '20px';
    iconContainer.style.height = '20px';
    iconContainer.style.flexShrink = '0';

    const faviconUrls = this.getFaviconUrls(url);

    if (faviconUrls.length > 0) {
      const img = document.createElement('img');
      img.alt = '';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';

      // 尝试加载多个 favicon 源
      this.tryLoadFavicon(img, faviconUrls, 0, iconContainer);

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
