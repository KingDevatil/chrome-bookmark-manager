/**
 * 侧边栏脚本
 */

let bookmarkTree = [];
let expandedFolders = new Set(['1', '2']);
let currentSearchQuery = '';
let isMenuOpen = false;

document.addEventListener('DOMContentLoaded', async () => {
  await ThemeManager.init();
  await loadLayoutSettings(); // 先加载布局设置，确保 CSS 变量已设置
  await loadBookmarkTree();
  setupEventListeners();
  setupMenuPanel();
});

async function loadBookmarkTree() {
  try {
    const tree = await BookmarkUtils.getTree();
    bookmarkTree = tree;
    renderBookmarkTree();
  } catch (error) {
    console.error('加载书签失败:', error);
    showEmptyState('加载失败');
  }
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

  const content = document.createElement('div');
  content.className = 'tree-node-content';
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
  title.textContent = node.title || (isFolder ? '新建文件夹' : '无标题');
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

  // 拖拽事件
  if (!isFolder || hasChildren) {
    content.draggable = true;
    content.addEventListener('dragstart', handleDragStart);
    content.addEventListener('dragend', handleDragEnd);
    content.addEventListener('dragover', handleDragOver);
    content.addEventListener('dragleave', handleDragLeave);
    content.addEventListener('drop', handleDrop);
  }

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
    chrome.tabs.create({ url });
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

  // 修改选项（书签才有）
  if (!isFolder) {
    const editItem = document.createElement('div');
    editItem.className = 'context-menu-item';
    editItem.textContent = '✏️ 修改';
    editItem.addEventListener('click', () => {
      showEditModal(node);
      removeContextMenu();
    });
    menu.appendChild(editItem);
    
    // 添加分隔线
    const separator = document.createElement('div');
    separator.className = 'context-menu-separator';
    menu.appendChild(separator);
  }

  // 删除选项
  const deleteItem = document.createElement('div');
  deleteItem.className = 'context-menu-item';
  deleteItem.textContent = '🗑️ 删除';
  deleteItem.addEventListener('click', () => {
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
function showEditModal(node) {
  // 移除已存在的对话框
  removeEditModal();

  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <div class="edit-modal-content">
      <h3 class="edit-modal-title">修改书签</h3>
      <div class="edit-modal-field">
        <label class="edit-modal-label">名称</label>
        <input type="text" class="edit-modal-input" id="edit-title-input" value="${node.title || ''}">
      </div>
      <div class="edit-modal-field">
        <label class="edit-modal-label">URL</label>
        <input type="text" class="edit-modal-input" id="edit-url-input" value="${node.url || ''}">
      </div>
      <div class="edit-modal-buttons">
        <button class="edit-modal-btn edit-modal-cancel">取消</button>
        <button class="edit-modal-btn edit-modal-save">保存</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

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

    if (!newTitle) {
      alert('请输入书签名称');
      return;
    }

    if (!newUrl) {
      alert('请输入书签 URL');
      return;
    }

    try {
      await BookmarkUtils.update(node.id, {
        title: newTitle,
        url: newUrl
      });
      await loadBookmarkTree();
      removeEditModal();
    } catch (error) {
      console.error('修改书签失败:', error);
      alert('修改失败，请重试');
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

// 移除修改对话框
function removeEditModal() {
  const existingModal = document.querySelector('.edit-modal');
  if (existingModal) {
    existingModal.remove();
  }
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
  const message = isFolder
    ? `确定要删除文件夹"${title}"及其所有内容吗？`
    : `确定要删除书签"${title}"吗？`;

  if (!confirm(message)) {
    return;
  }

  try {
    await BookmarkUtils.remove(id);
    await loadBookmarkTree();
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败，请重试');
  }
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
          console.error('找不到目标节点');
          alert('找不到目标节点');
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
        console.error('找不到父节点，无法移动');
        alert('无法找到目标位置，请重试');
      }
    }

    console.log('>> 重新加载书签树');
    await loadBookmarkTree();
    console.log('=== 拖拽完成 ===');
  } catch (error) {
    console.error('拖拽失败:', error);
    console.error('错误堆栈:', error.stack);
    alert('拖拽失败：' + error.message);
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
    const results = await BookmarkUtils.search(currentSearchQuery);
    container.innerHTML = '';

    const bookmarks = results.filter(n => n.url);
    if (bookmarks.length === 0) {
      emptyState.querySelector('div:last-child').textContent = '未找到匹配的书签';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    bookmarks.forEach(node => {
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
      title.textContent = node.title || '无标题';
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

function setupMenuPanel() {
  const menuBtn = document.getElementById('menu-btn');
  const themeToggle = document.getElementById('theme-toggle');

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

  // 初始化主题开关状态
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    themeToggle?.classList.add('active');
  } else {
    themeToggle?.classList.remove('active');
  }

  // 菜单项点击事件
  document.getElementById('menu-settings').addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('manager/settings.html')
    });
    closeMenuPanel();
  });
}

function toggleMenuPanel() {
  isMenuOpen = !isMenuOpen;
  const menuBtn = document.getElementById('menu-btn');
  const bookmarkPanel = document.getElementById('bookmark-panel');
  const menuPanel = document.getElementById('menu-panel');
  const searchBox = document.getElementById('search-box');
  const sidebarFooter = document.getElementById('sidebar-footer');

  if (isMenuOpen) {
    menuBtn.textContent = '✕';
    menuBtn.classList.add('active');
    menuBtn.title = '返回';
    bookmarkPanel.classList.remove('active');
    menuPanel.classList.add('active');
    searchBox.style.display = 'none';
    sidebarFooter.style.display = 'none';
  } else {
    menuBtn.textContent = '⋮';
    menuBtn.classList.remove('active');
    menuBtn.title = '菜单';
    bookmarkPanel.classList.add('active');
    menuPanel.classList.remove('active');
    searchBox.style.display = 'block';
    sidebarFooter.style.display = 'flex';
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
    status.textContent = '请先配置 WebDAV';
    status.style.color = 'var(--error-color, #ef4444)';
    setTimeout(() => {
      status.textContent = '';
      status.style.color = '';
    }, 3000);
    return;
  }

  btn.disabled = true;
  status.textContent = '正在备份...';
  status.style.color = 'var(--text-secondary, #64748b)';

  try {
    const response = await chrome.runtime.sendMessage({ action: 'backup' });

    if (response.success) {
      status.textContent = '备份成功!';
      status.style.color = 'var(--success-color, #10b981)';
    } else {
      status.textContent = '备份失败: ' + response.error;
      status.style.color = 'var(--error-color, #ef4444)';
    }
  } catch (error) {
    status.textContent = '备份失败: ' + error.message;
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
      bookmarkHeight: 32,
      treeIndent: 20
    };

    // 应用 CSS 变量
    document.documentElement.style.setProperty('--bookmark-height', `${settings.bookmarkHeight}px`);
    document.documentElement.style.setProperty('--tree-indent', `${settings.treeIndent}px`);
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
    chrome.tabs.create({
      url: chrome.runtime.getURL('manager/manager.html')
    });
  });

  document.getElementById('btn-new-folder').addEventListener('click', async () => {
    const title = prompt('请输入文件夹名称:');
    if (title && title.trim()) {
      try {
        await BookmarkUtils.create({
          parentId: '1',
          title: title.trim()
        });
        await loadBookmarkTree();
      } catch (error) {
        console.error('创建文件夹失败:', error);
        alert('创建文件夹失败');
      }
    }
  });

  // 备份按钮
  document.getElementById('btn-backup').addEventListener('click', performBackup);

  // 监听 Chrome 书签变化，实时更新界面（使用防抖避免频繁刷新）
  const debouncedReload = Utils.debounce(() => loadBookmarkTree(), 300);
  chrome.bookmarks.onCreated.addListener(debouncedReload);
  chrome.bookmarks.onRemoved.addListener(debouncedReload);
  chrome.bookmarks.onChanged.addListener(debouncedReload);
  chrome.bookmarks.onMoved.addListener(debouncedReload);
}
