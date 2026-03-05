/**
 * 管理器脚本
 */

const state = {
  currentFolderId: '1',
  bookmarks: [],
  folders: [],
  selectedIds: new Set(),
  viewMode: 'list',
  lastSelectedIndex: -1,
  currentBookmark: null,
  draggedItem: null,
  draggedIndex: -1,
  expandedFolders: new Set(['1', '2']) // 默认展开书签栏和其他书签
};

document.addEventListener('DOMContentLoaded', async () => {
  // 初始化主题
  ThemeManager.init();

  await loadFolderTree();
  await loadBookmarks('1');
  setupEventListeners();
});

async function loadFolderTree() {
  const container = document.getElementById('folder-tree');

  try {
    const tree = await BookmarkUtils.getTree();
    container.innerHTML = '';

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';

    tree.forEach(node => {
      if (node.children) {
        node.children.forEach(child => {
          const childNode = createFolderNode(child);
          if (childNode) {
            ul.appendChild(childNode);
          }
        });
      }
    });

    container.appendChild(ul);
  } catch (error) {
    console.error('加载文件夹失败:', error);
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">加载失败，请刷新重试</div>';
  }
}

function createFolderNode(node) {
  const li = document.createElement('li');
  const isFolder = !node.url;

  // 如果不是文件夹，返回 null
  if (!isFolder) return null;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = state.expandedFolders.has(node.id);

  const content = document.createElement('div');
  content.className = 'tree-node-content';
  content.dataset.id = node.id;
  if (node.id === state.currentFolderId) {
    content.classList.add('active');
  }

  // 折叠/展开按钮
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
    toggleFolderExpand(node.id);
  });
  content.appendChild(toggle);

  const icon = FaviconService.createIconElement(null, true, isExpanded);
  content.appendChild(icon);

  const label = document.createElement('span');
  label.className = 'tree-label';
  label.textContent = node.title || '未命名文件夹';
  content.appendChild(label);

  content.addEventListener('click', () => {
    state.currentFolderId = node.id;
    loadBookmarks(node.id);
    updateActiveFolder();
  });

  // 添加拖放事件监听 - 允许拖拽书签到此文件夹
  content.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    content.classList.add('drag-over-folder');
  });

  content.addEventListener('dragleave', () => {
    content.classList.remove('drag-over-folder');
  });

  content.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    content.classList.remove('drag-over-folder');

    // 获取拖拽的书签ID
    const bookmarkId = e.dataTransfer.getData('bookmark/id');
    if (bookmarkId && node.id !== state.currentFolderId) {
      try {
        await BookmarkUtils.move(bookmarkId, {
          parentId: node.id
        });
        // 重新加载当前文件夹的书签列表
        await loadBookmarks(state.currentFolderId);
      } catch (error) {
        console.error('移动书签失败:', error);
      }
    }
  });

  li.appendChild(content);

  if (hasChildren && isExpanded) {
    const childrenUl = document.createElement('ul');
    childrenUl.className = 'tree-children expanded';
    childrenUl.style.marginLeft = '24px';
    childrenUl.style.listStyle = 'none';

    node.children.forEach(child => {
      // 只递归处理文件夹节点
      const childNode = createFolderNode(child);
      if (childNode) {
        childrenUl.appendChild(childNode);
      }
    });

    if (childrenUl.childNodes.length > 0) {
      li.appendChild(childrenUl);
    }
  }

  return li;
}

function toggleFolderExpand(folderId) {
  if (state.expandedFolders.has(folderId)) {
    state.expandedFolders.delete(folderId);
  } else {
    state.expandedFolders.add(folderId);
  }
  // 重新渲染文件夹树
  loadFolderTree();
}

function updateActiveFolder() {
  document.querySelectorAll('.tree-node-content').forEach(item => {
    item.classList.toggle('active', item.dataset.id === state.currentFolderId);
  });
}

async function loadBookmarks(folderId) {
  try {
    const children = await BookmarkUtils.getChildren(folderId);
    state.folders = children.filter(item => !item.url); // 文件夹
    state.bookmarks = children.filter(item => item.url); // 书签

    renderBookmarks();
    updateBreadcrumb(folderId);
  } catch (error) {
    console.error('加载书签失败:', error);
  }
}

function renderBookmarks() {
  const folders = state.folders;
  const bookmarks = state.bookmarks;
  const emptyState = document.getElementById('empty-state');
  const listEl = document.getElementById('bookmark-list');
  const gridEl = document.getElementById('bookmark-grid');

  if (folders.length === 0 && bookmarks.length === 0) {
    emptyState.style.display = 'flex';
    listEl.style.display = 'none';
    gridEl.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';

  listEl.innerHTML = '';
  gridEl.innerHTML = '';

  // 先渲染文件夹
  folders.forEach((folder, index) => {
    listEl.appendChild(createFolderRow(folder, index));
    gridEl.appendChild(createFolderCard(folder, index));
  });

  // 再渲染书签
  bookmarks.forEach((bookmark, index) => {
    listEl.appendChild(createBookmarkRow(bookmark, folders.length + index));
    gridEl.appendChild(createBookmarkCard(bookmark, folders.length + index));
  });

  updateViewDisplay();
}

function createBookmarkRow(bookmark, index) {
  const li = document.createElement('li');
  li.className = 'bookmark-row';
  li.dataset.id = bookmark.id;
  li.dataset.index = index;
  li.draggable = true;

  if (state.selectedIds.has(bookmark.id)) {
    li.classList.add('selected');
  }

  // 拖拽手柄
  const dragHandle = document.createElement('span');
  dragHandle.className = 'drag-handle';
  dragHandle.textContent = '⋮⋮';
  dragHandle.style.cursor = 'move';
  dragHandle.style.color = 'var(--text-tertiary)';
  dragHandle.style.marginRight = '8px';
  dragHandle.style.userSelect = 'none';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'bookmark-checkbox';
  checkbox.checked = state.selectedIds.has(bookmark.id);
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSelection(bookmark.id, index, e.shiftKey);
  });

  const favicon = FaviconService.createManagerIconElement(bookmark.url);

  const info = document.createElement('div');
  info.className = 'bookmark-info';

  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title || '未命名书签';

  const url = document.createElement('div');
  url.className = 'bookmark-url';
  url.textContent = bookmark.url;

  info.appendChild(title);
  info.appendChild(url);

  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete';
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = '删除';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteBookmark(bookmark.id);
  });

  actions.appendChild(deleteBtn);

  li.appendChild(dragHandle);
  li.appendChild(checkbox);
  li.appendChild(favicon);
  li.appendChild(info);
  li.appendChild(actions);

  // 拖拽事件
  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragend', handleDragEnd);
  li.addEventListener('dragover', handleDragOver);
  li.addEventListener('drop', handleDrop);
  li.addEventListener('dragenter', handleDragEnter);
  li.addEventListener('dragleave', handleDragLeave);

  li.addEventListener('click', (e) => {
    // 如果点击的是复选框或删除按钮，不处理
    if (e.target.type === 'checkbox' || e.target.classList.contains('action-btn')) return;
    // Shift+点击进入选取状态，普通点击查看书签信息
    if (e.shiftKey) {
      toggleSelection(bookmark.id, index, true);
    } else {
      selectBookmark(bookmark);
    }
  });

  return li;
}

function createBookmarkCard(bookmark, index) {
  const card = document.createElement('div');
  card.className = 'bookmark-card';
  card.dataset.id = bookmark.id;
  card.dataset.index = index;

  if (state.selectedIds.has(bookmark.id)) {
    card.classList.add('selected');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'bookmark-checkbox';
  checkbox.checked = state.selectedIds.has(bookmark.id);
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSelection(bookmark.id, index, e.shiftKey);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteBookmark(bookmark.id);
  });

  const favicon = FaviconService.createManagerIconElement(bookmark.url);
  favicon.className = 'bookmark-favicon';
  // 清除内联样式，让 CSS 控制
  favicon.style.width = '';
  favicon.style.height = '';
  favicon.style.display = 'flex';
  favicon.style.alignItems = 'center';
  favicon.style.justifyContent = 'center';

  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.textContent = bookmark.title || '未命名书签';

  const url = document.createElement('div');
  url.className = 'bookmark-url';
  url.textContent = new URL(bookmark.url).hostname;

  card.appendChild(checkbox);
  card.appendChild(deleteBtn);
  card.appendChild(favicon);
  card.appendChild(title);
  card.appendChild(url);

  card.addEventListener('click', (e) => {
    // 如果点击的是复选框或删除按钮，不处理
    if (e.target.type === 'checkbox' || e.target.classList.contains('action-btn')) return;
    // Shift+点击进入选取状态，普通点击查看书签信息
    if (e.shiftKey) {
      toggleSelection(bookmark.id, index, true);
    } else {
      selectBookmark(bookmark);
    }
  });

  return card;
}

// 创建文件夹行
function createFolderRow(folder, index) {
  const li = document.createElement('li');
  li.className = 'bookmark-row folder-row';
  li.dataset.id = folder.id;
  li.dataset.index = index;

  if (state.selectedIds.has(folder.id)) {
    li.classList.add('selected');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'bookmark-checkbox';
  checkbox.checked = state.selectedIds.has(folder.id);
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSelection(folder.id, index, e.shiftKey);
  });

  const icon = FaviconService.createIconElement(null, true, false);

  const info = document.createElement('div');
  info.className = 'bookmark-info';

  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.textContent = folder.title || '未命名文件夹';

  const count = document.createElement('div');
  count.className = 'bookmark-url';
  count.textContent = `${folder.children ? folder.children.length : 0} 项`;

  info.appendChild(title);
  info.appendChild(count);

  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete';
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = '删除文件夹';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteFolder(folder.id, folder.title);
  });

  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(icon);
  li.appendChild(info);
  li.appendChild(actions);

  // 双击进入文件夹
  li.addEventListener('dblclick', () => {
    state.currentFolderId = folder.id;
    loadBookmarks(folder.id);
    updateActiveFolder();
  });

  // 单击选择或查看信息
  li.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox' || e.target.classList.contains('action-btn')) return;
    if (e.shiftKey) {
      toggleSelection(folder.id, index, true);
    } else {
      selectFolder(folder);
    }
  });

  return li;
}

// 创建文件夹卡片
function createFolderCard(folder, index) {
  const card = document.createElement('div');
  card.className = 'bookmark-card folder-card';
  card.dataset.id = folder.id;
  card.dataset.index = index;

  if (state.selectedIds.has(folder.id)) {
    card.classList.add('selected');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'bookmark-checkbox';
  checkbox.checked = state.selectedIds.has(folder.id);
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSelection(folder.id, index, e.shiftKey);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteFolder(folder.id, folder.title);
  });

  const icon = document.createElement('div');
  icon.className = 'bookmark-favicon folder-icon';
  icon.textContent = '📁';

  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.textContent = folder.title || '未命名文件夹';

  const count = document.createElement('div');
  count.className = 'bookmark-url';
  count.textContent = `${folder.children ? folder.children.length : 0} 项`;

  card.appendChild(checkbox);
  card.appendChild(deleteBtn);
  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(count);

  // 双击进入文件夹
  card.addEventListener('dblclick', () => {
    state.currentFolderId = folder.id;
    loadBookmarks(folder.id);
    updateActiveFolder();
  });

  // 单击选择或查看信息
  card.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox' || e.target.classList.contains('action-btn')) return;
    if (e.shiftKey) {
      toggleSelection(folder.id, index, true);
    } else {
      selectFolder(folder);
    }
  });

  return card;
}

function toggleSelection(id, index, shiftKey) {
  if (shiftKey && state.lastSelectedIndex !== -1) {
    const start = Math.min(state.lastSelectedIndex, index);
    const end = Math.max(state.lastSelectedIndex, index);

    // 合并文件夹和书签列表
    const allItems = [...state.folders, ...state.bookmarks];

    for (let i = start; i <= end; i++) {
      const item = allItems[i];
      if (item) {
        state.selectedIds.add(item.id);
      }
    }
  } else {
    if (state.selectedIds.has(id)) {
      state.selectedIds.delete(id);
    } else {
      state.selectedIds.add(id);
    }
    state.lastSelectedIndex = index;
  }

  updateSelectionUI();
}

function selectAll() {
  // 同时选择文件夹和书签
  state.folders.forEach(folder => {
    state.selectedIds.add(folder.id);
  });
  state.bookmarks.forEach(bookmark => {
    state.selectedIds.add(bookmark.id);
  });
  updateSelectionUI();
}

function clearSelection() {
  state.selectedIds.clear();
  state.lastSelectedIndex = -1;
  updateSelectionUI();
}

function updateSelectionUI() {
  const count = state.selectedIds.size;
  document.getElementById('selected-count').textContent = count;

  const batchToolbar = document.getElementById('batch-toolbar');
  if (count > 0) {
    batchToolbar.classList.add('visible');
  } else {
    batchToolbar.classList.remove('visible');
  }

  document.querySelectorAll('.bookmark-row, .bookmark-card').forEach(el => {
    const isSelected = state.selectedIds.has(el.dataset.id);
    el.classList.toggle('selected', isSelected);
    const checkbox = el.querySelector('.bookmark-checkbox');
    if (checkbox) checkbox.checked = isSelected;
  });
}

function selectBookmark(bookmark) {
  state.currentBookmark = bookmark;
  renderDetailPanel(bookmark);
}

function selectFolder(folder) {
  state.currentBookmark = folder;
  renderFolderDetailPanel(folder);
}

function renderFolderDetailPanel(folder) {
  const panel = document.getElementById('detail-panel');

  if (!folder) {
    panel.innerHTML = `
      <div class="empty-detail">
        <div class="empty-detail-icon">📌</div>
        <div>选择一个书签查看详情</div>
      </div>
    `;
    return;
  }

  const childCount = folder.children ? folder.children.length : 0;
  const folderCount = folder.children ? folder.children.filter(c => !c.url).length : 0;
  const bookmarkCount = childCount - folderCount;

  panel.innerHTML = `
    <div class="detail-header">文件夹详情</div>
    <div class="detail-content">
      <div class="detail-field">
        <div class="detail-label">名称</div>
        <input type="text" class="detail-input" id="detail-title" value="${folder.title || ''}">
      </div>
      <div class="detail-field">
        <div class="detail-label">包含内容</div>
        <div class="detail-value">${folderCount} 个文件夹，${bookmarkCount} 个书签</div>
      </div>
      <div class="detail-field">
        <div class="detail-label">添加时间</div>
        <div class="detail-value">${folder.dateAdded ? Utils.formatDate(folder.dateAdded) : '未知'}</div>
      </div>
      <div class="detail-actions">
        <button class="btn" id="open-folder-btn">进入文件夹</button>
        <button class="btn btn-primary" id="save-folder-btn">保存</button>
      </div>
    </div>
  `;

  document.getElementById('open-folder-btn').addEventListener('click', () => {
    state.currentFolderId = folder.id;
    loadBookmarks(folder.id);
    updateActiveFolder();
  });

  document.getElementById('save-folder-btn').addEventListener('click', async () => {
    const newTitle = document.getElementById('detail-title').value;

    await BookmarkUtils.update(folder.id, { title: newTitle });
    await loadBookmarks(state.currentFolderId);
    await loadFolderTree();

    folder.title = newTitle;
  });
}

async function deleteFolder(folderId, folderTitle) {
  const confirmed = confirm(`确定要删除文件夹"${folderTitle}"及其所有内容吗？此操作不可撤销。`);
  if (!confirmed) return;

  try {
    await BookmarkUtils.removeTree(folderId);
    state.selectedIds.delete(folderId);

    if (state.currentBookmark && state.currentBookmark.id === folderId) {
      state.currentBookmark = null;
      renderDetailPanel(null);
    }

    await loadBookmarks(state.currentFolderId);
    await loadFolderTree();
  } catch (error) {
    console.error('删除文件夹失败:', error);
    alert('删除文件夹失败');
  }
}

function renderDetailPanel(bookmark) {
  const panel = document.getElementById('detail-panel');

  if (!bookmark) {
    panel.innerHTML = `
      <div class="empty-detail">
        <div class="empty-detail-icon">📌</div>
        <div>选择一个书签查看详情</div>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="detail-header">书签详情</div>
    <div class="detail-content">
      <div class="detail-field">
        <div class="detail-label">标题</div>
        <input type="text" class="detail-input" id="detail-title" value="${bookmark.title || ''}">
      </div>
      <div class="detail-field">
        <div class="detail-label">网址</div>
        <input type="text" class="detail-input" id="detail-url" value="${bookmark.url}">
      </div>
      <div class="detail-field">
        <div class="detail-label">添加时间</div>
        <div class="detail-value">${bookmark.dateAdded ? Utils.formatDate(bookmark.dateAdded) : '未知'}</div>
      </div>
      <div class="detail-actions">
        <button class="btn" id="open-bookmark-btn">打开</button>
        <button class="btn btn-primary" id="save-bookmark-btn">保存</button>
      </div>
    </div>
  `;

  document.getElementById('open-bookmark-btn').addEventListener('click', () => {
    window.open(bookmark.url, '_blank');
  });

  document.getElementById('save-bookmark-btn').addEventListener('click', async () => {
    const newTitle = document.getElementById('detail-title').value;
    const newUrl = document.getElementById('detail-url').value;

    await BookmarkUtils.update(bookmark.id, { title: newTitle, url: newUrl });
    await loadBookmarks(state.currentFolderId);

    bookmark.title = newTitle;
    bookmark.url = newUrl;
  });
}

async function deleteBookmark(id) {
  await BookmarkUtils.remove(id);
  state.selectedIds.delete(id);

  if (state.currentBookmark && state.currentBookmark.id === id) {
    state.currentBookmark = null;
    renderDetailPanel(null);
  }

  await loadBookmarks(state.currentFolderId);
}

async function batchDelete() {
  const count = state.selectedIds.size;
  if (count === 0) return;

  // 检查是否包含文件夹
  const hasFolder = state.folders.some(f => state.selectedIds.has(f.id));
  const message = hasFolder 
    ? `确定要删除选中的 ${count} 个项目吗？文件夹及其内容都将被删除。`
    : `确定要删除选中的 ${count} 个书签吗？`;
  
  if (!confirm(message)) return;

  // 分别处理书签和文件夹
  const promises = Array.from(state.selectedIds).map(id => {
    // 检查是否是文件夹
    const isFolder = state.folders.some(f => f.id === id);
    if (isFolder) {
      return BookmarkUtils.removeTree(id);
    } else {
      return BookmarkUtils.remove(id);
    }
  });
  await Promise.all(promises);

  clearSelection();
  await loadBookmarks(state.currentFolderId);
  await loadFolderTree();
}

async function updateBreadcrumb(folderId) {
  const path = await BookmarkUtils.getPath(folderId);
  const breadcrumb = document.getElementById('breadcrumb');

  breadcrumb.innerHTML = '';
  path.forEach((node, index) => {
    if (index > 0) {
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.textContent = '›';
      breadcrumb.appendChild(separator);
    }

    const item = document.createElement('span');
    item.className = 'breadcrumb-item';
    item.dataset.id = node.id;
    item.textContent = node.title || '书签';
    item.addEventListener('click', () => {
      state.currentFolderId = node.id;
      loadBookmarks(node.id);
      updateActiveFolder();
    });
    breadcrumb.appendChild(item);
  });
}

function setViewMode(mode) {
  state.viewMode = mode;

  document.getElementById('list-view-btn').classList.toggle('active', mode === 'list');
  document.getElementById('grid-view-btn').classList.toggle('active', mode === 'grid');

  updateViewDisplay();
}

function updateViewDisplay() {
  const listEl = document.getElementById('bookmark-list');
  const gridEl = document.getElementById('bookmark-grid');

  if (state.viewMode === 'list') {
    listEl.style.display = 'block';
    gridEl.style.display = 'none';
  } else {
    listEl.style.display = 'none';
    gridEl.style.display = 'grid';
  }
}

async function handleSearch(e) {
  const query = e.target.value.trim();

  if (!query) {
    await loadBookmarks(state.currentFolderId);
    return;
  }

  const results = await BookmarkUtils.search(query);
  state.bookmarks = results.filter(n => n.url);

  renderBookmarks();
}

function showAddModal() {
  document.getElementById('add-modal').classList.add('visible');
  document.getElementById('new-bookmark-title').value = '';
  document.getElementById('new-bookmark-url').value = '';
  document.getElementById('new-bookmark-title').focus();
}

function hideAddModal() {
  document.getElementById('add-modal').classList.remove('visible');
}

async function addNewBookmark() {
  const title = document.getElementById('new-bookmark-title').value.trim();
  const url = document.getElementById('new-bookmark-url').value.trim();

  if (!title || !url) {
    alert('请填写标题和网址');
    return;
  }

  await BookmarkUtils.create({
    parentId: state.currentFolderId,
    title: title,
    url: url
  });

  hideAddModal();
  await loadBookmarks(state.currentFolderId);
}

async function createNewFolder() {
  const title = prompt('请输入文件夹名称:');
  if (title && title.trim()) {
    try {
      await BookmarkUtils.create({
        parentId: state.currentFolderId,
        title: title.trim()
      });
      // 重新加载文件夹树和书签列表
      await loadFolderTree();
      await loadBookmarks(state.currentFolderId);
    } catch (error) {
      console.error('创建文件夹失败:', error);
      alert('创建文件夹失败');
    }
  }
}

function setupEventListeners() {
  document.getElementById('search-input').addEventListener('input', Utils.debounce(handleSearch, 300));

  document.getElementById('list-view-btn').addEventListener('click', () => setViewMode('list'));
  document.getElementById('grid-view-btn').addEventListener('click', () => setViewMode('grid'));

  document.getElementById('add-bookmark-btn').addEventListener('click', showAddModal);
  document.getElementById('new-folder-btn').addEventListener('click', createNewFolder);
  document.getElementById('cancel-add-btn').addEventListener('click', hideAddModal);
  document.getElementById('confirm-add-btn').addEventListener('click', addNewBookmark);

  document.getElementById('select-all-btn').addEventListener('click', selectAll);
  document.getElementById('batch-delete-btn').addEventListener('click', batchDelete);
  document.getElementById('cancel-selection-btn').addEventListener('click', clearSelection);

  document.getElementById('add-modal').addEventListener('click', (e) => {
    if (e.target.id === 'add-modal') hideAddModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSelection();
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      selectAll();
    }
    if (e.key === 'Delete' && state.selectedIds.size > 0) {
      batchDelete();
    }
  });
}

// 拖拽排序功能
function handleDragStart(e) {
  state.draggedItem = this;
  state.draggedIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  // 设置书签ID，用于拖放到文件夹
  e.dataTransfer.setData('bookmark/id', this.dataset.id);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  state.draggedItem = null;
  state.draggedIndex = -1;

  // 移除所有拖拽相关的样式
  document.querySelectorAll('.bookmark-row').forEach(row => {
    row.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (this !== state.draggedItem) {
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    this.classList.remove('drag-over-top', 'drag-over-bottom');

    if (e.clientY < midpoint) {
      this.classList.add('drag-over-top');
    } else {
      this.classList.add('drag-over-bottom');
    }
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over-top', 'drag-over-bottom');
}

async function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (state.draggedItem !== this) {
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropIndex = parseInt(this.dataset.index);

    // 确定插入位置
    let newIndex = dropIndex;
    if (e.clientY > midpoint) {
      newIndex = dropIndex + 1;
    }

    // 调整索引（如果拖拽项在目标之前）
    if (state.draggedIndex < newIndex) {
      newIndex--;
    }

    // 执行移动
    await moveBookmark(state.draggedIndex, newIndex);
  }

  return false;
}

async function moveBookmark(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;

  const bookmark = state.bookmarks[fromIndex];
  if (!bookmark) return;

  try {
    // 使用 Chrome bookmarks API 移动书签
    await BookmarkUtils.move(bookmark.id, {
      parentId: state.currentFolderId,
      index: toIndex
    });

    // 重新加载书签列表
    await loadBookmarks(state.currentFolderId);
  } catch (error) {
    console.error('移动书签失败:', error);
  }
}
