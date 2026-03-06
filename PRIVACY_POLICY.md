# Privacy Policy / 隐私政策

**Chrome Bookmark Manager**

**Last Updated / 最后更新**: 2026-03-06 (v1.0.0 - Added Frequently Used Directory)

**Version / 版本**: 1.0.0

---

## 1. Introduction / 简介

Chrome Bookmark Manager ("本扩展") 是一个功能强大的 Chrome 浏览器书签管理工具。我们非常重视用户的隐私保护，本隐私政策旨在清晰、透明地说明本扩展如何收集、使用和保护用户数据。

Chrome Bookmark Manager ("this extension") is a powerful Chrome browser bookmark management tool. We value user privacy protection, and this privacy policy aims to clearly and transparently explain how this extension collects, uses, and protects user data.

---

## 2. Data Collection / 数据收集

### 2.1 本扩展 **不收集** 任何个人数据 / This Extension Does NOT Collect Any Personal Data

**重要声明 / Important Statement:**

❌ **本扩展不会收集、存储或传输以下类型的数据：**

- 搜索历史
- 网站访问记录
- 用户账号信息
- 密码或认证凭据
- 位置信息
- 设备信息
- IP 地址
- 电子邮件地址
- 姓名或其他个人身份信息

❌ **This extension does NOT collect, store, or transmit the following types of data:**

- Search history
- Website visit records
- User account information
- Passwords or authentication credentials
- Location information
- Device information
- IP addresses
- Email addresses
- Names or other personally identifiable information

### 2.2 本扩展 **仅在本地处理** 的数据 / Data Processed ONLY Locally by This Extension

✅ **浏览历史记录（仅用于常用目录统计） / Browsing History (Only for Frequently Used Statistics):**

- **用途**: 自动统计最近访问最频繁的链接，提供便捷的书签管理功能
- **处理方式**: 仅在浏览器本地读取和统计，不传输、不存储到任何服务器
- **时间范围**: 用户可配置（3/7/10 天），仅统计指定时间范围内的访问记录
- **存储位置**: 不存储原始数据，仅在内存中临时计算访问次数
- **Usage**: Automatically statistics most frequently visited links for convenient bookmark management
- **Processing**: Only read and statistics locally in the browser, not transmitted or stored to any server
- **Time Range**: User configurable (3/7/10 days), only statistics visit records within specified time range
- **Storage**: No raw data stored, only temporarily calculates visit counts in memory

✅ **书签数据 / Bookmark Data:**

- **用途**: 书签管理和展示
- **处理方式**: 使用 Chrome Bookmarks API 读取和管理用户书签
- **存储位置**: 仅存储在 Chrome 本地存储和 WebDAV 备份（用户自行配置）
- **Usage**: Bookmark management and display
- **Processing**: Uses Chrome Bookmarks API to read and manage user bookmarks
- **Storage**: Only stored in Chrome local storage and WebDAV backup (user configured)

✅ **配置数据 / Configuration Data:**

- **用途**: 保存用户设置（主题、布局、WebDAV 配置等）
- **处理方式**: 使用 Chrome Storage API 本地存储
- **存储位置**: Chrome Storage Local
- **Usage**: Save user settings (theme, layout, WebDAV configuration, etc.)
- **Processing**: Stored locally using Chrome Storage API
- **Storage**: Chrome Storage Local

### 2.3 本扩展 **仅在本地存储** 的数据 / Data Stored ONLY Locally

✅ **以下数据仅存储在用户本地的 Chrome Storage 中，不会传输到任何服务器：**

1. **界面设置 / Interface Settings**
   - 主题偏好（深色/浅色模式）
   - 布局设置（书签高度、目录缩进）
   - 视图模式（列表/网格）

2. **WebDAV 配置 / WebDAV Configuration**
   - WebDAV 服务器地址
   - WebDAV 用户名
   - WebDAV 密码（加密存储）
   - 自动备份设置

3. **书签标签数据 / Bookmark Tags Data**
   - 用户为书签添加的自定义标签
   - 标签元数据（颜色等）

✅ **The following data is stored ONLY in the user's local Chrome Storage and is NOT transmitted to any server:**

1. **Interface Settings**
   - Theme preference (dark/light mode)
   - Layout settings (bookmark height, directory indentation)
   - View mode (list/grid)

2. **WebDAV Configuration**
   - WebDAV server URL
   - WebDAV username
   - WebDAV password (encrypted storage)
   - Automatic backup settings

3. **Bookmark Tags Data**
   - Custom tags added by users to bookmarks
   - Tag metadata (colors, etc.)

---

## 3. Data Usage / 数据使用

### 3.1 书签数据 / Bookmark Data

**本扩展访问书签数据仅用于以下目的：**

本扩展使用 Chrome Bookmarks API 访问用户的书签数据，这是扩展的核心功能所需。书签数据：

- ✅ **仅用于在扩展界面中显示和管理书签**
- ✅ **仅在用户本地设备上处理和存储**
- ✅ **不会传输到任何第三方服务器**
- ✅ **不会出售、出租或分享给任何第三方**

**This extension accesses bookmark data ONLY for the following purposes:**

This extension uses the Chrome Bookmarks API to access user bookmark data, which is necessary for the core functionality of the extension. Bookmark data:

- ✅ **Used ONLY to display and manage bookmarks in the extension interface**
- ✅ **Processed and stored ONLY on the user's local device**
- ✅ **NOT transmitted to any third-party servers**
- ✅ **NOT sold, rented, or shared with any third party**

### 3.2 权限使用说明 / Permission Usage Explanation

本扩展申请的权限仅用于实现书签管理功能：

The permissions requested by this extension are used ONLY to implement bookmark management functionality:

| 权限 / Permission | 用途 / Purpose | 数据传输 / Data Transmission |
|------------------|----------------|------------------------------|
| `bookmarks` | 读取、创建、编辑、删除书签 / Read, create, edit, delete bookmarks | ❌ 无 / None |
| `storage` | 保存用户配置 / Save user configurations | ❌ 无 / None |
| `activeTab` | 在当前标签页打开书签 / Open bookmarks in current tab | ❌ 无 / None |
| `alarms` | 定时自动备份 / Scheduled automatic backup | ❌ 无 / None |
| `sidePanel` | 显示侧边栏界面 / Display sidebar interface | ❌ 无 / None |
| `*://*/` | 获取网站 favicon、WebDAV 备份 / Fetch favicon, WebDAV backup | ⚠️ 仅用户配置的 WebDAV 服务器 / Only user-configured WebDAV server |

---

## 4. Data Storage and Security / 数据存储和安全

### 4.1 本地存储 / Local Storage

所有用户数据都使用 Chrome Storage API 存储在用户本地设备上：

- **存储位置**: Chrome Storage Local
- **访问控制**: 仅本扩展可以访问
- **数据持久化**: 数据在浏览器重启后保持
- **数据清除**: 卸载扩展时自动清除所有数据

All user data is stored on the user's local device using Chrome Storage API:

- **Storage Location**: Chrome Storage Local
- **Access Control**: Only accessible by this extension
- **Data Persistence**: Data persists after browser restart
- **Data Deletion**: All data is automatically deleted when extension is uninstalled

### 4.2 WebDAV 备份 / WebDAV Backup

如果用户选择使用 WebDAV 备份功能：

- **数据存储**: 书签数据备份到用户自己配置的 WebDAV 服务器
- **传输安全**: 使用 HTTPS 加密传输（如果服务器支持）
- **认证信息**: WebDAV 用户名和密码加密存储在本地
- **用户控制**: 用户可以随时启用/禁用备份功能
- **开发者访问**: 扩展开发者无法访问用户的 WebDAV 服务器或备份数据

If users choose to use the WebDAV backup feature:

- **Data Storage**: Bookmark data is backed up to the user's own configured WebDAV server
- **Transmission Security**: Encrypted transmission using HTTPS (if server supports)
- **Authentication**: WebDAV username and password are encrypted and stored locally
- **User Control**: Users can enable/disable backup feature at any time
- **Developer Access**: Extension developers cannot access user's WebDAV server or backup data

### 4.3 数据安全 / Data Security

我们采取以下措施保护用户数据安全：

We take the following measures to protect user data security:

- ✅ 不在代码中硬编码任何服务器地址或 API 密钥
- ✅ 不要求用户注册账号或提供电子邮件
- ✅ 不集成任何分析或跟踪服务
- ✅ 不要求额外的、与核心功能无关的权限
- ✅ 定期审查代码，确保没有安全漏洞

- ✅ No hardcoded server addresses or API keys in code
- ✅ No user registration or email required
- ✅ No analytics or tracking services integrated
- ✅ No additional permissions unrelated to core functionality
- ✅ Regular code review to ensure no security vulnerabilities

---

## 5. Third-Party Services / 第三方服务

### 5.1 Google Favicon Service / Google 网站图标服务

本扩展使用 Google Favicon Service 获取网站图标：

This extension uses Google Favicon Service to fetch website icons:

```
https://www.google.com/s2/favicons?domain={domain}&sz=32
```

**隐私影响 / Privacy Impact:**

- ⚠️ 会向 Google 发送请求（包含网站域名）
- ⚠️ Google 可能会记录请求日志
- ✅ 仅发送域名，不发送完整 URL 或其他数据
- ✅ 不涉及用户个人身份信息
- ✅ 这是行业通用做法（类似 Gravatar、Google Fonts）

⚠️ **Will send requests to Google (containing website domain)**
⚠️ **Google may log requests**
✅ **Only sends domain, not full URL or other data**
✅ **Does not involve user personally identifiable information**
✅ **This is industry standard practice (similar to Gravatar, Google Fonts)**

### 5.2 WebDAV 服务器 / WebDAV Server

如果用户配置了 WebDAV 备份：

If users configure WebDAV backup:

- ⚠️ 书签数据会传输到用户指定的 WebDAV 服务器
- ✅ 服务器由用户自行选择和控制
- ✅ 开发者不对第三方 WebDAV 服务器的隐私政策负责
- ✅ 建议用户选择可信赖的 WebDAV 服务提供商

⚠️ **Bookmark data will be transmitted to the user-specified WebDAV server**
✅ **Server is selected and controlled by the user**
✅ **Developer is not responsible for privacy policies of third-party WebDAV servers**
✅ **Users are advised to choose trustworthy WebDAV service providers**

---

## 6. User Rights / 用户权利

根据适用的隐私法规（如 GDPR、CCPA 等），用户享有以下权利：

Under applicable privacy regulations (such as GDPR, CCPA, etc.), users have the following rights:

### 6.1 访问权 / Right to Access

- 用户可以查看扩展存储的所有数据
- 可以通过 Chrome Storage 查看或导出配置数据

Users can view all data stored by the extension and can view or export configuration data through Chrome Storage.

### 6.2 更正权 / Right to Rectification

- 用户可以随时修改书签数据
- 用户可以随时修改设置和配置

Users can modify bookmark data and settings/configurations at any time.

### 6.3 删除权 / Right to Erasure

- 用户可以删除任何书签
- 用户可以清除所有设置
- 用户卸载扩展时，所有数据自动删除

Users can delete any bookmarks, clear all settings, and all data is automatically deleted when users uninstall the extension.

### 6.4 导出权 / Right to Data Portability

- 用户可以导出书签为 HTML 格式（通过 Chrome 内置功能）
- 用户可以导出 WebDAV 备份文件

Users can export bookmarks as HTML format (through Chrome built-in features) and export WebDAV backup files.

### 6.5 撤回同意 / Right to Withdraw Consent

- 用户可以随时卸载扩展，撤回所有同意
- 用户可以禁用 WebDAV 备份功能

Users can uninstall the extension at any time to withdraw all consent and can disable the WebDAV backup feature.

---

## 7. Children's Privacy / 儿童隐私

本扩展不针对 13 岁（或适用司法管辖区规定的其他年龄）以下的儿童。我们不会故意收集儿童的个人信息。

This extension is not directed to children under 13 (or other ages as defined by applicable jurisdictions). We do not knowingly collect personal information from children.

如果我们发现收集了儿童的个人数据，我们会立即删除。

If we discover that personal data from children has been collected, we will delete it immediately.

---

## 8. Changes to This Policy / 隐私政策变更

我们可能会不时更新本隐私政策。更新后的政策将在扩展的 GitHub 仓库中发布，并在政策顶部更新日期。

We may update this privacy policy from time to time. Updated policies will be published in the extension's GitHub repository, and the update date will be shown at the top of the policy.

建议用户定期查看本隐私政策，了解任何变更。

Users are advised to review this privacy policy periodically to stay informed of any changes.

---

## 9. Contact Us / 联系我们

如果用户对本隐私政策有任何疑问或顾虑，请通过以下方式联系我们：

If users have any questions or concerns about this privacy policy, please contact us via:

- **GitHub Repository**: https://github.com/KingDevatil/chrome-bookmark-manager
- **Issues**: https://github.com/KingDevatil/chrome-bookmark-manager/issues


---

## 10. Compliance / 合规性

### 10.1 GDPR (General Data Protection Regulation) / 通用数据保护条例

本扩展符合 GDPR 要求，因为：

This extension complies with GDPR requirements because:

- ✅ 不收集个人数据
- ✅ 数据处理透明
- ✅ 用户对其数据有完全控制权
- ✅ 数据仅在本地存储，不跨境传输
- ✅ 用户可随时删除数据（删除权）

- ✅ Does not collect personal data
- ✅ Data processing is transparent
- ✅ Users have full control over their data
- ✅ Data is stored only locally, no cross-border transfer
- ✅ Users can delete data at any time (right to erasure)

### 10.2 CCPA (California Consumer Privacy Act) / 加州消费者隐私法案

本扩展符合 CCPA 要求，因为：

This extension complies with CCPA requirements because:

- ✅ 不出售个人信息
- ✅ 不收集个人数据
- ✅ 提供数据访问和删除选项

- ✅ Does not sell personal information
- ✅ Does not collect personal data
- ✅ Provides data access and deletion options

### 10.3 Chrome Web Store Developer Program Policies / Chrome Web Store 开发者计划政策

本扩展符合 Chrome Web Store 政策，包括：

This extension complies with Chrome Web Store policies, including:

- ✅ 单一用途政策
- ✅ 数据安全和隐私政策
- ✅ 权限使用政策
- ✅ 远程代码政策

- ✅ Single Purpose Policy
- ✅ Data Security and Privacy Policy
- ✅ Permission Usage Policy
- ✅ Remote Code Policy

---

## 11. Summary / 总结

### 关键要点 / Key Points:

1. **本扩展不收集任何个人数据**
   This extension does NOT collect any personal data

2. **所有数据仅在本地存储，不传输到第三方**
   All data is stored ONLY locally, NOT transmitted to third parties

3. **用户可以完全控制自己的数据**
   Users have FULL control over their data

4. **唯一的第三方服务是 Google Favicon（获取网站图标）**
   The ONLY third-party service is Google Favicon (for website icons)

5. **WebDAV 备份是可选的，由用户控制**
   WebDAV backup is OPTIONAL and controlled by users

---

## 12. Acknowledgment / 确认

使用本扩展即表示用户同意本隐私政策中描述的数据处理做法。

By using this extension, users agree to the data handling practices described in this privacy policy.

如果用户不同意本政策，请卸载本扩展。

If users do not agree with this policy, please uninstall this extension.

---

**开发者 / Developer**: KingDevatil

**GitHub**: https://github.com/KingDevatil/chrome-bookmark-manager

**隐私政策生效日期 / Privacy Policy Effective Date**: 2026-03-06

---

*本隐私政策采用中英文双语编写，如有歧义，以英文版为准。*

*This privacy policy is written in both Chinese and English. In case of any ambiguity, the English version shall prevail.*
