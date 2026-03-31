/**
 * 自定义对话框组件
 * 替代浏览器原生的 confirm() 和 alert()
 * 支持多语言翻译
 */

class Dialog {
  static container = null;
  static currentResolve = null;
  static currentReject = null;

  static init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'custom-dialog-container';
    this.container.innerHTML = `
      <div class="dialog-overlay" id="dialog-overlay" style="display: none;">
        <div class="dialog-box" id="dialog-box">
          <div class="dialog-header" id="dialog-header"></div>
          <div class="dialog-body" id="dialog-body"></div>
          <div class="dialog-footer" id="dialog-footer"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    // 添加样式
    if (!document.getElementById('dialog-styles')) {
      const styles = document.createElement('style');
      styles.id = 'dialog-styles';
      styles.textContent = `
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: dialog-fade-in 0.2s ease;
        }
        
        .dialog-box {
          background: var(--bg-primary, #fff);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          min-width: 320px;
          max-width: 480px;
          width: 90%;
          animation: dialog-scale-in 0.2s ease;
        }
        
        .dialog-header {
          padding: 20px 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }
        
        .dialog-body {
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary, #64748b);
          white-space: pre-wrap;
        }
        
        .dialog-footer {
          padding: 0 20px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .dialog-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #f1f5f9);
          color: var(--text-primary, #1e293b);
          transition: all 0.2s;
        }
        
        .dialog-btn:hover {
          background: var(--bg-tertiary, #e2e8f0);
        }
        
        .dialog-btn-primary {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: #fff;
        }
        
        .dialog-btn-primary:hover {
          background: var(--primary-hover, #2563eb);
        }
        
        .dialog-btn-danger {
          background: #dc2626;
          border-color: #dc2626;
          color: #fff;
        }
        
        .dialog-btn-danger:hover {
          background: #b91c1c;
        }
        
        @keyframes dialog-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes dialog-scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* 深色模式支持 */
        @media (prefers-color-scheme: dark) {
          .dialog-box {
            background: var(--bg-primary, #1e293b);
          }
          
          .dialog-header {
            color: var(--text-primary, #f1f5f9);
          }
          
          .dialog-body {
            color: var(--text-secondary, #94a3b8);
          }
          
          .dialog-btn {
            background: var(--bg-secondary, #334155);
            border-color: var(--border-color, #475569);
            color: var(--text-primary, #f1f5f9);
          }
          
          .dialog-btn:hover {
            background: var(--bg-tertiary, #475569);
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // 点击遮罩关闭
    document.getElementById('dialog-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget && this.currentReject) {
        this.close(false);
      }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentReject) {
        this.close(false);
      }
    });
  }

  static show(options) {
    this.init();

    const {
      title = '',
      message = '',
      type = 'confirm', // 'confirm', 'alert', 'prompt'
      confirmText = I18n.t('common.ok'),
      cancelText = I18n.t('common.cancel'),
      danger = false,
      inputValue = ''
    } = options;

    const overlay = document.getElementById('dialog-overlay');
    const header = document.getElementById('dialog-header');
    const body = document.getElementById('dialog-body');
    const footer = document.getElementById('dialog-footer');

    header.textContent = title;
    
    if (type === 'prompt') {
      body.innerHTML = `
        <div style="margin-bottom: 12px;">${message}</div>
        <input type="text" id="dialog-input" class="dialog-input" value="${inputValue}" 
          style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #e2e8f0); 
          border-radius: 6px; font-size: 14px; background: var(--bg-primary, #fff); 
          color: var(--text-primary, #1e293b); box-sizing: border-box;">
      `;
    } else {
      body.textContent = message;
    }

    footer.innerHTML = '';

    if (type !== 'alert') {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'dialog-btn';
      cancelBtn.textContent = cancelText;
      cancelBtn.addEventListener('click', () => this.close(false));
      footer.appendChild(cancelBtn);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = `dialog-btn ${danger ? 'dialog-btn-danger' : 'dialog-btn-primary'}`;
    confirmBtn.textContent = confirmText;
    confirmBtn.addEventListener('click', () => this.close(true));
    footer.appendChild(confirmBtn);

    overlay.style.display = 'flex';

    if (type === 'prompt') {
      setTimeout(() => {
        const input = document.getElementById('dialog-input');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    }

    return new Promise((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;
    });
  }

  static close(result) {
    const overlay = document.getElementById('dialog-overlay');
    overlay.style.display = 'none';

    if (this.currentResolve) {
      if (result && document.getElementById('dialog-input')) {
        const input = document.getElementById('dialog-input');
        this.currentResolve(input.value);
      } else {
        this.currentResolve(result);
      }
    }

    this.currentResolve = null;
    this.currentReject = null;
  }

  // 确认对话框（替代 confirm）
  static async confirm(message, options = {}) {
    return await this.show({
      message,
      type: 'confirm',
      confirmText: options.confirmText || I18n.t('common.ok'),
      cancelText: options.cancelText || I18n.t('common.cancel'),
      danger: options.danger || false,
      ...options
    });
  }

  // 警告/提示对话框（替代 alert）
  static async alert(message, options = {}) {
    return await this.show({
      message,
      type: 'alert',
      confirmText: options.confirmText || I18n.t('common.ok'),
      ...options
    });
  }

  // 输入对话框（替代 prompt）
  static async prompt(message, defaultValue = '', options = {}) {
    return await this.show({
      message,
      type: 'prompt',
      inputValue: defaultValue,
      confirmText: options.confirmText || I18n.t('common.ok'),
      cancelText: options.cancelText || I18n.t('common.cancel'),
      ...options
    });
  }
}

// 全局函数，方便直接调用
function showConfirm(message, options) {
  return Dialog.confirm(message, options);
}

function showAlert(message, options) {
  return Dialog.alert(message, options);
}

function showPrompt(message, defaultValue, options) {
  return Dialog.prompt(message, defaultValue, options);
}
