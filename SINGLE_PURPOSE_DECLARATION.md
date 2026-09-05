# 单一用途声明 / Single Purpose Declaration

更新日期：2026-09-05；适用开发版本：1.4.6。

本扩展的用途是管理 Chrome / Firefox 浏览器书签。侧边栏、管理器、搜索、标签分组、捷径、常用链接统计、本地及 WebDAV 备份恢复均服务于书签访问与整理。

## 权限用途

| 权限 | 用途 |
|---|---|
| bookmarks | 读取、创建、编辑、移动、删除书签及恢复目录 |
| storage | 保存标签、分组、捷径、设置、WebDAV 凭据、图标缓存和恢复快照 |
| activeTab | 在用户操作时获取当前标签页信息，用于添加书签 |
| alarms | 用户启用的定时备份 |
| sidePanel（Chrome） | 打开书签侧边栏；Firefox 使用 sidebar_action |
| history | 本地常用链接统计 |
| 主机访问权限 | 获取图标和页面图标地址，以及访问用户配置的 WebDAV 服务器 |

图标请求可能向目标网站及现有 Google/DuckDuckGo 服务提供域名和网络元数据。WebDAV 启用后，备份发送到用户配置的服务器。扩展没有向开发者发送分析或遥测的实现；不能据此声称没有第三方网络通信。详细说明见 [隐私政策](PRIVACY_POLICY.md)。

标签导入需要可可靠关联书签的数据；不支持将缺少配套书签树的旧 ID 标签文件直接跨设备导入。卸载扩展不删除浏览器书签、远端备份或已导出文件。

The extension's single purpose is browser bookmark management. Its sidebar, search, tags, shortcuts, local history-based statistics and backup/restore features support that purpose. Permissions and network data handling are described above and in the privacy policy. Store review must be performed against the generated package.

项目与反馈：https://github.com/KingDevatil/chrome-bookmark-manager
