/**
 * Firefox 侧边栏脚本
 */

let bookmarkTree = [];
let expandedFolders = new Set(['1', '2']);
let currentSearchQuery = '';
let isMenuOpen = false;
let frequentlyUsedData = [];
let refreshTimer = null;
let frequentlyUsedCollapsed = false;
let currentTab = 'bookmarks';
let historyData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await ThemeManager.init();
  await I18n.init();
  await loadLayoutSettings();
  await loadFrequentlyUsedConfig();
  await loadBookmarkTree();
  setupEventListeners();
  setupMenuPanel();
  setupAutoRefresh();
  setupTabSwitcher();

  // 初始化主题开关 UI 状态
  const theme = document.documentElement.getAttribute('data-theme');
  updateThemeToggleUI(theme);

  // 监听背景消息 - 清理标签数据
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cleanBookmarkTags' && message.bookmarkId) {
      BookmarkTags.removeTags(message.bookmarkId);
      console.log('Tags cleaned for bookmark:', message.bookmarkId);
    }
    if (message.action === 'refreshBookmarks') {
      console.log('Refreshing bookmarks in sidebar...');
      loadBookmarkTree();
    }
  });
});

async function loadBookmarkTree() {
  try {
    const tree = await BookmarkUtils.getTree();
    bookmarkTree = tree;
    await loadFrequentlyUsedData();
    renderBookmarkTree();
  } catch (error) {
    console.error('加载书签失败:', error);
    showEmptyState('加载失败');
  }
}

async function loadFrequentlyUsedConfig() {
  try {
    const config = await FrequentlyUsedConfig.getConfig();
    window.frequentlyUsedConfig = config;
    
    // 更新菜单中的开关状态
    const frequentlyUsedToggle = document.getElementById('frequently-used-toggle');
    if (frequentlyUsedToggle) {
      if (config.enabled) {
        frequentlyUsedToggle.classList.add('active');
      } else {
        frequentlyUsedToggle.classList.remove('active');
      }
    }
  } catch (error) {
    console.error('加载常用配置失败:', error);
    window.frequentlyUsedConfig = FrequentlyUsedConfig.DEFAULT_CONFIG;
  }
}

async function loadFrequentlyUsedData() {
  try {
    if (!window.frequentlyUsedConfig || !window.frequentlyUsedConfig.enabled) {
      frequentlyUsedData = [];
      return;
    }

    const config = window.frequentlyUsedConfig;
    frequentlyUsedData = await FrequentlyUsed.getFrequentlyUsed(
      config.daysRange,
      config.displayCount,
      config.blacklist,
      config.pinned || []
    );
  } catch (error) {
    console.error('加载常用数据失败:', error);
    frequentlyUsedData = [];
  }
}

async function refreshFrequentlyUsed() {
  // 清除缓存，强制重新计算
  if (typeof FrequentlyUsed.clearCache === 'function') {
    FrequentlyUsed.clearCache();
  }
  
  // 重新加载配置
  await loadFrequentlyUsedConfig();
  await loadFrequentlyUsedData();
  renderBookmarkTree();
}

function setupAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  refreshTimer = setInterval(async () => {
    if (window.frequentlyUsedConfig && window.frequentlyUsedConfig.enabled) {
      await refreshFrequentlyUsed();
    }
  }, 5 * 60 * 1000);
}

function renderBookmarkTree() {
  const container = document.getElementById('bookmark-tree');
  const emptyState = document.getElementById('empty-state');

  if (!bookmarkTree || bookmarkTree.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  if (currentSearchQuery) {
    renderSearchResults();
    return;
  }

  container.innerHTML = '';
  
  const rootChildren = bookmarkTree[0]?.children || [];
  
  if (window.frequentlyUsedConfig && window.frequentlyUsedConfig.enabled && frequentlyUsedData.length > 0) {
    const frequentlyUsedNode = createFrequentlyUsedNode();
    container.appendChild(frequentlyUsedNode);
  }

  rootChildren.forEach(node => {
    const nodeElement = createTreeNode(node, 0);
    container.appendChild(nodeElement);
  });

  emptyState.style.display = container.children.length === 0 ? 'flex' : 'none';
}

function createTreeNode(node, level) {
  const li = document.createElement('li');
  li.className = 'tree-node';

  const isFolder = !node.url;
  const isExpanded = expandedFolders.has(node.id);
  const hasChildren = isFolder && node.children && node.children.length > 0;
  const isPinned = node.isPinned === true;

  const content = document.createElement('div');
  content.className = 'tree-node-content';
  if (isPinned) {
    content.classList.add('pinned-item');
  }
  // 计算缩进：基础16px + 层级 * 缩进宽度
  const baseIndent = 16;
  const rootStyle = document.documentElement.style;
  const indentValue = rootStyle.getPropertyValue('--tree-indent') || '20px';
  const indentWidth = parseInt(indentValue) || 20;
  content.style.paddingLeft = `${baseIndent + level * indentWidth}px`;
  content.style.height = `var(--bookmark-height, 32px)`;

  const toggle = document.createElement('span');
  toggle.className = 'tree-toggle';
  if (!hasChildren) {
    toggle.classList.add('empty');
  } else if (isExpanded) {
    toggle.classList.add('expanded');
  }
  toggle.textContent = hasChildren ? '▶' : '';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFolder(node.id);
  });

  const icon = FaviconService.createIconElement(node.url, isFolder, isExpanded);

  const title = document.createElement('span');
  title.className = 'tree-title';
  // 置顶链接显示📌图标
  if (isPinned && !isFolder) {
    title.innerHTML = `<span class="pinned-icon">📌</span>${node.title || I18n.t('common.noTitle')}`;
  } else {
    title.textContent = node.title || (isFolder ? I18n.t('common.newFolder') : I18n.t('common.noTitle'));
  }
  title.title = node.title || '';

  // 保存节点引用以便拖拽时使用
  content.__node = node;

  content.appendChild(toggle);
  content.appendChild(icon);
  content.appendChild(title);

  // 点击事件
  content.addEventListener('click', () => {
    if (isFolder) {
      toggleFolder(node.id);
    } else {
      openBookmark(node.url);
    }
  });

  // 右键菜单事件
  content.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e, node, isFolder);
  });

  // 拖拽事件 - 所有节点都可以拖拽
  content.draggable = true;
  content.addEventListener('dragstart', handleDragStart);
  content.addEventListener('dragend', handleDragEnd);
  content.addEventListener('dragover', handleDragOver);
  content.addEventListener('dragleave', handleDragLeave);
  content.addEventListener('drop', handleDrop);

  li.appendChild(content);

  if (isFolder && hasChildren && isExpanded) {
    const childrenUl = document.createElement('ul');
    childrenUl.className = 'tree-children expanded';
    node.children.forEach(child => {
      childrenUl.appendChild(createTreeNode(child, level + 1));
    });
    li.appendChild(childrenUl);
  }

  return li;
}

function createFrequentlyUsedNode() {
  const li = document.createElement('li');
  li.className = 'tree-node';

  const content = document.createElement('div');
  content.className = 'tree-node-content frequently-used-folder';
  content.style.height = `var(--bookmark-height, 32px)`;
  content.__isFrequentlyUsed = true;

  const toggle = document.createElement('span');
  toggle.className = `tree-toggle ${frequentlyUsedCollapsed ? '' : 'expanded'}`;
  toggle.textContent = '▶';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFrequentlyUsed();
  });

  const icon = document.createElement('span');
  icon.className = 'tree-icon frequently-used-icon';
  icon.textContent = '⭐';

  const title = document.createElement('span');
  title.className = 'tree-title frequently-used-title';
  title.textContent = I18n.t('freq.freqUsed');

  const refreshBtn = document.createElement('span');
  refreshBtn.className = 'frequently-used-refresh';
  refreshBtn.textContent = '🔄';
  refreshBtn.title = I18n.t('common.refresh');
  refreshBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await refreshFrequentlyUsed();
  });

  content.appendChild(toggle);
  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(refreshBtn);

  content.addEventListener('click', () => {
    toggleFrequentlyUsed();
  });

  content.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showFrequentlyUsedContextMenu(e);
  });

  li.appendChild(content);

  const childrenUl = document.createElement('ul');
  childrenUl.className = `tree-children frequently-used-list ${frequentlyUsedCollapsed ? '' : 'expanded'}`;

  if (frequentlyUsedCollapsed) {
    // 折叠状态不显示子项
  } else if (frequentlyUsedData.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'tree-node frequently-used-empty';
    emptyLi.textContent = I18n.t('sidebar.noPinnedLinks');
    emptyLi.style.paddingLeft = '36px';
    emptyLi.style.fontSize = '13px';
    emptyLi.style.color = 'var(--text-tertiary, #94a3b8)';
    emptyLi.style.padding = '8px 16px';
    childrenUl.appendChild(emptyLi);
  } else {
    frequentlyUsedData.forEach((item, index) => {
      const itemLi = createFrequentlyUsedItem(item, index);
      childrenUl.appendChild(itemLi);
    });
  }

  li.appendChild(childrenUl);

  return li;
}

function createFrequentlyUsedItem(item, index) {
  const li = document.createElement('li');
  li.className = 'tree-node frequently-used-item';
  
  const content = document.createElement('div');
  content.className = 'tree-node-content frequently-used-link';
  content.style.height = `var(--bookmark-height, 32px)`;
  content.__frequentlyUsedData = item;
  content.__index = index;
  
  const spacer = document.createElement('span');
  spacer.className = 'tree-toggle empty';
  
  const icon = FaviconService.createIconElement(item.url, false, false);
  
  const titleContainer = document.createElement('div');
  titleContainer.className = 'frequently-used-item-content';
  
  const title = document.createElement('span');
  title.className = 'tree-title';
  if (item.isPinned) {
    title.style.color = '#f23600';
  }
  title.textContent = item.title || item.url || I18n.t('common.noTitle');
  title.title = item.title || item.url || '';
  
  const visitCountOrPin = document.createElement('span');
  visitCountOrPin.className = 'frequently-used-visit-count';
  if (item.isPinned) {
    visitCountOrPin.textContent = '📌 ' + I18n.t('common.pin');
    visitCountOrPin.style.color = '#f23600';
    visitCountOrPin.style.fontWeight = '500';
  } else {
    visitCountOrPin.textContent = `${item.visitCount} ${I18n.t('sidebar.visitTimes')}`;
  }
  
  titleContainer.appendChild(title);
  titleContainer.appendChild(visitCountOrPin);
  
  content.appendChild(spacer);
  content.appendChild(icon);
  content.appendChild(titleContainer);
  
  if (item.isBookmarked) {
    content.classList.add('bookmarked');
    const bookmarkIcon = document.createElement('span');
    bookmarkIcon.className = 'frequently-used-bookmark-icon';
    bookmarkIcon.textContent = '📑';
    bookmarkIcon.title = I18n.t('common.bookmark');
    content.appendChild(bookmarkIcon);
  }
  
  content.addEventListener('click', () => {
    openBookmark(item.url);
  });
  
  content.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showFrequentlyUsedLinkContextMenu(e, item);
  });
  
  li.appendChild(content);
  
  return li;
}

function toggleFrequentlyUsed() {
  frequentlyUsedCollapsed = !frequentlyUsedCollapsed;
  renderBookmarkTree();
}

async function showFrequentlyUsedContextMenu(e) {
  removeContextMenu();
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.style.zIndex = '10000';
  
  const configItem = document.createElement('div');
  configItem.className = 'context-menu-item';
  configItem.textContent = '⚙️ ' + I18n.t('freq.title');
  configItem.addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('manager/settings.html')
    });
    removeContextMenu();
  });
  
  menu.appendChild(configItem);
  
  document.body.appendChild(menu);
  
  const closeMenu = (event) => {
    if (!menu.contains(event.target)) {
      removeContextMenu();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 100);
}

async function showFrequentlyUsedLinkContextMenu(e, item) {
  removeContextMenu();
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.style.zIndex = '10000';
  
  // 置顶选项
  const currentUrl = item.url;
  const isPinned = window.frequentlyUsedConfig && 
                   window.frequentlyUsedConfig.pinned && 
                   window.frequentlyUsedConfig.pinned.some(pinnedItem => {
                     const pinnedUrl = typeof pinnedItem === 'string' ? pinnedItem : pinnedItem.url;
                     return pinnedUrl === currentUrl;
                   });
  
  const pinItem = document.createElement('div');
  pinItem.className = 'context-menu-item';
  pinItem.textContent = isPinned ? '📌 ' + I18n.t('common.unpin') : '📌 ' + I18n.t('common.pin');
  pinItem.addEventListener('click', async () => {
    if (isPinned) {
      await FrequentlyUsedConfig.unpinUrl(item.url);
    } else {
      await FrequentlyUsedConfig.pinUrl(item.url, item.title);
    }
    await refreshFrequentlyUsed();
    removeContextMenu();
  });
  menu.appendChild(pinItem);
  
  // 分隔线
  const separator1 = document.createElement('div');
  separator1.className = 'context-menu-separator';
  menu.appendChild(separator1);
  
  if (!item.isBookmarked) {
    const addBookmarkItem = document.createElement('div');
    addBookmarkItem.className = 'context-menu-item';
    addBookmarkItem.textContent = '📑 ' + I18n.t('common.addToBookmark');
    addBookmarkItem.addEventListener('click', () => {
      showAddBookmarkModal(item);
      removeContextMenu();
    });
    menu.appendChild(addBookmarkItem);

    const separator2 = document.createElement('div');
    separator2.className = 'context-menu-separator';
    menu.appendChild(separator2);
  }

  const domain = FrequentlyUsed.extractDomain(item.url);
  const blockItem = document.createElement('div');
  blockItem.className = 'context-menu-item';
  blockItem.textContent = '🚫 ' + I18n.t('common.block') + ' ' + domain;
  blockItem.addEventListener('click', async () => {
    await FrequentlyUsedConfig.addToBlacklist(domain);
    await refreshFrequentlyUsed();
    removeContextMenu();
  });
  
  menu.appendChild(blockItem);
  
  document.body.appendChild(menu);
  
  const closeMenu = (event) => {
    if (!menu.contains(event.target)) {
      removeContextMenu();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 100);
}

async function showAddBookmarkModal(item) {
  removeAddBookmarkModal();
  
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  
  // 获取书签树
  const bookmarkTree = await BookmarkUtils.getTree();
  
  modal.innerHTML = `
    <div class="edit-modal-content">
      <h3 class="edit-modal-title">${I18n.t('common.addToBookmark')}</h3>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.name')}</label>
        <input type="text" class="edit-modal-input" id="add-bookmark-title" value="${item.title || ''}">
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.url')}</label>
        <input type="text" class="edit-modal-input" id="add-bookmark-url" value="${item.url}" readonly>
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.folder')}</label>
        <div class="folder-tree" id="folder-tree">
          <!-- 文件夹树将通过 JS 渲染 -->
        </div>
        <input type="hidden" id="add-bookmark-folder" value="">
      </div>
      <div class="edit-modal-buttons">
        <button class="edit-modal-btn edit-modal-cancel">${I18n.t('common.cancel')}</button>
        <button class="edit-modal-btn edit-modal-save">${I18n.t('common.save')}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 渲染文件夹树
  const folderTreeContainer = document.getElementById('folder-tree');
  if (bookmarkTree && bookmarkTree.length > 0 && bookmarkTree[0].children) {
    const treeUl = document.createElement('ul');
    treeUl.className = 'folder-tree-list';
    
    for (const root of bookmarkTree[0].children) {
      const isFolder = !root.url;
      if (isFolder) {
        const li = createFolderTreeNode(root, 0);
        treeUl.appendChild(li);
      }
    }
    
    folderTreeContainer.appendChild(treeUl);
  }
  
  const titleInput = document.getElementById('add-bookmark-title');
  titleInput.focus();
  titleInput.select();
  
  modal.querySelector('.edit-modal-cancel').addEventListener('click', () => {
    removeAddBookmarkModal();
  });
  
  modal.querySelector('.edit-modal-save').addEventListener('click', async () => {
    const title = document.getElementById('add-bookmark-title').value.trim();
    const url = document.getElementById('add-bookmark-url').value.trim();
    const parentId = document.getElementById('add-bookmark-folder').value;

    if (!title) {
      alert(I18n.t('sidebar.enterBookmarkName'));
      return;
    }

    if (!url) {
      alert(I18n.t('sidebar.invalidUrl'));
      return;
    }

    if (!parentId) {
      alert(I18n.t('sidebar.selectFolder'));
      return;
    }

    try {
      await BookmarkUtils.create({
        parentId,
        title,
        url
      });
      await refreshFrequentlyUsed();
      removeAddBookmarkModal();
    } catch (error) {
      console.error('添加书签失败:', error);
      alert(I18n.t('sidebar.addFailed'));
    }
  });
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      modal.querySelector('.edit-modal-save').click();
    }
  });
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeAddBookmarkModal();
    }
  });
}

function createFolderTreeNode(node, level, selectedFolderId = null) {
  const li = document.createElement('li');
  li.className = 'folder-tree-node';
  li.dataset.folderId = node.id;
  
  const content = document.createElement('div');
  content.className = 'folder-tree-item';
  content.style.paddingLeft = `${level * 16 + 8}px`;
  
  // 折叠/展开按钮
  const toggle = document.createElement('span');
  toggle.className = 'folder-tree-toggle';
  
  // 子文件夹容器（先创建，在闭包中使用）
  const childrenUl = document.createElement('ul');
  childrenUl.className = 'folder-tree-children';
  childrenUl.style.display = 'none'; // 默认折叠
  
  const hasChildren = node.children && node.children.some(child => !child.url);
  if (hasChildren) {
    toggle.textContent = '▶';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = toggle.classList.contains('expanded');
      if (isExpanded) {
        toggle.classList.remove('expanded');
        toggle.textContent = '▶';
        childrenUl.style.display = 'none';
      } else {
        toggle.classList.add('expanded');
        toggle.textContent = '▼';
        childrenUl.style.display = 'block';
      }
    });
  } else {
    toggle.className = 'folder-tree-toggle empty';
  }
  
  // 文件夹图标和名称
  const icon = document.createElement('span');
  icon.className = 'folder-tree-icon';
  icon.textContent = '📁';
  
  const title = document.createElement('span');
  title.className = 'folder-tree-title';
  title.textContent = node.title || I18n.t('common.newFolder');
  
  // 选择文件夹
  content.addEventListener('click', () => {
    // 清除其他选中状态
    document.querySelectorAll('.folder-tree-item.selected').forEach(item => {
      item.classList.remove('selected');
    });
    
    // 选中当前
    content.classList.add('selected');
    
    // 设置选中的文件夹 ID
    const folderInput = document.getElementById('add-bookmark-folder') || 
                        document.getElementById('edit-folder-parentId') ||
                        document.getElementById('new-folder-parentId');
    if (folderInput) {
      folderInput.value = node.id;
    }
  });
  
  // 如果是当前选中的文件夹，自动选中
  if (selectedFolderId && selectedFolderId === node.id) {
    content.classList.add('selected');
  }
  
  content.appendChild(toggle);
  content.appendChild(icon);
  content.appendChild(title);
  li.appendChild(content);
  
  // 子文件夹
  if (hasChildren) {
    for (const child of node.children) {
      const isFolder = !child.url;
      if (isFolder) {
        const childLi = createFolderTreeNode(child, level + 1, selectedFolderId);
        childrenUl.appendChild(childLi);
      }
    }
    
    li.appendChild(childrenUl);
  }
  
  return li;
}

function buildFolderOptions(nodes, level) {
  let options = '';
  
  if (!nodes || nodes.length === 0) {
    return options;
  }
  
  for (const node of nodes) {
    const isFolder = !node.url;
    
    if (isFolder) {
      const indent = ' '.repeat(level * 2);
      const prefix = level > 0 ? '└ ' : '';
      const selected = level === 0 ? 'selected' : '';
      options += `<option value="${node.id}" ${selected}>${indent}${prefix}${node.title || '新建文件夹'}</option>`;
      
      // 递归添加子文件夹
      if (node.children && node.children.length > 0) {
        options += buildFolderOptions(node.children, level + 1);
      }
    }
  }
  
  return options;
}

function removeAddBookmarkModal() {
  const existingModal = document.querySelector('.edit-modal');
  if (existingModal) {
    existingModal.remove();
  }
}

function removeEditModal() {
  const existingModal = document.querySelector('.edit-modal');
  if (existingModal) {
    existingModal.remove();
  }
}

async function showCreateFolderModal() {
  removeEditModal();
  
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  
  // 获取书签树
  const bookmarkTree = await BookmarkUtils.getTree();
  
  modal.innerHTML = `
    <div class="edit-modal-content">
      <h3 class="edit-modal-title">新建文件夹</h3>
      <div class="edit-modal-field">
        <label class="edit-modal-label">文件夹名称</label>
        <input type="text" class="edit-modal-input" id="new-folder-title" placeholder="请输入文件夹名称">
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">存放位置</label>
        <div class="folder-tree" id="new-folder-tree">
          <!-- 文件夹树将通过 JS 渲染 -->
        </div>
        <input type="hidden" id="new-folder-parentId" value="1">
      </div>
      <div class="edit-modal-buttons">
        <button class="edit-modal-btn edit-modal-cancel">取消</button>
        <button class="edit-modal-btn edit-modal-save">创建</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 渲染文件夹树
  const folderTreeContainer = document.getElementById('new-folder-tree');
  if (bookmarkTree && bookmarkTree.length > 0 && bookmarkTree[0].children) {
    const treeUl = document.createElement('ul');
    treeUl.className = 'folder-tree-list';
    
    for (const root of bookmarkTree[0].children) {
      const isFolder = !root.url;
      if (isFolder) {
        const li = createFolderTreeNode(root, 0, '1');
        treeUl.appendChild(li);
      }
    }
    
    folderTreeContainer.appendChild(treeUl);
  }
  
  // 聚焦到名称输入框
  const titleInput = document.getElementById('new-folder-title');
  titleInput.focus();
  
  // 取消按钮
  modal.querySelector('.edit-modal-cancel').addEventListener('click', () => {
    removeEditModal();
  });
  
  // 创建按钮
  modal.querySelector('.edit-modal-save').addEventListener('click', async () => {
    const title = document.getElementById('new-folder-title').value.trim();
    const parentId = document.getElementById('new-folder-parentId').value;

    if (!title) {
      alert(I18n.t('common.enterFolderName'));
      return;
    }

    try {
      await BookmarkUtils.create({
        parentId,
        title
      });
      await loadBookmarkTree();
      removeEditModal();
    } catch (error) {
      console.error('创建文件夹失败:', error);
      alert(I18n.t('common.createFolderFailedRetry'));
    }
  });
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      modal.querySelector('.edit-modal-save').click();
    }
  });
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeEditModal();
    }
  });
}

function toggleFolder(folderId) {
  if (expandedFolders.has(folderId)) {
    expandedFolders.delete(folderId);
  } else {
    expandedFolders.add(folderId);
  }
  renderBookmarkTree();
}

function openBookmark(url) {
  if (url) {
    browser.tabs.create({ url });
  }
}

// 显示右键菜单
function showContextMenu(e, node, isFolder) {
  // 移除已存在的菜单
  removeContextMenu();

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.style.zIndex = '10000';

  // 检查是否在常用列表中
  const isInFrequentlyUsed = node.parentId === 'frequently-used' || 
                              (frequentlyUsedData && frequentlyUsedData.some(item => item.url === node.url));

  // 检查是否已置顶
  const currentUrl = node.url;
  const isPinned = window.frequentlyUsedConfig && 
                   window.frequentlyUsedConfig.pinned && 
                   window.frequentlyUsedConfig.pinned.some(pinnedItem => {
                     const pinnedUrl = typeof pinnedItem === 'string' ? pinnedItem : pinnedItem.url;
                     return pinnedUrl === currentUrl;
                   });

  // 书签选项（非文件夹且有URL）
  if (!isFolder && node.url) {
    // 置顶选项
    let pinText = '';
    if (isPinned) {
      pinText = '📌 ' + I18n.t('common.unpin');
    } else if (isInFrequentlyUsed) {
      pinText = '📌 ' + I18n.t('common.pin');
    } else {
      pinText = '📌 ' + I18n.t('pinned.addToFrequent');
    }

    const pinItem = document.createElement('div');
    pinItem.className = 'context-menu-item';
    pinItem.textContent = pinText;
    pinItem.addEventListener('click', async () => {
      if (isPinned) {
        await FrequentlyUsedConfig.unpinUrl(node.url);
      } else {
        await FrequentlyUsedConfig.pinUrl(node.url, node.title);
      }
      await refreshFrequentlyUsed();
      removeContextMenu();
    });
    menu.appendChild(pinItem);
    
    // 添加分隔线
    const separator1 = document.createElement('div');
    separator1.className = 'context-menu-separator';
    menu.appendChild(separator1);
  }

  // 修改选项（书签才有）
  if (!isFolder) {
    const editItem = document.createElement('div');
    editItem.className = 'context-menu-item';
    editItem.textContent = '✏️ ' + I18n.t('common.edit');
    editItem.addEventListener('click', () => {
      showEditModal(node);
      removeContextMenu();
    });
    menu.appendChild(editItem);

    // 添加分隔线
    const separator2 = document.createElement('div');
    separator2.className = 'context-menu-separator';
    menu.appendChild(separator2);
  }

  // 删除选项
  const deleteItem = document.createElement('div');
  deleteItem.className = 'context-menu-item danger';
  deleteItem.textContent = '🗑️ ' + I18n.t('common.delete');
  deleteItem.addEventListener('click', () => {
    console.log('删除菜单点击:', { id: node.id, title: node.title, isFolder });
    deleteBookmarkOrFolder(node.id, node.title, isFolder);
    removeContextMenu();
  });

  menu.appendChild(deleteItem);
  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  const closeMenu = (event) => {
    if (!menu.contains(event.target)) {
      removeContextMenu();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 100);
}

// 显示修改对话框
async function showEditModal(node) {
  // 移除已存在的对话框
  removeEditModal();

  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  
  // 获取书签树
  const bookmarkTree = await BookmarkUtils.getTree();
  
  modal.innerHTML = `
    <div class="edit-modal-content">
      <h3 class="edit-modal-title">${I18n.t('common.editBookmark')}</h3>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.name')}</label>
        <input type="text" class="edit-modal-input" id="edit-title-input" value="${node.title || ''}">
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.url')}</label>
        <input type="text" class="edit-modal-input" id="edit-url-input" value="${node.url || ''}">
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">${I18n.t('common.folder')}</label>
        <div class="folder-tree" id="edit-folder-tree">
          <!-- 文件夹树将通过 JS 渲染 -->
        </div>
        <input type="hidden" id="edit-folder-parentId" value="${node.parentId || '1'}">
      </div>
      <div class="edit-modal-buttons">
        <button class="edit-modal-btn edit-modal-cancel">${I18n.t('common.cancel')}</button>
        <button class="edit-modal-btn edit-modal-save">${I18n.t('common.save')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // 渲染文件夹树
  const folderTreeContainer = document.getElementById('edit-folder-tree');
  if (bookmarkTree && bookmarkTree.length > 0 && bookmarkTree[0].children) {
    const treeUl = document.createElement('ul');
    treeUl.className = 'folder-tree-list';
    
    for (const root of bookmarkTree[0].children) {
      const isFolder = !root.url;
      if (isFolder) {
        const li = createFolderTreeNode(root, 0, node.parentId);
        treeUl.appendChild(li);
      }
    }
    
    folderTreeContainer.appendChild(treeUl);
  }

  // 聚焦到名称输入框
  const titleInput = document.getElementById('edit-title-input');
  titleInput.focus();
  titleInput.select();

  // 取消按钮
  modal.querySelector('.edit-modal-cancel').addEventListener('click', () => {
    removeEditModal();
  });

  // 保存按钮
  modal.querySelector('.edit-modal-save').addEventListener('click', async () => {
    const newTitle = document.getElementById('edit-title-input').value.trim();
    const newUrl = document.getElementById('edit-url-input').value.trim();
    const newParentId = document.getElementById('edit-folder-parentId').value;

    if (!newTitle) {
      alert(I18n.t('sidebar.enterBookmarkName'));
      return;
    }

    if (!newUrl) {
      alert(I18n.t('sidebar.invalidUrl'));
      return;
    }

    try {
      // 更新书签信息和文件夹
      await BookmarkUtils.update(node.id, {
        title: newTitle,
        url: newUrl
      });

      // 如果需要移动文件夹
      if (newParentId && newParentId !== node.parentId) {
        await browser.bookmarks.move(node.id, { parentId: newParentId });
      }

      await loadBookmarkTree();
      removeEditModal();
    } catch (error) {
      console.error('修改书签失败:', error);
      alert(I18n.t('sidebar.editFailed'));
    }
  });

  // 按 Enter 保存
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      modal.querySelector('.edit-modal-save').click();
    }
  });

  // 按 Esc 取消
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeEditModal();
    }
  });
}

// 移除右键菜单
function removeContextMenu() {
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
}

// 删除书签或文件夹
async function deleteBookmarkOrFolder(id, title, isFolder) {
  // 检查是否是系统根文件夹（Firefox 的 GUID 格式）
  const systemFolders = ['root________', 'menu________', 'toolbar_____', 'unfiled_____'];
  if (systemFolders.includes(id)) {
    alert(I18n.t('sidebar.systemFolderDelete'));
    return;
  }

  // 使用自定义确认对话框
  const confirmed = await showConfirmDialog(
    isFolder ? I18n.t('confirm.deleteFolder', { name: title }) : I18n.t('confirm.deleteBookmark', { name: title })
  );

  if (!confirmed) {
    return;
  }

  try {
    if (isFolder) {
      // 文件夹使用 removeTree 递归删除
      await BookmarkUtils.removeTree(id);
    } else {
      // 书签使用 remove
      await BookmarkUtils.remove(id);
    }
    await loadBookmarkTree();
  } catch (error) {
    console.error('删除失败:', error);
    alert(I18n.t('sidebar.deleteFailed') + ': ' + (error.message || I18n.t('common.tryAgain')));
  }
}

// 显示自定义确认对话框
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    // 检查是否已存在对话框
    const existingDialog = document.querySelector('.confirm-dialog-overlay');
    if (existingDialog) {
      existingDialog.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-message">${message}</div>
        <div class="confirm-buttons">
          <button class="confirm-cancel">${I18n.t('common.cancel')}</button>
          <button class="confirm-ok">${I18n.t('common.ok')}</button>
        </div>
      </div>
    `;

    const cancelBtn = overlay.querySelector('.confirm-cancel');
    const okBtn = overlay.querySelector('.confirm-ok');

    cancelBtn.addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });

    okBtn.addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });

    document.body.appendChild(overlay);
  });
}

// 拖拽相关变量
let draggedNode = null;
let draggedElement = null;
let dropZone = null; // 'top', 'bottom', 'inside'

// 拖拽开始
function handleDragStart(e) {
  draggedNode = this.__node;
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: this.__node.id,
    type: this.__node.url ? 'bookmark' : 'folder'
  }));
  
  // 设置拖拽图片，避免默认透明效果
  const dragImage = this.cloneNode(true);
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px';
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 50, 25);
  setTimeout(() => dragImage.remove(), 0);
}

// 拖拽结束
function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedNode = null;
  draggedElement = null;
  dropZone = null;
  document.querySelectorAll('.tree-node-content').forEach(el => {
    el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom', 'drag-over-inside');
  });
}

// 拖拽经过
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const rect = this.getBoundingClientRect();
  const isTargetFolder = this.__node && !this.__node.url;
  
  // 计算拖拽位置：顶部 25%、中间 50%、底部 25%
  const topThreshold = rect.top + rect.height * 0.25;
  const bottomThreshold = rect.top + rect.height * 0.75;
  
  this.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
  
  // 如果是文件夹，且鼠标在中间 50% 区域，显示"移入文件夹"效果
  if (isTargetFolder && e.clientY >= topThreshold && e.clientY <= bottomThreshold) {
    this.classList.add('drag-over-inside');
    dropZone = 'inside';
    e.dataTransfer.dropEffect = 'move';
  } else if (e.clientY < topThreshold) {
    // 顶部区域
    this.classList.add('drag-over-top');
    dropZone = 'top';
    e.dataTransfer.dropEffect = 'move';
  } else if (e.clientY > bottomThreshold) {
    // 底部区域
    this.classList.add('drag-over-bottom');
    dropZone = 'bottom';
    e.dataTransfer.dropEffect = 'move';
  } else if (isTargetFolder) {
    // 文件夹但不在中间区域，也允许放置
    dropZone = 'inside';
    e.dataTransfer.dropEffect = 'move';
  }

  return false;
}

// 拖拽离开
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
}

// 拖拽放下
async function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  // 立即保存节点引用，避免被 handleDragEnd 清空
  const nodeToDrag = draggedNode;
  const targetElement = this;
  const targetNode = this.__node;
  const currentDropZone = dropZone;

  console.log('=== 拖拽开始 ===');
  console.log('nodeToDrag:', nodeToDrag);
  console.log('targetElement:', targetElement);
  console.log('targetNode:', targetNode);
  console.log('currentDropZone:', currentDropZone);

  if (!nodeToDrag || !targetNode) {
    console.error('拖拽节点或目标节点不存在');
    console.error('nodeToDrag:', nodeToDrag, 'targetNode:', targetNode);
    return;
  }

  const isTargetFolder = !targetNode.url;

  // 如果 dropZone 未设置，根据鼠标位置判断
  let finalDropZone = currentDropZone;
  if (!finalDropZone) {
    const rect = targetElement.getBoundingClientRect();
    const topThreshold = rect.top + rect.height * 0.25;
    const bottomThreshold = rect.top + rect.height * 0.75;
    
    if (isTargetFolder && e.clientY >= topThreshold && e.clientY <= bottomThreshold) {
      finalDropZone = 'inside';
    } else if (e.clientY < topThreshold) {
      finalDropZone = 'top';
    } else {
      finalDropZone = 'bottom';
    }
  }

  console.log('最终 dropZone:', finalDropZone);
  console.log('拖拽:', nodeToDrag.title, '(ID:', nodeToDrag.id + ')');
  console.log('目标:', targetNode.title, '(ID:', targetNode.id + ')');

  // 不能拖拽到自己身上
  if (nodeToDrag.id === targetNode.id) {
    console.log('不能拖拽到自己身上');
    return;
  }

  // 文件夹不能拖拽到自己的子目录中
  if (!nodeToDrag.url && isDescendant(targetNode, nodeToDrag)) {
    console.log('不能拖拽到子目录中');
    return;
  }

  try {
    // 根据 dropZone 决定操作
    if (finalDropZone === 'inside' && isTargetFolder) {
      // 移入文件夹内部
      console.log('>> 操作：移入文件夹', targetNode.id);
      expandedFolders.add(targetNode.id);
      await BookmarkUtils.move(nodeToDrag.id, {
        parentId: targetNode.id,
        index: 0
      });
      console.log('>> 移动成功');
    } else {
      // 移动到目标之前或之后
      const dropPosition = finalDropZone === 'top' ? 'before' : 'after';
      console.log('>> 操作：移动到目标', dropPosition);
      
      // 查找目标节点的父节点
      let parent = await findParent(targetNode.id);
      
      console.log('findParent 结果:', parent);
      
      // 如果找不到父节点，说明目标是根节点，需要从根节点查找
      if (!parent) {
        console.log('findParent 返回 null，尝试从根节点查找');
        const tree = await BookmarkUtils.getTree();
        console.log('书签树:', tree);
        
        for (const root of tree) {
          console.log('检查根节点:', root.id, root.title);
          if (root.id === targetNode.id) {
            console.log('目标是根节点');
            parent = { id: root.id, children: root.children };
            break;
          }
          if (root.children) {
            const found = root.children.find(c => c.id === targetNode.id);
            if (found) {
              console.log('目标是根节点的直接子节点');
              parent = root;
              break;
            }
          }
        }
      }
      
      console.log('最终父节点:', parent);
      
      if (parent) {
        console.log('父节点 ID:', parent.id);
        console.log('父节点 children:', parent.children);
        
        const siblings = parent.children || [];
        console.log('兄弟节点数量:', siblings.length);
        
        const targetIndex = siblings.findIndex(s => {
          console.log('检查节点:', s ? s.id : 'null', s ? s.title : 'null');
          return s && s.id === targetNode.id;
        });
        
        console.log('目标索引:', targetIndex);
        
        if (targetIndex === -1) {
          console.error(I18n.t('sidebar.targetNotFound'));
          alert(I18n.t('sidebar.targetNotFound'));
          return;
        }
        
        let newIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;
        console.log('新索引 (调整前):', newIndex);

        // 如果拖拽项在目标之前，需要调整索引
        const draggedIndex = siblings.findIndex(s => s && s.id === nodeToDrag.id);
        console.log('拖拽项索引:', draggedIndex);
        
        if (draggedIndex !== -1 && draggedIndex < newIndex) {
          newIndex--;
          console.log('新索引 (调整后):', newIndex);
        }

        console.log('>> 执行移动：parentId =', parent.id, ', index =', newIndex);
        
        await BookmarkUtils.move(nodeToDrag.id, {
          parentId: parent.id,
          index: newIndex
        });
        
        console.log('>> 移动完成');
      } else {
        console.error(I18n.t('sidebar.targetLocationNotFound'));
        alert(I18n.t('sidebar.targetLocationNotFound'));
      }
    }

    console.log('>> 重新加载书签树');
    await loadBookmarkTree();
    console.log('=== 拖拽完成 ===');
  } catch (error) {
    console.error(I18n.t('sidebar.dragFailed') + ':', error);
    console.error('错误堆栈:', error.stack);
    alert(I18n.t('sidebar.dragFailed') + '：' + error.message);
  }

  targetElement.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
}

// 检查是否是后代节点
function isDescendant(parent, child) {
  if (!parent.children || parent.children.length === 0) {
    return false;
  }

  for (const node of parent.children) {
    if (node.id === child.id) {
      return true;
    }
    if (isDescendant(node, child)) {
      return true;
    }
  }

  return false;
}

// 查找父节点
async function findParent(nodeId) {
  const tree = await BookmarkUtils.getTree();
  
  function search(nodes, parent) {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return parent;
      }
      if (node.children && node.children.length > 0) {
        const result = search(node.children, node);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  for (const root of tree) {
    const result = search(root.children || [], root);
    if (result) {
      return result;
    }
  }

  return null;
}

async function renderSearchResults() {
  const container = document.getElementById('bookmark-tree');
  const emptyState = document.getElementById('empty-state');

  try {
    // 1. 使用 Firefox API 搜索标题和 URL
    const browserResults = await BookmarkUtils.search(currentSearchQuery);
    
    // 2. 搜索标签（完整匹配）
    const tagBookmarkIds = await BookmarkTags.searchTags(currentSearchQuery);
    
    // 3. 获取标签搜索结果的书签详情
    const tagResults = [];
    for (const id of tagBookmarkIds) {
      try {
        const bookmarks = await browser.bookmarks.get(id);
        if (bookmarks && bookmarks.length > 0 && bookmarks[0].url) {
          tagResults.push(bookmarks[0]);
        }
      } catch (error) {
        // 书签可能已被删除
      }
    }
    
    // 4. 合并结果并去重
    const seenIds = new Set();
    const allResults = [];
    
    // 先添加浏览器 API 结果
    browserResults.filter(n => n.url).forEach(bookmark => {
      if (!seenIds.has(bookmark.id)) {
        seenIds.add(bookmark.id);
        allResults.push(bookmark);
      }
    });
    
    // 再添加标签搜索结果
    tagResults.forEach(bookmark => {
      if (!seenIds.has(bookmark.id)) {
        seenIds.add(bookmark.id);
        allResults.push(bookmark);
      }
    });
    
    container.innerHTML = '';
    
    if (allResults.length === 0) {
      emptyState.querySelector('div:last-child').textContent = I18n.t('common.noResults');
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    allResults.forEach(node => {
      const li = document.createElement('li');
      li.className = 'tree-node';

      const content = document.createElement('div');
      content.className = 'tree-node-content';
      content.style.height = `var(--bookmark-height, 32px)`;

      const spacer = document.createElement('span');
      spacer.className = 'tree-toggle empty';

      const icon = FaviconService.createIconElement(node.url, false, false);

      const title = document.createElement('span');
      title.className = 'tree-title';
      title.textContent = node.title || I18n.t('common.noTitle');
      title.title = `${node.title}\n${node.url}`;

      content.appendChild(spacer);
      content.appendChild(icon);
      content.appendChild(title);

      content.addEventListener('click', () => openBookmark(node.url));
      li.appendChild(content);
      container.appendChild(li);
    });
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

function showEmptyState(message) {
  const container = document.getElementById('bookmark-tree');
  const emptyState = document.getElementById('empty-state');
  container.innerHTML = '';
  emptyState.querySelector('div:last-child').textContent = message;
  emptyState.style.display = 'flex';
}

// ============================================
// 菜单面板功能
// ============================================

function setupTabSwitcher() {
  const tabBookmarks = document.getElementById('tab-bookmarks');
  const tabHistory = document.getElementById('tab-history');

  tabBookmarks.addEventListener('click', () => switchTab('bookmarks'));
  tabHistory.addEventListener('click', () => switchTab('history'));
}

function switchTab(tabName) {
  currentTab = tabName;

  const tabBookmarks = document.getElementById('tab-bookmarks');
  const tabHistory = document.getElementById('tab-history');
  const bookmarkPanel = document.getElementById('bookmark-panel');
  const historyPanel = document.getElementById('history-panel');
  const searchBox = document.getElementById('search-box');
  const sidebarFooter = document.getElementById('sidebar-footer');

  if (tabName === 'bookmarks') {
    tabBookmarks.classList.add('active');
    tabHistory.classList.remove('active');
    bookmarkPanel.classList.add('active');
    bookmarkPanel.classList.remove('hidden');
    historyPanel.classList.remove('active');
    historyPanel.classList.add('hidden');
    searchBox.style.display = 'block';
    sidebarFooter.style.display = 'flex';
  } else {
    tabBookmarks.classList.remove('active');
    tabHistory.classList.add('active');
    bookmarkPanel.classList.remove('active');
    bookmarkPanel.classList.add('hidden');
    historyPanel.classList.add('active');
    historyPanel.classList.remove('hidden');
    searchBox.style.display = 'none';
    sidebarFooter.style.display = 'none';

    if (historyData.length === 0) {
      loadHistoryData();
    }
  }
}

async function loadHistoryData() {
  try {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    historyData = await browser.history.search({
      text: '',
      startTime: oneWeekAgo,
      maxResults: 100
    });
    renderHistoryPanel();
  } catch (error) {
    console.error('加载历史记录失败:', error);
  }
}

function renderHistoryPanel() {
  const historyList = document.getElementById('history-list');
  const emptyState = document.getElementById('history-empty-state');

  historyList.innerHTML = '';

  if (historyData.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  historyData.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';

    const favicon = FaviconService.createIconElement(item.url);

    const title = document.createElement('span');
    title.className = 'history-title';
    title.textContent = item.title || item.url;

    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = formatHistoryTime(item.lastVisitTime);

    li.appendChild(favicon);
    li.appendChild(title);
    li.appendChild(time);

    li.addEventListener('click', () => {
      browser.tabs.create({ url: item.url });
    });

    historyList.appendChild(li);
  });
}

function formatHistoryTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  } else if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前';
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

function setupMenuPanel() {
  const menuBtn = document.getElementById('menu-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const frequentlyUsedToggle = document.getElementById('frequently-used-toggle');

  // 菜单按钮点击事件
  menuBtn.addEventListener('click', toggleMenuPanel);

  // 主题切换
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      Storage.set({ 'bookmark_manager_theme': newTheme });
      
      // 更新开关 UI
      if (newTheme === 'dark') {
        themeToggle.classList.add('active');
      } else {
        themeToggle.classList.remove('active');
      }
    }, true);
  }

  // 常用目录切换
  if (frequentlyUsedToggle) {
    frequentlyUsedToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const config = await FrequentlyUsedConfig.getConfig();
        const newEnabled = !config.enabled;
        
        await FrequentlyUsedConfig.updateConfig('enabled', newEnabled);
        
        // 立即重新加载配置和刷新界面
        await loadFrequentlyUsedConfig();
        await refreshFrequentlyUsed();
      } catch (error) {
        console.error('切换常用目录失败:', error);
      }
    }, true);
  }

  // 菜单项点击事件
  document.getElementById('menu-settings').addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('manager/settings.html')
    });
    closeMenuPanel();
  });
}

function toggleMenuPanel() {
  isMenuOpen = !isMenuOpen;
  const menuBtn = document.getElementById('menu-btn');
  const bookmarkPanel = document.getElementById('bookmark-panel');
  const historyPanel = document.getElementById('history-panel');
  const menuPanel = document.getElementById('menu-panel');
  const searchBox = document.getElementById('search-box');
  const sidebarFooter = document.getElementById('sidebar-footer');

  if (isMenuOpen) {
    menuBtn.textContent = '✕';
    menuBtn.classList.add('active');
    menuBtn.title = I18n.t('common.back');
    bookmarkPanel.classList.remove('active');
    historyPanel.classList.remove('active');
    menuPanel.classList.add('active');
    searchBox.style.display = 'none';
    sidebarFooter.style.display = 'none';
  } else {
    menuBtn.textContent = '⋮';
    menuBtn.classList.remove('active');
    menuBtn.title = I18n.t('common.menu');

    // 根据当前标签页恢复对应面板
    if (currentTab === 'bookmarks') {
      bookmarkPanel.classList.add('active');
      searchBox.style.display = 'block';
      sidebarFooter.style.display = 'flex';
    } else {
      historyPanel.classList.add('active');
      searchBox.style.display = 'none';
      sidebarFooter.style.display = 'none';
    }
    
    menuPanel.classList.remove('active');
  }
}

function closeMenuPanel() {
  if (isMenuOpen) {
    toggleMenuPanel();
  }
}

function updateThemeToggleUI(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  if (theme === 'dark') {
    themeToggle.classList.add('active');
  } else {
    themeToggle.classList.remove('active');
  }
}

// 兼容旧函数名
const updateThemeToggleUIAlias = updateThemeToggleUI;

async function performBackup() {
  const btn = document.getElementById('btn-backup');
  const status = document.getElementById('backup-status');

  // 检查是否配置了 WebDAV
  const result = await Storage.get('webdavConfig');
  if (!result.webdavConfig || !result.webdavConfig.enabled) {
    status.textContent = I18n.t('webdav.enableFirst');
    status.style.color = 'var(--error-color, #ef4444)';
    setTimeout(() => {
      status.textContent = '';
      status.style.color = '';
    }, 3000);
    return;
  }

  btn.disabled = true;
  status.textContent = I18n.t('backup.backingUp');
  status.style.color = 'var(--text-secondary, #64748b)';

  try {
    const response = await browser.runtime.sendMessage({ action: 'backup' });

    if (response.success) {
      status.textContent = I18n.t('backup.backupSuccess');
      status.style.color = 'var(--success-color, #10b981)';
    } else {
      status.textContent = I18n.t('backup.backupFailed') + ': ' + response.error;
      status.style.color = 'var(--error-color, #ef4444)';
    }
  } catch (error) {
    status.textContent = I18n.t('backup.backupFailed') + ': ' + error.message;
    status.style.color = 'var(--error-color, #ef4444)';
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      status.textContent = '';
      status.style.color = '';
    }, 5000);
  }
}

// ============================================
// 布局设置
// ============================================

async function loadLayoutSettings() {
  try {
    const result = await Storage.get('layoutSettings');
    const settings = result.layoutSettings || {
      bookmarkHeight: 30,
      treeIndent: 5,
      bookmarkIndent: 5
    };

    // 应用 CSS 变量
    document.documentElement.style.setProperty('--bookmark-height', `${settings.bookmarkHeight}px`);
    document.documentElement.style.setProperty('--tree-indent', `${settings.treeIndent}px`);
    document.documentElement.style.setProperty('--bookmark-indent', `${settings.bookmarkIndent}px`);
  } catch (error) {
    console.error('加载布局设置失败:', error);
  }
}

// ============================================
// 事件监听
// ============================================

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', Utils.debounce(async (e) => {
    currentSearchQuery = e.target.value.trim();
    renderBookmarkTree();
  }, 300));

  document.getElementById('btn-open-manager').addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('manager/manager.html')
    });
  });

  document.getElementById('btn-new-folder').addEventListener('click', async () => {
    showCreateFolderModal();
  });

  // 备份按钮
  document.getElementById('btn-backup').addEventListener('click', performBackup);

  // 监听 Firefox 书签变化，实时更新界面（使用防抖避免频繁刷新）
  const debouncedReload = Utils.debounce(() => loadBookmarkTree(), 300);
  browser.bookmarks.onCreated.addListener(debouncedReload);
  browser.bookmarks.onRemoved.addListener(debouncedReload);
  browser.bookmarks.onChanged.addListener(debouncedReload);
  browser.bookmarks.onMoved.addListener(debouncedReload);
  
  // 监听设置变化，重新加载常用配置
  browser.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'local' && changes[FrequentlyUsedConfig.STORAGE_KEY]) {
      console.log('检测到常用目录配置变化');
      await loadFrequentlyUsedConfig();
      await refreshFrequentlyUsed();
    }
    
    // 监听主题变化，同步更新开关状态
    if (namespace === 'local' && changes['bookmark_manager_theme']) {
      const newTheme = changes['bookmark_manager_theme'].newValue;
      updateThemeToggleUI(newTheme);
    }
  });
}
