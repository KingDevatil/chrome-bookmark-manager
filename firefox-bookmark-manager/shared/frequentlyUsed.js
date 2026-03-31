/**
 * 常用文件夹功能 - 访问热度统计工具
 * 独立于书签系统，统计所有浏览记录的访问频率
 */

const FrequentlyUsed = {
  // 缓存配置
  CACHE_DURATION: 5 * 60 * 1000, // 5 分钟
  
  // 缓存数据
  cache: {
    data: null,
    timestamp: 0
  },
  
  /**
   * 获取常用链接列表
   * @param {number} daysRange - 统计时间范围（天数）
   * @param {number} displayCount - 展示数量
   * @param {string[]} blacklist - 黑名单域名列表
   * @param {Array<string|{url:string, title:string}>} pinned - 置顶的 URL 或对象列表
   * @returns {Promise<Array>} 常用链接列表
   */
  async getFrequentlyUsed(daysRange = 7, displayCount = 10, blacklist = [], pinned = []) {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      // 验证缓存配置是否匹配
      const cacheConfig = this.cache.config || {};
      const isConfigMatch = 
        cacheConfig.daysRange === daysRange &&
        cacheConfig.displayCount === displayCount &&
        JSON.stringify(cacheConfig.blacklist) === JSON.stringify(blacklist) &&
        JSON.stringify(cacheConfig.pinned) === JSON.stringify(pinned);
      
      if (isConfigMatch) {
        return this.cache.data;
      }
    }
    
    // 重新计算
    const data = await this.calculateFrequentlyUsed(daysRange, displayCount, blacklist, pinned);
    
    // 更新缓存（包括配置）
    this.cache.data = data;
    this.cache.timestamp = now;
    this.cache.config = { daysRange, displayCount, blacklist, pinned };
    
    return data;
  },
  
  /**
   * 计算常用链接（核心算法）
   */
  async calculateFrequentlyUsed(daysRange, displayCount, blacklist, pinned = []) {
    // 将 pinned 转换为 URL 字符串数组
    const pinnedUrls = pinned.map(p => typeof p === 'string' ? p : p.url);
    const pinnedSet = new Set(pinnedUrls);
    
    // 诊断信息
    console.log('=== FrequentlyUsed 诊断 ===');
    console.log('browser 对象:', typeof browser);
    
    // 如果 browser 对象不存在，尝试使用 chrome 对象
    if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
      console.log('browser 未定义，使用 chrome 对象');
      window.browser = chrome;
    }
    
    console.log('browser.history:', browser?.history);
    console.log('browser.history.search:', browser?.history?.search);
    console.log('chrome 对象:', typeof chrome);
    console.log('chrome.history:', chrome?.history);
    console.log('chrome.history.search:', chrome?.history?.search);
    
    // 1. 获取置顶链接的信息（不查询历史记录）
    const pinnedItems = [];
    for (const pinnedItem of pinned) {
      const url = typeof pinnedItem === 'string' ? pinnedItem : pinnedItem.url;
      const title = typeof pinnedItem === 'string' ? pinnedItem : (pinnedItem.title || url);
      pinnedItems.push({
        url: url,
        title: title,
        visitCount: 0,
        lastVisit: 0,
        isPinned: true
      });
    }
    
    try {
      const now = Date.now();
      const startTime = now - (daysRange * 24 * 60 * 60 * 1000);
      
      console.log('常用文件夹：开始加载历史数据，参数:', { daysRange, startTime });
      
      // 检查 browser.history API 是否可用
      if (!browser.history || !browser.history.search) {
        console.error('常用文件夹：browser.history.search API 不可用');
        console.log('browser.history:', browser.history);
        return pinnedItems;
      }
      
      // 2. 获取最近 N 天的浏览记录（去重后的 URL 列表）
      const history = await browser.history.search({
        text: '', // 必须参数，空字符串表示匹配所有 URL
        startTime: startTime,
        maxResults: 10000 // 最多获取 10000 条记录
      });
      
      console.log('常用文件夹：历史记录加载成功，数量:', history.length);
      
      if (!history || history.length === 0) {
        // 即使没有历史记录，也要返回置顶链接
        console.log('常用文件夹：没有历史记录，返回置顶链接');
        const bookmarkedSet = await this.checkBookmarkedUrls(pinnedUrls);
        pinnedItems.forEach(item => {
          item.isBookmarked = bookmarkedSet.has(item.url);
        });
        return pinnedItems;
      }
      
      // 3. 过滤黑名单域名和已置顶的链接
      const blacklistSet = new Set(blacklist.map(d => d.toLowerCase()));
      const filtered = history.filter(item => {
        // 排除已置顶的链接
        if (pinnedSet.has(item.url)) {
          return false;
        }
        const domain = this.extractDomain(item.url);
        return domain && !blacklistSet.has(domain.toLowerCase());
      });
      
      // 3. 统计每个 URL 在最近 N 天内的实际访问次数（只统计用户主动访问）
      const countMap = {};
      for (const item of filtered) {
        // 获取该 URL 的详细访问记录
        const visits = await browser.history.getVisits({ url: item.url });
        
        if (!visits || visits.length === 0) {
          continue;
        }
        
        // 统计在指定时间范围内的访问次数（只统计用户主动访问）
        let visitCount = 0;
        let lastVisitTime = 0;
        
        // 收集所有符合条件的访问记录
        const validVisits = [];
        
        visits.forEach(visit => {
          const visitTime = visit.visitTime;
          const transition = visit.transition;
          
          // 只统计用户主动访问：link, typed, form_submit, keyword, keyword_generated
          const isUserInitiated = [
            'link',           // 点击链接
            'typed',          // 地址栏输入
            'form_submit',    // 表单提交
            'keyword',        // 关键字搜索
            'keyword_generated' // 自动生成的关键字
          ].includes(transition);
          
          if (visitTime >= startTime && isUserInitiated) {
            validVisits.push({
              visitTime: visitTime,
              transition: transition
            });
          }
        });
        
        // 按时间排序
        validVisits.sort((a, b) => a.visitTime - b.visitTime);
        
        // 合并短时间内的重复访问（1 分钟内的多次访问只计数 1 次）
        const TIME_WINDOW = 60 * 1000; // 1 分钟
        let lastCountedTime = 0;
        
        validVisits.forEach(visit => {
          // 如果距离上次计数的时间超过 1 分钟，才计数
          if (visit.visitTime - lastCountedTime > TIME_WINDOW) {
            visitCount++;
            lastVisitTime = Math.max(lastVisitTime, visit.visitTime);
            lastCountedTime = visit.visitTime;
          }
        });
        
        // 只有在指定时间范围内有访问记录才计入
        if (visitCount > 0) {
          countMap[item.url] = {
            url: item.url,
            title: item.title,
            visitCount: visitCount, // 最近 N 天内的实际访问次数（已合并短时间重复）
            lastVisit: lastVisitTime
          };
        }
      }
      
      // 4. 转换为数组并排序
      const items = Object.values(countMap);
      items.sort((a, b) => {
        // 首先按访问次数排序
        if (b.visitCount !== a.visitCount) {
          return b.visitCount - a.visitCount;
        }
        // 次数相同按最近访问时间排序
        return b.lastVisit - a.lastVisit;
      });
      
      // 5. 检查是否在书签中
      const urls = items.map(item => item.url);
      const bookmarkedSet = await this.checkBookmarkedUrls(urls);
      items.forEach(item => {
        item.isBookmarked = bookmarkedSet.has(item.url);
      });

      // 5.1 检查置顶链接是否在书签中
      const pinnedUrlsToCheck = pinnedItems.map(p => p.url);
      const pinnedBookmarkedSet = await this.checkBookmarkedUrls(pinnedUrlsToCheck);
      pinnedItems.forEach(item => {
        item.isBookmarked = pinnedBookmarkedSet.has(item.url);
      });
      
      // 6. 取前 N 个（不包括置顶链接）
      const normalItems = items.slice(0, displayCount);
      
      // 7. 合并置顶链接和普通链接（置顶在前）
      const allItems = [...pinnedItems, ...normalItems];
      
      return allItems;
      
    } catch (error) {
      console.error('计算常用链接失败:', error);
      return pinnedItems;
    }
  },
  
  /**
   * 提取域名
   * @param {string} url - URL 地址
   * @returns {string|null} 域名
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      // 提取主域名（去除 www）
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  },
  
  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = 0;
    this.cache.config = null;
  },
  
  /**
   * 检查链接是否在书签中
   * @param {string} url - 要检查的 URL
   * @returns {Promise<boolean>} 是否在书签中
   */
  async isBookmarked(url) {
    try {
      const results = await browser.bookmarks.search({ url });
      return results && results.length > 0;
    } catch {
      return false;
    }
  },
  
  /**
   * 批量检查链接是否在书签中
   * @param {Array<string>} urls - URL 列表
   * @returns {Promise<Set<string>>} 在书签中的 URL 集合
   */
  async checkBookmarkedUrls(urls) {
    const bookmarkedSet = new Set();
    
    try {
      // 获取所有书签
      const tree = await browser.bookmarks.getTree();
      const urls_set = new Set(urls);
      
      // 遍历书签树收集 URL
      const collectUrls = (nodes) => {
        for (const node of nodes) {
          if (node.url && urls_set.has(node.url)) {
            bookmarkedSet.add(node.url);
          }
          if (node.children) {
            collectUrls(node.children);
          }
        }
      };
      
      collectUrls(tree);
    } catch (error) {
      console.error('检查书签失败:', error);
    }
    
    return bookmarkedSet;
  }
};