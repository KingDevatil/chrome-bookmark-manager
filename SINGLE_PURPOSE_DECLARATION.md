# Chrome Bookmark Manager - 单一用途声明

## Single Purpose Declaration

**扩展名称 / Extension Name**: Chrome Bookmark Manager

**版本号 / Version**: 1.0.0

---

## 主要功能说明 / Primary Function Description

本扩展是一个功能完整的 Chrome 浏览器书签管理工具，主要提供以下核心功能：

This extension is a comprehensive Chrome bookmark management tool that provides the following core features:

### 1. 侧边栏快速访问 / Sidebar Quick Access
- 在浏览器侧边栏中展示书签树形结构
- 快速访问和管理书签，无需打开新标签页
- 支持搜索、展开/折叠文件夹

### 2. 全页面书签管理器 / Full-Page Bookmark Manager
- 提供现代化的书签管理界面
- 支持列表视图和网格视图切换
- 支持拖拽排序、批量操作
- 支持创建、编辑、删除书签和文件夹

### 3. WebDAV 备份与恢复 / WebDAV Backup & Restore
- 支持将书签数据备份到 WebDAV 服务器
- 支持定时自动备份
- 支持从备份恢复书签数据
- 提供合并和覆盖两种恢复模式

---

## 权限使用说明 / Permission Usage Explanation

### 申请的权限 / Requested Permissions:

1. **bookmarks**
   - **用途**: 读取、创建、编辑、删除和整理浏览器书签
   - **说明**: 这是扩展的核心功能，所有书签管理操作都依赖此权限
   - **Usage**: Read, create, edit, delete, and organize browser bookmarks
   - **Necessity**: This is the core functionality of the extension

2. **storage**
   - **用途**: 保存用户配置（主题设置、布局设置、WebDAV 配置等）
   - **说明**: 用于本地存储用户的个性化设置
   - **Usage**: Save user configurations (theme, layout, WebDAV settings, etc.)
   - **Necessity**: Required for storing user preferences locally

3. **activeTab**
   - **用途**: 在当前标签页中执行操作（如打开书签）
   - **说明**: 仅在用户交互时临时访问当前标签页
   - **Usage**: Perform actions in the current tab (e.g., opening bookmarks)
   - **Necessity**: Only accesses current tab during user interaction

4. **alarms**
   - **用途**: 实现定时自动备份功能
   - **说明**: 按照用户设定的时间间隔自动执行备份
   - **Usage**: Implement scheduled automatic backup functionality
   - **Necessity**: Required for automated backup scheduling

5. **sidePanel**
   - **用途**: 在浏览器侧边栏中显示书签界面
   - **说明**: 提供便捷的侧边栏访问方式
   - **Usage**: Display bookmark interface in browser side panel
   - **Necessity**: Provides convenient sidebar access

### 主机权限 / Host Permissions:

6. **\*://\*/\*** 
   - **用途**: 获取任意网站的 favicon 图标
   - **说明**: 用于在书签列表中显示网站图标，提升用户体验
   - **Usage**: Fetch favicon icons from any website
   - **Necessity**: Display website icons in bookmark lists for better UX

---

## 数据收集和使用声明 / Data Collection and Usage Declaration

### 本扩展 **不收集** 以下信息：
- ❌ 不收集用户的浏览历史
- ❌ 不收集用户的个人信息
- ❌ 不收集用户的账号密码
- ❌ 不收集用户的书签数据（除用户主动备份到 WebDAV 外）

### 本扩展 **不传输** 数据到第三方服务器：
- ❌ 不向任何分析服务发送数据
- ❌ 不向任何广告网络发送数据
- ❌ 不向任何第三方发送用户数据

### 本扩展 **仅在本地存储** 以下数据：
- ✅ 用户的界面设置（主题、布局等）
- ✅ WebDAV 服务器配置信息
- ✅ 书签标签信息（应用层扩展功能）

### WebDAV 备份说明：
- 用户需要自行配置 WebDAV 服务器地址和认证信息
- 备份数据存储在用户自己的服务器上
- 扩展开发者无法访问用户的备份数据
- 备份功能是可选的，用户可以不使用

---

## 单一用途声明 / Single Purpose Statement

**本扩展的唯一用途是：提供强大的 Chrome 浏览器书签管理功能。**

**The sole purpose of this extension is: To provide powerful Chrome browser bookmark management functionality.**

### 所有功能都围绕这一核心用途：
1. ✅ 侧边栏书签快速访问
2. ✅ 全页面书签管理器
3. ✅ 书签备份与恢复
4. ✅ 书签搜索和筛选
5. ✅ 书签拖拽排序
6. ✅ 批量书签操作

### 本扩展 **不包含** 任何与书签管理无关的功能：
- ❌ 不包含广告
- ❌ 不包含追踪代码
- ❌ 不包含挖矿脚本
- ❌ 不包含恶意代码
- ❌ 不强制要求用户注册账号
- ❌ 不强制要求订阅服务

---

## 隐私保护 / Privacy Protection

### 数据来源和透明度：
- 所有书签数据来自 Chrome 浏览器本地
- 所有配置数据存储在 Chrome Storage Local
- 代码开源透明，可在 GitHub 查看：https://github.com/KingDevatil/chrome-bookmark-manager

### 用户控制权：
- 用户可以随时导出备份数据
- 用户可以随时删除扩展，所有本地数据自动清除
- 用户可以随时修改或重置所有设置

---

## 联系信息 / Contact Information

**开发者 / Developer**: KingDevatil

**GitHub**: https://github.com/KingDevatil/chrome-bookmark-manager

**问题反馈 / Issue Tracking**: https://github.com/KingDevatil/chrome-bookmark-manager/issues

---

## 声明 / Declaration

本人郑重声明，本扩展完全遵守 Chrome Web Store 开发者计划政策，特别是单一用途政策。本扩展的所有功能都专注于提供优质的书签管理服务，不包含任何与核心用途无关的功能或代码。

I hereby declare that this extension fully complies with the Chrome Web Store Developer Program Policies, especially the Single Purpose policy. All features of this extension are focused on providing quality bookmark management services and do not contain any features or code unrelated to the core purpose.

**日期 / Date**: 2026-03-06

**签名 / Signature**: KingDevatil

---

## 附加说明 / Additional Notes

如果审核团队需要更多信息或有疑问，请通过 GitHub Issues 联系我们，我们会第一时间回复并提供所需信息。

If the review team needs additional information or has questions, please contact us through GitHub Issues. We will respond promptly and provide the required information.
