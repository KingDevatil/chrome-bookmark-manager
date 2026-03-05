/**
 * Favicon 服务模块
 * 用于获取和显示网站 favicon
 */

const FaviconService = {
  /**
   * 获取网站的 favicon URL
   * @param {string} url - 网站 URL
   * @returns {string} favicon URL
   */
  getFaviconUrl(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // 使用 Google Favicon Service
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
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
      // 文件夹使用 emoji 图标
      iconContainer.textContent = isExpanded ? '📂' : '📁';
      return iconContainer;
    }

    // 书签使用 favicon
    const faviconUrl = this.getFaviconUrl(url);

    if (faviconUrl) {
      const img = document.createElement('img');
      img.src = faviconUrl;
      img.alt = '';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';

      // 加载失败时回退到默认图标
      img.onerror = () => {
        img.style.display = 'none';
        iconContainer.textContent = '🔖';
      };

      iconContainer.appendChild(img);
    } else {
      iconContainer.textContent = '🔖';
    }

    return iconContainer;
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

    const faviconUrl = this.getFaviconUrl(url);

    if (faviconUrl) {
      const img = document.createElement('img');
      img.src = faviconUrl;
      img.alt = '';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.borderRadius = '2px';
      img.style.objectFit = 'contain';

      img.onerror = () => {
        img.style.display = 'none';
        iconContainer.textContent = '🔖';
      };

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
      const faviconUrl = this.getFaviconUrl(url);
      if (faviconUrl) {
        const img = new Image();
        img.src = faviconUrl;
      }
    });
  }
};

// 兼容模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FaviconService;
}
