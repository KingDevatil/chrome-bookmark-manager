# 远程代码使用声明 / Remote Code Usage Declaration

## 声明 / Declaration

**本扩展不使用任何远程代码。**

**This extension does NOT use any remote code.**

---

## 详细说明 / Detailed Explanation

### 1. 所有代码都包含在扩展程序包中 / All Code is Included in the Extension Package

本扩展的所有 JavaScript、CSS 和 Wasm 文件都直接包含在扩展程序包中，没有任何外部依赖。

All JavaScript, CSS, and Wasm files of this extension are directly included in the extension package, with no external dependencies.

#### 项目文件结构 / Project File Structure:
```
chrome-bookmark-manager/
├── manifest.json              # 扩展配置文件
├── background.js              # 后台服务脚本（本地）
├── popup.html                 # 弹出页面（本地）
├── popup.js                   # 弹出页面逻辑（本地）
├── shared/
│   ├── styles.css            # 共享样式（本地）
│   ├── utils.js              # 工具函数（本地）
│   └── favicon.js            # 图标服务（本地）
├── sidebar/
│   ├── sidebar.html          # 侧边栏页面（本地）
│   └── sidebar.js            # 侧边栏逻辑（本地）
├── manager/
│   ├── manager.html          # 管理器页面（本地）
│   ├── manager.js            # 管理器逻辑（本地）
│   ├── settings.html         # 设置页面（本地）
│   └── settings.js           # 设置逻辑（本地）
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. 所有脚本引用都是本地的 / All Script References are Local

#### popup.html:
```html
<script src="popup.js"></script>
```

#### sidebar/sidebar.html:
```html
<script src="../shared/utils.js"></script>
<script src="../shared/favicon.js"></script>
<script src="sidebar.js"></script>
```

#### manager/manager.html:
```html
<script src="../shared/utils.js"></script>
<script src="../shared/favicon.js"></script>
<script src="manager.js"></script>
```

#### manager/settings.html:
```html
<script src="../shared/utils.js"></script>
<script src="settings.js"></script>
```

**所有脚本文件都使用相对路径，没有任何 `http://` 或 `https://` 外部引用。**

**All script files use relative paths, with no `http://` or `https://` external references.**

### 3. 所有样式表都是本地的 / All Stylesheets are Local

#### 所有 HTML 文件:
```html
<link rel="stylesheet" href="../shared/styles.css">
```

**所有样式表都使用相对路径，没有任何外部 CDN 引用。**

**All stylesheets use relative paths, with no external CDN references.**

### 4. 没有使用 eval() 或 Function 构造函数 / No eval() or Function Constructor Usage

经过代码审查，本扩展：
- ❌ 没有使用 `eval()` 函数
- ❌ 没有使用 `new Function()` 构造函数
- ❌ 没有动态执行字符串代码

Code review confirms this extension:
- ❌ Does NOT use `eval()` function
- ❌ Does NOT use `new Function()` constructor
- ❌ Does NOT dynamically execute string code

### 5. 没有引入外部模块 / No External Module Imports

本扩展：
- ❌ 没有使用 `import` 语句引入远程模块
- ❌ 没有使用 `require()` 引入远程包
- ❌ 没有使用 ES6 modules 从远程加载代码

This extension:
- ❌ Does NOT use `import` statements to load remote modules
- ❌ Does NOT use `require()` to load remote packages
- ❌ Does NOT use ES6 modules to load code from remote sources

---

## 关于 Google Favicon 服务的说明 / Note About Google Favicon Service

### 本扩展使用 Google Favicon 服务获取网站图标：

```javascript
// shared/favicon.js
return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
```

### 这不是远程代码，原因如下：

1. **仅获取图片资源，不执行代码**
   - 该 URL 返回的是图片文件（.png/.ico），不是 JavaScript 或 Wasm 代码
   - Chrome 扩展政策限制的是远程**可执行代码**，不是图片资源

2. **符合 Manifest V3 规范**
   - 使用 `host_permissions` 中的 `*://*/` 权限
   - 通过 `<img>` 标签或 `Image` 对象加载，属于正常的网络资源请求

3. **行业通用做法**
   - 使用第三方服务获取 favicon 是常见做法
   - 类似的还有 Google Fonts（字体）、Gravatar（头像）等

### This is NOT remote code because:

1. **Only fetches image resources, no code execution**
   - The URL returns image files (.png/.ico), not JavaScript or Wasm code
   - Chrome extension policy restricts remote **executable code**, not image resources

2. **Compliant with Manifest V3**
   - Uses `*://*/` permission from `host_permissions`
   - Loaded via `<img>` tag or `Image` object, which is normal network resource request

3. **Industry standard practice**
   - Using third-party services for favicons is common practice
   - Similar to Google Fonts, Gravatar, etc.

---

## Manifest 配置 / Manifest Configuration

### manifest.json:
```json
{
  "manifest_version": 3,
  "host_permissions": [
    "*://*/"
  ],
  "web_accessible_resources": [
    {
      "resources": [
        "shared/styles.css",
        "shared/utils.js",
        "icons/*.svg"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**说明 / Note:**
- `host_permissions` 用于访问任意网站获取 favicon 和 WebDAV 备份
- `web_accessible_resources` 指定扩展中可被网页访问的资源，都是本地文件
- 没有任何 CSP（Content Security Policy）配置，因为不需要加载远程代码

---

## 审查清单 / Review Checklist

- [x] ✅ 所有 JavaScript 文件都在扩展包内
- [x] ✅ 所有 CSS 文件都在扩展包内
- [x] ✅ 没有使用 `<script src="http://...">` 或 `<script src="https://...">`
- [x] ✅ 没有使用 `eval()` 或 `new Function()`
- [x] ✅ 没有 `import` 或 `require` 远程模块
- [x] ✅ 所有资源引用都使用相对路径
- [x] ✅ 没有从 CDN 加载任何库（如 jQuery、Bootstrap 等）
- [x] ✅ 没有动态加载和执行远程代码的机制

---

## 结论 / Conclusion

**本扩展完全符合 Chrome Web Store 关于远程代码的政策要求。**

**This extension fully complies with Chrome Web Store's remote code policy requirements.**

- ✅ 所有可执行代码（JavaScript）都包含在扩展包中
- ✅ 所有样式表（CSS）都包含在扩展包中
- ✅ 没有从远程服务器加载任何可执行代码
- ✅ 唯一的外部资源是 Google Favicon 服务返回的图片文件（非可执行代码）

---

## 联系信息 / Contact Information

如有任何疑问，请通过以下方式联系：

If you have any questions, please contact us via:

- **GitHub**: https://github.com/KingDevatil/chrome-bookmark-manager
- **Issues**: https://github.com/KingDevatil/chrome-bookmark-manager/issues

---

**日期 / Date**: 2026-03-06

**签名 / Signature**: KingDevatil
