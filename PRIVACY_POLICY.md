# 隐私政策 / Privacy Policy

版本 1.4.6，更新日期 2026-09-05。

## 本地处理

本扩展读取浏览器书签，并在用户操作时创建、修改、移动或删除书签。标签、分组、捷径、布局、设置、图标缓存与恢复快照存于浏览器本地扩展存储。浏览历史用于本地常用链接统计，当前最多查询 10,000 个历史 URL；不作为书签备份的一部分上传。

本项目未实现向开发者发送分析或遥测数据的功能。此声明不代表扩展不会发出网络请求。

## 图标网络请求

显示图标时优先使用本地缓存，缺失时可能请求目标网站图标、页面源码，以及现有 Google 和 DuckDuckGo 图标服务。第三方图标查询会包含目标网站域名；服务端可以接收到请求 IP 等网络元数据。网络请求受相应服务的隐私政策约束。

缓存按 origin 保存，当前有效期为 30 天、最多 200 条，持久缓存数据字符串总量限制为约 2 MB。图标失败会在当前页面内短暂缓存，减少重复请求。页面网络来源不代表本扩展向开发者上传完整书签库。

## WebDAV 与导出

仅在用户配置并启用 WebDAV 后，扩展将所选备份发送至用户指定服务器。备份可能包含书签标题、URL、目录、标签、分组、捷径和布局。定时与启动备份由用户设置控制。

WebDAV 地址、用户名、密码保存在本地扩展存储。HTTP Basic 认证仅为编码，浏览器扩展存储和导出备份没有提供本项目实现的额外加密；推荐使用 HTTPS 和专用凭据。服务器可以访问上传内容，保存与删除行为同时受服务器策略影响。

本地导出由用户决定保存位置。恢复快照同样包含书签与关联元数据，恢复失败时会保留以便补偿处理。关闭备份不撤回已经上传的文件；卸载扩展不删除远端备份或本地导出的文件。

## 用户控制

用户可关闭 WebDAV、自动备份和常用统计，管理浏览器历史记录，删除导出文件及服务器备份。清除扩展存储会丢失本地标签、设置和恢复快照，执行前应保存需要的数据。

## English summary

Bookmarks, tags, shortcuts, settings, recovery snapshots and history-based statistics are processed locally. The extension has no developer analytics/telemetry implementation. Missing favicons may cause requests to the source website and existing Google/DuckDuckGo favicon services, exposing the requested domain and ordinary network metadata to those services.

When configured and enabled, WebDAV sends backups to the user's server. Credentials are stored locally; backups and local extension storage do not have additional encryption implemented by this project. Use HTTPS and protect exported files and recovery snapshots. Disabling backup does not retract uploads already accepted by the server, and uninstalling does not remove remote or exported backups.
