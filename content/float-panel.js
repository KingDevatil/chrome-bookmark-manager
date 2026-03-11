(function() {
  if (window.__bookmarkFloatPanel) return;
  
  window.__bookmarkFloatPanel = true;
  
  let floatPanel = null;
  let isDragging = false;
  let isResizing = false;
  let dragOffset = { x: 0, y: 0 };
  
  async function createFloatPanel() {
    const config = await getConfig();
    
    floatPanel = document.createElement('div');
    floatPanel.id = 'bookmark-float-panel';
    floatPanel.style.cssText = `
      position: fixed;
      top: ${config.top || 50}px;
      right: ${config.right || 20}px;
      width: ${config.width || 400}px;
      height: ${config.height || 600}px;
      z-index: 2147483647;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const header = document.createElement('div');
    header.id = 'bookmark-float-header';
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      cursor: move;
      user-select: none;
      flex-shrink: 0;
    `;
    header.innerHTML = `
      <span style="font-weight: 600; font-size: 14px; color: #1e293b;">🔖 书签管理器</span>
      <button id="close-float-panel" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; line-height: 1;">×</button>
    `;
    
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      flex: 1;
      overflow: hidden;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('sidebar/sidebar.html?mode=float');
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'bookmark-float-resize';
    resizeHandle.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 6px;
      height: 100%;
      cursor: ew-resize;
      background: transparent;
    `;
    
    floatPanel.appendChild(header);
    floatPanel.appendChild(iframeContainer);
    iframeContainer.appendChild(iframe);
    floatPanel.appendChild(resizeHandle);
    document.body.appendChild(floatPanel);
    
    document.getElementById('close-float-panel').addEventListener('click', () => {
      floatPanel.style.display = 'none';
    });
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'close-float-panel') return;
      isDragging = true;
      const rect = floatPanel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      e.preventDefault();
    });
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const newRight = window.innerWidth - e.clientX + dragOffset.x - floatPanel.offsetWidth;
        floatPanel.style.right = Math.max(0, newRight) + 'px';
        floatPanel.style.top = Math.max(0, e.clientY - dragOffset.y) + 'px';
      }
      if (isResizing) {
        const rect = floatPanel.getBoundingClientRect();
        const newWidth = window.innerWidth - e.clientX - parseFloat(getComputedStyle(floatPanel).right);
        floatPanel.style.width = Math.max(280, Math.min(600, newWidth)) + 'px';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging || isResizing) {
        saveConfig();
      }
      isDragging = false;
      isResizing = false;
    });
  }
  
  async function getConfig() {
    try {
      const result = await chrome.storage.local.get('layoutSettings');
      return result.layoutSettings?.floatConfig || {};
    } catch (e) {
      return {};
    }
  }
  
  async function saveConfig() {
    if (!floatPanel) return;
    try {
      const result = await chrome.storage.local.get('layoutSettings');
      const settings = result.layoutSettings || {};
      settings.floatConfig = {
        width: floatPanel.offsetWidth,
        height: floatPanel.offsetHeight,
        top: floatPanel.offsetTop,
        right: window.innerWidth - floatPanel.offsetLeft - floatPanel.offsetWidth
      };
      await chrome.storage.local.set({ layoutSettings: settings });
    } catch (e) {
      console.error('Failed to save float config:', e);
    }
  }
  
  function toggleFloatPanel() {
    if (!floatPanel) {
      createFloatPanel();
    } else {
      floatPanel.style.display = floatPanel.style.display === 'none' ? 'flex' : 'none';
    }
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleFloatPanel') {
      toggleFloatPanel();
      sendResponse({ success: true });
    }
    return true;
  });
  
  chrome.storage.local.get('layoutSettings', (result) => {
    const displayMode = result.layoutSettings?.displayMode || 'sidebar';
    if (displayMode === 'float') {
      createFloatPanel();
    }
  });
})();
