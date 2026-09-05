# 远程代码使用声明 / Remote Code Usage Declaration

更新日期：2026-09-05；适用开发版本：1.4.6。

本扩展的可执行代码和样式随目标浏览器扩展包分发，不从远端下载执行 JavaScript 或 Wasm。

源码位于 `src/`，通过 `npm run build` 输出到 `dist/chrome/` 和 `dist/firefox/`。构建使用 npm 锁文件；WebDAV XML 解析库打包进本地后台脚本，不从 CDN 加载。页面脚本和样式引用包内资源，无 popup 入口，也不依赖旧 browser-polyfill.js。

网络访问用于图标及用户配置的 WebDAV：

- 图标可能来自目标网站、Google 或 DuckDuckGo 图标服务。
- 页面源码 fallback 只解析图标地址，不执行下载的页面脚本。
- WebDAV JSON/XML 作为数据解析，不作为代码执行。

“不使用远程代码”不等于“没有网络请求”。请求的数据范围、凭据存储及第三方服务说明见 [隐私政策](PRIVACY_POLICY.md)。商店审核仍需针对实际生成包完成，本声明不代表审核已经通过。

All executable code and styles are shipped with the extension. Build dependencies are pinned by the npm lockfile, and the XML parser is bundled locally. Remote favicon, page-source and WebDAV responses are processed as images or data, not executed as code. See the privacy policy for network and data handling details.
