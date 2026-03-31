/**
 * 语言翻译文件
 * 支持: zh-CN (简体中文), en (English)
 * 使用 data-i18n 属性标记需要翻译的元素
 * 使用 I18n.t(key, vars) 获取翻译文本并替换变量
 */

const translations = {
  'zh-CN': {},
  'en': {}
};

const i18nData = {
  'common.settings': { 'zh-CN': '设置', 'en': 'Settings' },
  'common.save': { 'zh-CN': '保存', 'en': 'Save' },
  'common.cancel': { 'zh-CN': '取消', 'en': 'Cancel' },
  'common.delete': { 'zh-CN': '删除', 'en': 'Delete' },
  'common.edit': { 'zh-CN': '编辑', 'en': 'Edit' },
  'common.confirm': { 'zh-CN': '确认', 'en': 'Confirm' },
  'common.close': { 'zh-CN': '关闭', 'en': 'Close' },
  'common.loading': { 'zh-CN': '加载中...', 'en': 'Loading...' },
  'common.success': { 'zh-CN': '成功', 'en': 'Success' },
  'common.error': { 'zh-CN': '错误', 'en': 'Error' },
  'common.warning': { 'zh-CN': '警告', 'en': 'Warning' },
  'common.backup': { 'zh-CN': '备份', 'en': 'Backup' },
  'common.restore': { 'zh-CN': '恢复', 'en': 'Restore' },
  'common.export': { 'zh-CN': '导出', 'en': 'Export' },
  'common.import': { 'zh-CN': '导入', 'en': 'Import' },
  'common.enable': { 'zh-CN': '启用', 'en': 'Enable' },
  'common.disable': { 'zh-CN': '禁用', 'en': 'Disable' },
  'common.enabled': { 'zh-CN': '已启用', 'en': 'Enabled' },
  'common.disabled': { 'zh-CN': '已禁用', 'en': 'Disabled' },
  'common.yes': { 'zh-CN': '是', 'en': 'Yes' },
  'common.no': { 'zh-CN': '否', 'en': 'No' },
  'common.ok': { 'zh-CN': '确定', 'en': 'OK' },
  'common.back': { 'zh-CN': '返回', 'en': 'Back' },
  'common.refresh': { 'zh-CN': '刷新', 'en': 'Refresh' },
  'common.search': { 'zh-CN': '搜索', 'en': 'Search' },
  'common.all': { 'zh-CN': '全部', 'en': 'All' },
  'common.none': { 'zh-CN': '无', 'en': 'None' },
  'common.more': { 'zh-CN': '更多', 'en': 'More' },
  'common.less': { 'zh-CN': '更少', 'en': 'Less' },
  'common.default': { 'zh-CN': '默认', 'en': 'Default' },
  'common.custom': { 'zh-CN': '自定义', 'en': 'Custom' },
  'common.add': { 'zh-CN': '添加', 'en': 'Add' },
  'common.create': { 'zh-CN': '创建', 'en': 'Create' },
  'common.apply': { 'zh-CN': '应用', 'en': 'Apply' },
  'common.reset': { 'zh-CN': '恢复默认', 'en': 'Reset' },
  'common.selectAll': { 'zh-CN': '全选', 'en': 'Select All' },
  'common.batch': { 'zh-CN': '批量', 'en': 'Batch' },
  'common.batchDelete': { 'zh-CN': '批量删除', 'en': 'Batch Delete' },
  'common.open': { 'zh-CN': '打开', 'en': 'Open' },
  'common.name': { 'zh-CN': '名称', 'en': 'Name' },
  'common.title': { 'zh-CN': '标题', 'en': 'Title' },
  'common.url': { 'zh-CN': '网址', 'en': 'URL' },
  'common.folder': { 'zh-CN': '文件夹', 'en': 'Folder' },
  'common.folders': { 'zh-CN': '文件夹', 'en': 'Folders' },
  'common.bookmark': { 'zh-CN': '书签', 'en': 'Bookmark' },
  'common.bookmarks': { 'zh-CN': '书签', 'en': 'Bookmarks' },
  'common.items': { 'zh-CN': '项', 'en': 'items' },
  'common.item': { 'zh-CN': '项', 'en': 'item' },
  'common.times': { 'zh-CN': '次', 'en': 'times' },
  'common.version': { 'zh-CN': '版本', 'en': 'Version' },
  'common.example': { 'zh-CN': '例如', 'en': 'Example' },
  'common.preview': { 'zh-CN': '预览', 'en': 'Preview' },
  'common.select': { 'zh-CN': '选择', 'en': 'Select' },
  'common.selected': { 'zh-CN': '已选择', 'en': 'Selected' },
  'common.ungrouped': { 'zh-CN': '未分组', 'en': 'Ungrouped' },
  'common.empty': { 'zh-CN': '暂无', 'en': 'No ' },
  'common.noResults': { 'zh-CN': '未找到结果', 'en': 'No results found' },
  'common.pin': { 'zh-CN': '置顶', 'en': 'Pin' },
  'common.unpin': { 'zh-CN': '取消置顶', 'en': 'Unpin' },
  'common.block': { 'zh-CN': '屏蔽', 'en': 'Block' },
  'common.modify': { 'zh-CN': '修改', 'en': 'Modify' },
  'common.clearAll': { 'zh-CN': '清空所有', 'en': 'Clear All' },
  'common.addToBookmark': { 'zh-CN': '添加到书签', 'en': 'Add to Bookmarks' },
  'common.enterFolder': { 'zh-CN': '进入文件夹', 'en': 'Enter Folder' },
  'common.addTime': { 'zh-CN': '添加时间', 'en': 'Added' },
  'common.contains': { 'zh-CN': '包含内容', 'en': 'Contains' },
  'common.tag': { 'zh-CN': '标签', 'en': 'Tags' },
  'common.tags': { 'zh-CN': '标签', 'en': 'Tags' },
  'common.tagName': { 'zh-CN': '标签名称', 'en': 'Tag Name' },
  'common.selectTag': { 'zh-CN': '选择标签', 'en': 'Select Tag' },
  'common.enterTag': { 'zh-CN': '输入标签名后按回车添加', 'en': 'Enter tag name and press Enter' },
  'common.noTags': { 'zh-CN': '暂无标签', 'en': 'No tags' },
  'common.addTags': { 'zh-CN': '添加标签', 'en': 'Add Tag' },
  'common.quickAddTag': { 'zh-CN': '快速添加标签', 'en': 'Quick Add Tag' },
  'common.noTagsAddFirst': { 'zh-CN': '暂无标签，请先添加标签', 'en': 'No tags, please add tags first' },
  'common.enterTagInput': { 'zh-CN': '输入标签', 'en': 'Enter Tag' },
  'common.noTagsInDetail': { 'zh-CN': '暂无标签，请先在书签详情中添加标签', 'en': 'No tags, please add tags in bookmark details first' },
  'common.confirmDelete': { 'zh-CN': '确定要删除吗？', 'en': 'Are you sure you want to delete?' },
  'common.confirmDeleteSelected': { 'zh-CN': '确定要删除选中的', 'en': 'Are you sure you want to delete selected' },
  'common.noFolders': { 'zh-CN': '该文件夹为空', 'en': 'This folder is empty' },
  'common.selectBookmark': { 'zh-CN': '选择一个书签查看详情', 'en': 'Select a bookmark to view details' },
  'common.folderDetail': { 'zh-CN': '文件夹详情', 'en': 'Folder Details' },
  'common.bookmarkDetail': { 'zh-CN': '书签详情', 'en': 'Bookmark Details' },
  'common.editBookmark': { 'zh-CN': '修改书签', 'en': 'Edit Bookmark' },
  'common.parentFolder': { 'zh-CN': '上级文件夹', 'en': 'Parent Folder' },
  'common.selectFolder': { 'zh-CN': '选择文件夹', 'en': 'Select Folder' },
  'common.enterTitle': { 'zh-CN': '请输入标题', 'en': 'Enter title' },
  'common.enterUrl': { 'zh-CN': '请输入网址', 'en': 'Enter URL' },
  'common.enterFolderName': { 'zh-CN': '输入文件夹名称', 'en': 'Enter folder name' },
  'common.enterFolderNamePlaceholder': { 'zh-CN': '输入文件夹名称', 'en': 'Enter folder name' },
  'common.enterGroupName': { 'zh-CN': '输入分组名称', 'en': 'Enter group name' },
  'common.newFolderTitle': { 'zh-CN': '新建文件夹', 'en': 'New Folder' },
  'common.folderName': { 'zh-CN': '文件夹名称', 'en': 'Folder Name' },
  'common.storageLocation': { 'zh-CN': '存放位置', 'en': 'Storage Location' },
  'common.newBookmark': { 'zh-CN': '添加新书签', 'en': 'Add New Bookmark' },
  'common.enterBookmarkTitle': { 'zh-CN': '输入书签标题', 'en': 'Enter bookmark title' },
  'common.enterTags': { 'zh-CN': '输入标签，逗号分隔多个标签', 'en': 'Enter tags, comma separated' },
  'common.selectFromGroups': { 'zh-CN': '从分组中选择标签', 'en': 'Select tags from groups' },
  'common.selectedTags': { 'zh-CN': '已选择的标签', 'en': 'Selected Tags' },
  'common.willApply': { 'zh-CN': '将应用到', 'en': 'Will apply to' },
  'common.tagUnit': { 'zh-CN': '个书签', 'en': 'bookmarks' },
  'common.newFolder': { 'zh-CN': '新建文件夹', 'en': 'New Folder' },
  'common.backupNow': { 'zh-CN': '立即备份', 'en': 'Backup Now' },
  'common.appearance': { 'zh-CN': '外观', 'en': 'Appearance' },
  'common.darkMode': { 'zh-CN': '深色模式', 'en': 'Dark Mode' },
  'common.enableFreq': { 'zh-CN': '启用常用', 'en': 'Enable Frequently Used' },
  'common.menu': { 'zh-CN': '菜单', 'en': 'Menu' },
  'common.manager': { 'zh-CN': '管理器', 'en': 'Manager' },
  'common.bookmarkManager': { 'zh-CN': '书签管理器', 'en': 'Bookmark Manager' },
  'common.allBookmarks': { 'zh-CN': '全部书签', 'en': 'All Bookmarks' },
  'common.searchPlaceholder': { 'zh-CN': '搜索书签（标题、网址、标签）', 'en': 'Search by title, URL, or tag' },
  'common.searchHistoryPlaceholder': { 'zh-CN': '搜索历史记录', 'en': 'Search history' },
  'common.noBookmark': { 'zh-CN': '暂无书签', 'en': 'No bookmarks' },
  'common.history': { 'zh-CN': '历史', 'en': 'History' },
  'common.noHistory': { 'zh-CN': '暂无历史记录', 'en': 'No history' },
  'common.allTags': { 'zh-CN': '所有标签', 'en': 'All Tags' },
  'common.tagManager': { 'zh-CN': '标签管理', 'en': 'Tag Manager' },
  'common.deleteTag': { 'zh-CN': '确定要删除这个标签吗？', 'en': 'Are you sure you want to delete this tag?' },
  'common.tagDeleted': { 'zh-CN': '标签已删除', 'en': 'Tag deleted' },
  'common.newTag': { 'zh-CN': '新建标签', 'en': 'New Tag' },
  'common.sidebar': { 'zh-CN': '书签侧边栏', 'en': 'Bookmark Sidebar' },
  'common.movingFolder': { 'zh-CN': '移入文件夹', 'en': 'Move to Folder' },
  'common.saveSuccess': { 'zh-CN': '保存成功', 'en': 'Saved successfully' },
  'common.deleteSuccess': { 'zh-CN': '删除成功', 'en': 'Deleted successfully' },
  'common.addSuccess': { 'zh-CN': '添加成功', 'en': 'Added successfully' },
  'common.updateSuccess': { 'zh-CN': '更新成功', 'en': 'Updated successfully' },
  'common.operationFailed': { 'zh-CN': '操作失败', 'en': 'Operation failed' },
  'common.confirmDeleteAction': { 'zh-CN': '确认删除', 'en': 'Confirm Delete' },
  'common.cannotUndo': { 'zh-CN': '此操作不可撤销，是否继续？', 'en': 'This action cannot be undone. Continue?' },
  'common.confirmOverwrite': { 'zh-CN': '覆盖确认', 'en': 'Confirm Overwrite' },
  'common.willOverwrite': { 'zh-CN': '将用备份数据覆盖当前数据，是否继续？', 'en': 'This will replace current data. Continue?' },
  'common.settingsPage': { 'zh-CN': '设置 - 书签管理器', 'en': 'Settings - Bookmark Manager' },
  'common.settingsBookmarkManager': { 'zh-CN': '设置 - 书签管理器', 'en': 'Settings - Bookmark Manager' },

  'menu.webdav': { 'zh-CN': 'WebDAV 同步', 'en': 'WebDAV Sync' },
  'menu.backup': { 'zh-CN': '备份与恢复', 'en': 'Backup & Restore' },
  'menu.tags': { 'zh-CN': '标签总览', 'en': 'Tags Overview' },
  'menu.layout': { 'zh-CN': '布局', 'en': 'Layout' },
  'menu.frequentlyUsed': { 'zh-CN': '常用目录', 'en': 'Frequently Used' },
  'menu.language': { 'zh-CN': '语言', 'en': 'Language' },
  'menu.help': { 'zh-CN': '操作说明', 'en': 'Help' },
  'menu.backToManager': { 'zh-CN': '返回管理器', 'en': 'Back to Manager' },

  'webdav.title': { 'zh-CN': 'WebDAV 同步设置', 'en': 'WebDAV Sync Settings' },
  'webdav.enable': { 'zh-CN': '启用 WebDAV 同步', 'en': 'Enable WebDAV Sync' },
  'webdav.serverUrl': { 'zh-CN': '服务器地址', 'en': 'Server URL' },
  'webdav.username': { 'zh-CN': '用户名', 'en': 'Username' },
  'webdav.password': { 'zh-CN': '密码', 'en': 'Password' },
  'webdav.testConnection': { 'zh-CN': '测试连接', 'en': 'Test Connection' },
  'webdav.saveConfig': { 'zh-CN': '保存配置', 'en': 'Save Config' },
  'webdav.connectionSuccess': { 'zh-CN': '连接成功', 'en': 'Connection successful' },
  'webdav.connectionFailed': { 'zh-CN': '连接失败', 'en': 'Connection failed' },
  'webdav.settingsSaved': { 'zh-CN': '设置已保存', 'en': 'Settings saved' },
  'webdav.enableDesc': { 'zh-CN': '开启后可以将书签备份到 WebDAV 服务器', 'en': 'Enable to backup bookmarks to WebDAV server' },
  'webdav.urlPlaceholder': { 'zh-CN': 'WebDAV 服务器地址，例如：https://example.com/dav', 'en': 'WebDAV server URL, e.g.: https://example.com/dav' },
  'webdav.tip': { 'zh-CN': '💡 提示：若备份存储目录创建失败，请自行在 WebDAV 根目录下创建 bookmarks 文件夹', 'en': '💡 Tip: If backup directory creation fails, create "bookmarks" folder manually in WebDAV root' },

  'backup.autoBackup': { 'zh-CN': '自动备份', 'en': 'Auto Backup' },
  'backup.enableAuto': { 'zh-CN': '启用自动备份', 'en': 'Enable Auto Backup' },
  'backup.interval': { 'zh-CN': '备份间隔', 'en': 'Backup Interval' },
  'backup.every15min': { 'zh-CN': '每 15 分钟', 'en': 'Every 15 minutes' },
  'backup.every30min': { 'zh-CN': '每 30 分钟', 'en': 'Every 30 minutes' },
  'backup.every1hour': { 'zh-CN': '每 1 小时', 'en': 'Every 1 hour' },
  'backup.every3hours': { 'zh-CN': '每 3 小时', 'en': 'Every 3 hours' },
  'backup.every6hours': { 'zh-CN': '每 6 小时', 'en': 'Every 6 hours' },
  'backup.every12hours': { 'zh-CN': '每 12 小时', 'en': 'Every 12 hours' },
  'backup.everyday': { 'zh-CN': '每天', 'en': 'Every day' },
  'backup.onStartup': { 'zh-CN': '启动时备份', 'en': 'Backup on Startup' },
  'backup.onStartupDesc': { 'zh-CN': '每次打开浏览器时自动备份书签', 'en': 'Auto backup bookmarks when opening browser' },
  'backup.manual': { 'zh-CN': '手动操作', 'en': 'Manual Operations' },
  'backup.bookmarkBackup': { 'zh-CN': '书签备份', 'en': 'Bookmark Backup' },
  'backup.backupBookmarks': { 'zh-CN': '备份书签', 'en': 'Backup Bookmarks' },
  'backup.backupBookmarksDesc': { 'zh-CN': '将当前书签备份到 WebDAV 服务器', 'en': 'Backup current bookmarks to WebDAV server' },
  'backup.bookmarkRestore': { 'zh-CN': '书签恢复', 'en': 'Bookmark Restore' },
  'backup.restoreBookmarks': { 'zh-CN': '恢复书签', 'en': 'Restore Bookmarks' },
  'backup.restoreBookmarksDesc': { 'zh-CN': '从 WebDAV 服务器恢复书签备份', 'en': 'Restore bookmarks from WebDAV server' },
  'backup.restoreBackup': { 'zh-CN': '恢复备份', 'en': 'Restore Backup' },
  'backup.restoreMode': { 'zh-CN': '恢复模式', 'en': 'Restore Mode' },
  'backup.merge': { 'zh-CN': '合并', 'en': 'Merge' },
  'backup.overwrite': { 'zh-CN': '覆盖', 'en': 'Replace' },
  'backup.backupSuccess': { 'zh-CN': '备份成功', 'en': 'Backup successful' },
  'backup.backupFailed': { 'zh-CN': '备份失败', 'en': 'Backup failed' },
  'backup.restoreSuccess': { 'zh-CN': '恢复成功', 'en': 'Restore successful' },
  'backup.restoreFailed': { 'zh-CN': '恢复失败', 'en': 'Restore failed' },
  'backup.layoutBackup': { 'zh-CN': '布局备份', 'en': 'Layout Backup' },
  'backup.backupLayout': { 'zh-CN': '备份布局', 'en': 'Backup Layout' },
  'backup.backupLayoutDesc': { 'zh-CN': '将布局设置备份到 WebDAV 服务器', 'en': 'Backup layout settings to WebDAV server' },
  'backup.layoutRestore': { 'zh-CN': '布局恢复', 'en': 'Layout Restore' },
  'backup.restoreLayout': { 'zh-CN': '恢复布局', 'en': 'Restore Layout' },
  'backup.restoreLayoutDesc': { 'zh-CN': '从 WebDAV 服务器恢复布局设置', 'en': 'Restore layout settings from WebDAV server' },
  'backup.exportImport': { 'zh-CN': '统一导出/导入', 'en': 'Export/Import All' },
  'backup.exportImportDesc': { 'zh-CN': '导出或导入书签、布局、标签配置', 'en': 'Export or import bookmarks, layout, and tag settings' },
  'backup.exportConfig': { 'zh-CN': '导出配置', 'en': 'Export Config' },
  'backup.importConfig': { 'zh-CN': '导入配置', 'en': 'Import Config' },
  'backup.importConfigDesc': { 'zh-CN': '从 JSON 文件导入配置（自动识别内容类型）', 'en': 'Import from JSON file (auto-detect)' },
  'backup.selectFile': { 'zh-CN': '选择文件', 'en': 'Select File' },
  'backup.selectExportContent': { 'zh-CN': '选择导出内容', 'en': 'Select Export Content' },
  'backup.layoutSettings': { 'zh-CN': '布局设置', 'en': 'Layout Settings' },

  'cleanup.title': { 'zh-CN': '标签数据清理', 'en': 'Tag Data Cleanup' },
  'cleanup.desc': { 'zh-CN': '检测并清理已删除书签的孤立标签数据', 'en': 'Detect and clean orphan tag data' },
  'cleanup.detectOrphan': { 'zh-CN': '检测孤立标签', 'en': 'Detect Orphan Tags' },
  'cleanup.detectDesc': { 'zh-CN': '检查标签数据中是否存在对应书签已被删除的孤立标签', 'en': 'Check for orphan tags' },
  'cleanup.startDetection': { 'zh-CN': '开始检测', 'en': 'Start Detection' },
  'cleanup.cleanInvalid': { 'zh-CN': '清理无效标签', 'en': 'Clean Invalid Tags' },
  'cleanup.cleanDesc': { 'zh-CN': '删除所有孤立标签数据，释放存储空间', 'en': 'Delete all orphan tags' },

  'duplicate.title': { 'zh-CN': '书签查重', 'en': 'Duplicate Detection' },
  'duplicate.desc': { 'zh-CN': '检测并删除重复的书签（相同URL的书签）', 'en': 'Detect and delete duplicate bookmarks' },
  'duplicate.scanDesc': { 'zh-CN': '扫描所有书签，查找相同URL的重复书签', 'en': 'Scan for duplicates' },
  'duplicate.result': { 'zh-CN': '检测结果', 'en': 'Detection Results' },
  'duplicate.deleteSelected': { 'zh-CN': '删除选中', 'en': 'Delete Selected' },

  'tagGroup.title': { 'zh-CN': '标签分组', 'en': 'Tag Groups' },
  'tagGroup.desc': { 'zh-CN': '创建分组来组织管理标签，方便快速添加标签', 'en': 'Create groups to organize tags' },
  'tagGroup.newGroup': { 'zh-CN': '新建分组', 'en': 'New Group' },
  'tagGroup.ungroupedTags': { 'zh-CN': '未分组标签', 'en': 'Ungrouped Tags' },
  'tagGroup.ungroupedDesc': { 'zh-CN': '以下标签尚未归类到任何分组，点击可查看详情', 'en': 'Ungrouped tags below' },
  'tagGroup.management': { 'zh-CN': '标签分组管理', 'en': 'Tag Group Management' },
  'tagGroup.allGrouped': { 'zh-CN': '所有标签已分组', 'en': 'All tags are grouped' },
  'tagGroup.noGroups': { 'zh-CN': '暂无分组，点击上方按钮创建', 'en': 'No groups, click button above to create' },
  'tagGroup.noTagsToSelect': { 'zh-CN': '没有可选择的标签，所有标签已在此分组中', 'en': 'No tags to select, all tags are in this group' },
  'tagGroup.selectTags': { 'zh-CN': '选择标签添加到分组', 'en': 'Select tags to add to group' },
  'tagGroup.selectFromGroup': { 'zh-CN': '从其他分组或未分组中选择标签', 'en': 'Select from other groups or ungrouped' },
  'tagGroup.tagsSelected': { 'zh-CN': '个标签', 'en': 'tags' },
  'tagGroup.confirmDelete': { 'zh-CN': '确定要删除分组「{name}」吗？分组内的标签将变为未分组状态。', 'en': 'Are you sure you want to delete group "{name}"? Tags in this group will become ungrouped.' },
  'tagGroup.enterNewName': { 'zh-CN': '请输入新的分组名称：', 'en': 'Enter new group name:' },

  'layout.title': { 'zh-CN': '布局设置', 'en': 'Layout Settings' },
  'layout.sidebarAppearance': { 'zh-CN': '侧边栏外观', 'en': 'Sidebar Appearance' },
  'layout.bookmarkHeight': { 'zh-CN': '书签按钮高度', 'en': 'Bookmark Height' },
  'layout.bookmarkHeightDesc': { 'zh-CN': '调整侧边栏中书签和文件夹按钮的高度', 'en': 'Adjust height of bookmark and folder buttons' },
  'layout.treeIndent': { 'zh-CN': '目录缩进宽度', 'en': 'Tree Indent' },
  'layout.treeIndentDesc': { 'zh-CN': '调整树形目录中子文件夹的缩进宽度', 'en': 'Adjust indent of subfolders in tree' },
  'layout.bookmarkIndent': { 'zh-CN': '书签缩进宽度', 'en': 'Bookmark Indent' },
  'layout.bookmarkIndentDesc': { 'zh-CN': '调整书签相对于目录的缩进宽度', 'en': 'Adjust indent of bookmarks relative to folders' },
  'layout.layoutSaved': { 'zh-CN': '布局已保存', 'en': 'Layout saved' },
  'layout.sampleFolder': { 'zh-CN': '文件夹示例', 'en': 'Sample Folder' },
  'layout.sampleBookmark': { 'zh-CN': '书签示例', 'en': 'Sample Bookmark' },

  'freq.title': { 'zh-CN': '常用目录设置', 'en': 'Frequently Used Settings' },
  'freq.enable': { 'zh-CN': '启用常用目录', 'en': 'Enable Frequently Used' },
  'freq.enableDesc': { 'zh-CN': '在侧边栏顶部显示常用文件夹，展示最近访问最频繁的链接', 'en': 'Show frequently used folder at top of sidebar' },
  'freq.timeRange': { 'zh-CN': '统计时间范围', 'en': 'Time Range' },
  'freq.timeRangeDesc': { 'zh-CN': '统计最近多少天内的浏览记录', 'en': 'Statistics for recent browsing history' },
  'freq.last3days': { 'zh-CN': '最近 3 天', 'en': 'Last 3 days' },
  'freq.last7days': { 'zh-CN': '最近 7 天', 'en': 'Last 7 days' },
  'freq.last10days': { 'zh-CN': '最近 10 天', 'en': 'Last 10 days' },
  'freq.displayCount': { 'zh-CN': '显示数量', 'en': 'Display Count' },
  'freq.displayCountDesc': { 'zh-CN': '在常用文件夹中显示多少个链接（5-15 个）', 'en': 'Number of links to show (5-15)' },
  'freq.countUnit': { 'zh-CN': '个', 'en': '' },

  'blacklist.title': { 'zh-CN': '📋 黑名单管理', 'en': '📋 Blacklist Management' },
  'blacklist.management': { 'zh-CN': '黑名单管理', 'en': 'Blacklist Management' },
  'blacklist.desc': { 'zh-CN': '被屏蔽的域名永远不会出现在常用列表中。在侧边栏常用文件夹中右键点击链接可选择屏蔽。', 'en': 'Blocked domains will never appear in frequently used list.' },
  'blacklist.blockedDomains': { 'zh-CN': '已屏蔽的域名列表', 'en': 'Blocked Domains' },
  'blacklist.noBlocked': { 'zh-CN': '暂无屏蔽的域名', 'en': 'No blocked domains' },
  'blacklist.manualAdd': { 'zh-CN': '手动添加屏蔽域名', 'en': 'Add Domain to Block' },
  'blacklist.domainPlaceholder': { 'zh-CN': '例如：google.com', 'en': 'e.g.: google.com' },
  'blacklist.addDesc': { 'zh-CN': '输入域名（不需要协议和前缀），点击添加按钮', 'en': 'Enter domain (no protocol), click add' },

  'pinned.title': { 'zh-CN': '📌 置顶管理', 'en': '📌 Pinned Management' },
  'pinned.management': { 'zh-CN': '置顶管理', 'en': 'Pinned Management' },
  'pinned.desc': { 'zh-CN': '置顶的链接会固定在常用文件夹顶部，不受热度值刷新影响。在侧边栏常用文件夹中右键点击链接可选择置顶。', 'en': 'Pinned links stay at top of frequently used folder.' },
  'pinned.pinnedLinks': { 'zh-CN': '已置顶的链接', 'en': 'Pinned Links' },
  'pinned.noPinned': { 'zh-CN': '暂无置顶的链接', 'en': 'No pinned links' },
  'pinned.clearAll': { 'zh-CN': '清空所有置顶', 'en': 'Clear All Pinned' },
  'pinned.pinned': { 'zh-CN': '置顶链接', 'en': 'Pinned' },
  'pinned.addToFrequent': { 'zh-CN': '添加至常用并置顶', 'en': 'Add to Frequently Used & Pin' },

  'lang.title': { 'zh-CN': '语言设置', 'en': 'Language Settings' },
  'lang.select': { 'zh-CN': '选择语言', 'en': 'Select Language' },
  'lang.selectDesc': { 'zh-CN': '选择界面显示语言', 'en': 'Choose interface display language' },
  'lang.zhCN': { 'zh-CN': '简体中文', 'en': 'Chinese (Simplified)' },
  'lang.en': { 'zh-CN': 'English', 'en': 'English' },

  'help.title': { 'zh-CN': '操作说明', 'en': 'Help' },
  'help.userGuide': { 'zh-CN': '使用帮助', 'en': 'User Guide' },
  'help.quickStart': { 'zh-CN': '🚀 快速开始', 'en': '🚀 Quick Start' },
  'help.sidebar': { 'zh-CN': '侧边栏', 'en': 'Sidebar' },
  'help.openSidebar': { 'zh-CN': '打开侧边栏', 'en': 'Open Sidebar' },
  'help.openSidebarDesc': { 'zh-CN': '点击浏览器工具栏中的扩展图标', 'en': 'Click extension icon in browser toolbar' },
  'help.openBookmark': { 'zh-CN': '打开书签', 'en': 'Open Bookmark' },
  'help.openBookmarkDesc': { 'zh-CN': '点击书签项即可在新标签页中打开', 'en': 'Click bookmark to open in new tab' },
  'help.expandCollapse': { 'zh-CN': '展开/折叠文件夹', 'en': 'Expand/Collapse Folder' },
  'help.expandCollapseDesc': { 'zh-CN': '点击文件夹或左侧的展开箭头', 'en': 'Click folder or expand arrow' },
  'help.searchBookmarks': { 'zh-CN': '搜索书签', 'en': 'Search Bookmarks' },
  'help.searchBookmarksDesc': { 'zh-CN': '在搜索框中输入关键词进行搜索', 'en': 'Enter keywords in search box' },
  'help.switchTheme': { 'zh-CN': '切换主题', 'en': 'Switch Theme' },
  'help.switchThemeDesc': { 'zh-CN': '点击菜单按钮 → 深色模式开关', 'en': 'Click menu button → Dark mode toggle' },
  'help.rightClickMenu': { 'zh-CN': '右键菜单', 'en': 'Right-click Menu' },
  'help.rightClickMenuDesc': { 'zh-CN': '书签和文件夹支持右键删除、编辑操作', 'en': 'Right-click to delete or edit' },
  'help.dragSort': { 'zh-CN': '拖拽排序', 'en': 'Drag to Sort' },
  'help.dragSortDesc': { 'zh-CN': '可拖拽书签调整顺序', 'en': 'Drag bookmarks to reorder' },
  'help.dragMove': { 'zh-CN': '拖拽移动', 'en': 'Drag to Move' },
  'help.dragMoveDesc': { 'zh-CN': '可拖拽书签到文件夹中移动位置', 'en': 'Drag bookmarks to folders' },
  'help.freqUsed': { 'zh-CN': '常用目录', 'en': 'Frequently Used' },
  'help.enableFreqUsed': { 'zh-CN': '启用常用目录', 'en': 'Enable Frequently Used' },
  'help.enableFreqUsedDesc': { 'zh-CN': '点击菜单按钮 → 启用常用开关', 'en': 'Click menu button → Enable toggle' },
  'help.dynamicStats': { 'zh-CN': '动态统计', 'en': 'Dynamic Statistics' },
  'help.dynamicStatsDesc': { 'zh-CN': '自动统计最近访问最频繁的链接', 'en': 'Auto track most visited links' },
  'help.quickAdd': { 'zh-CN': '快速添加书签', 'en': 'Quick Add Bookmark' },
  'help.quickAddDesc': { 'zh-CN': '右键点击常用链接可快速添加到书签', 'en': 'Right-click to add to bookmarks' },
  'help.blacklist': { 'zh-CN': '黑名单功能', 'en': 'Blacklist' },
  'help.blacklistDesc': { 'zh-CN': '右键屏蔽特定域名，不再出现在常用列表中', 'en': 'Right-click to block domains' },
  'help.autoRefresh': { 'zh-CN': '自动刷新', 'en': 'Auto Refresh' },
  'help.autoRefreshDesc': { 'zh-CN': '打开侧边栏时自动更新，每 5 分钟自动刷新', 'en': 'Auto update on open, refresh every 5 min' },
  'help.manager': { 'zh-CN': '📚 管理器', 'en': '📚 Manager' },
  'help.managerText': { 'zh-CN': '管理器', 'en': 'Manager' },
  'help.navigation': { 'zh-CN': '导航', 'en': 'Navigation' },
  'help.browseFolders': { 'zh-CN': '浏览文件夹', 'en': 'Browse Folders' },
  'help.browseFoldersDesc': { 'zh-CN': '点击左侧文件夹树中的文件夹', 'en': 'Click folder in tree' },
  'help.collapseFolder': { 'zh-CN': '折叠文件夹', 'en': 'Collapse Folder' },
  'help.collapseFolderDesc': { 'zh-CN': '点击文件夹前的 ▶ 箭头图标', 'en': 'Click ▶ arrow before folder' },
  'help.breadcrumb': { 'zh-CN': '面包屑导航', 'en': 'Breadcrumb Navigation' },
  'help.breadcrumbDesc': { 'zh-CN': '点击顶部路径可快速跳转', 'en': 'Click path to navigate' },
  'help.bookmarkOps': { 'zh-CN': '书签操作', 'en': 'Bookmark Operations' },
  'help.addBookmark': { 'zh-CN': '添加书签', 'en': 'Add Bookmark' },
  'help.addBookmarkDesc': { 'zh-CN': '点击「+ 添加书签」按钮', 'en': 'Click "+ Add Bookmark" button' },
  'help.newFolder': { 'zh-CN': '新建文件夹', 'en': 'New Folder' },
  'help.newFolderDesc': { 'zh-CN': '点击「+ 新建文件夹」按钮，可选择存放位置', 'en': 'Click "+ New Folder" button' },
  'help.openLink': { 'zh-CN': '打开链接', 'en': 'Open Link' },
  'help.openLinkDesc': { 'zh-CN': '双击书签项可在新标签页中打开链接', 'en': 'Double-click to open in new tab' },
  'help.selectBookmark': { 'zh-CN': '选择书签', 'en': 'Select Bookmark' },
  'help.selectBookmarkDesc': { 'zh-CN': '单击书签项（不需要点击复选框）', 'en': 'Single click to select' },
  'help.batchSelect': { 'zh-CN': '批量选择', 'en': 'Batch Select' },
  'help.batchSelectDesc': { 'zh-CN': '按住 Shift 键点击可选择范围内的所有书签', 'en': 'Hold Shift and click to select range' },
  'help.selectAll': { 'zh-CN': '全选', 'en': 'Select All' },
  'help.selectAllDesc': { 'zh-CN': '按 Ctrl+A (Mac: Cmd+A)', 'en': 'Press Ctrl+A (Mac: Cmd+A)' },
  'help.deselect': { 'zh-CN': '取消选择', 'en': 'Deselect' },
  'help.deselectDesc': { 'zh-CN': '按 Esc 键', 'en': 'Press Esc key' },
  'help.deleteBookmark': { 'zh-CN': '删除书签', 'en': 'Delete Bookmark' },
  'help.deleteBookmarkDesc': { 'zh-CN': '点击书签右侧的删除按钮，或选中后按 Delete 键', 'en': 'Click delete button or press Delete key' },
  'help.editBookmark': { 'zh-CN': '编辑书签', 'en': 'Edit Bookmark' },
  'help.editBookmarkDesc': { 'zh-CN': '点击书签右侧的编辑按钮，可修改名称、URL 和移动文件夹', 'en': 'Click edit button to modify' },
  'help.dragOps': { 'zh-CN': '拖拽操作', 'en': 'Drag Operations' },
  'help.sortBookmarks': { 'zh-CN': '排序书签', 'en': 'Sort Bookmarks' },
  'help.sortBookmarksDesc': { 'zh-CN': '拖拽书签行可调整顺序', 'en': 'Drag bookmark row to reorder' },
  'help.moveToFolder': { 'zh-CN': '移动到文件夹', 'en': 'Move to Folder' },
  'help.moveToFolderDesc': { 'zh-CN': '将书签拖拽到左侧文件夹树上', 'en': 'Drag bookmark to folder tree' },
  'help.viewSwitch': { 'zh-CN': '视图切换', 'en': 'View Switching' },
  'help.listView': { 'zh-CN': '列表视图', 'en': 'List View' },
  'help.listViewDesc': { 'zh-CN': '显示详细信息，适合管理', 'en': 'Detailed view for management' },
  'help.gridView': { 'zh-CN': '网格视图', 'en': 'Grid View' },
  'help.gridViewDesc': { 'zh-CN': '卡片式布局，适合浏览', 'en': 'Card layout for browsing' },
  'help.tagManagement': { 'zh-CN': '🏷️ 标签管理', 'en': '🏷️ Tag Management' },
  'help.tagManagementText': { 'zh-CN': '标签管理', 'en': 'Tag Management' },
  'help.bookmarkTags': { 'zh-CN': '书签标签', 'en': 'Bookmark Tags' },
  'help.bookmarkTagsDesc': { 'zh-CN': '在书签详情面板输入标签名后按回车', 'en': 'Enter tag name and press Enter' },
  'help.batchAddTags': { 'zh-CN': '批量添加标签', 'en': 'Batch Add Tags' },
  'help.batchAddTagsDesc': { 'zh-CN': '选中多个书签后点击「添加标签」按钮', 'en': 'Select bookmarks and click "Add Tag"' },
  'help.deleteTag': { 'zh-CN': '删除标签', 'en': 'Delete Tag' },
  'help.deleteTagDesc': { 'zh-CN': '点击标签上的 × 按钮即可删除', 'en': 'Click × button on tag' },
  'help.tagDisplay': { 'zh-CN': '标签显示', 'en': 'Tag Display' },
  'help.tagDisplayDesc': { 'zh-CN': '书签列表和详情页都会显示标签', 'en': 'Tags shown in list and details' },
  'help.tagSearch': { 'zh-CN': '标签搜索', 'en': 'Tag Search' },
  'help.tagSearchDesc': { 'zh-CN': '在搜索框输入 #标签名 可搜索包含该标签的所有书签', 'en': 'Search #tagname to find bookmarks' },
  'help.viewAllTags': { 'zh-CN': '查看所有标签', 'en': 'View All Tags' },
  'help.viewAllTagsDesc': { 'zh-CN': '设置 → 标签总览，显示所有标签及书签数量', 'en': 'Settings → Tags Overview' },
  'help.viewTagDetail': { 'zh-CN': '查看标签详情', 'en': 'View Tag Details' },
  'help.viewTagDetailDesc': { 'zh-CN': '点击标签卡片可查看该标签下的所有书签', 'en': 'Click tag card to view bookmarks' },
  'help.openInWindow': { 'zh-CN': '在新窗口打开', 'en': 'Open in New Window' },
  'help.openInWindowDesc': { 'zh-CN': '点击书签列表中的书签可在新窗口打开', 'en': 'Click bookmark to open in new window' },
  'help.tagBackup': { 'zh-CN': '标签备份', 'en': 'Tag Backup' },
  'help.webdavBackup': { 'zh-CN': 'WebDAV 备份', 'en': 'WebDAV Backup' },
  'help.webdavBackupDesc': { 'zh-CN': '使用 WebDAV 备份时自动包含标签数据', 'en': 'Tags included in WebDAV backup' },
  'help.exportAlone': { 'zh-CN': '独立导出', 'en': 'Independent Export' },
  'help.exportAloneDesc': { 'zh-CN': '设置 → 备份与恢复 → 导出标签，导出为 JSON 文件', 'en': 'Settings → Backup → Export Tags as JSON' },
  'help.importAlone': { 'zh-CN': '独立导入', 'en': 'Independent Import' },
  'help.importAloneDesc': { 'zh-CN': '从 JSON 文件导入标签数据（合并到现有数据）', 'en': 'Import tags from JSON (merge)' },
  'help.dataCleanup': { 'zh-CN': '数据清理', 'en': 'Data Cleanup' },
  'help.dataCleanupDesc': { 'zh-CN': '检测并清理已删除书签的孤立标签', 'en': 'Detect and clean orphan tags' },
  'help.settings': { 'zh-CN': '⚙️ 设置', 'en': '⚙️ Settings' },
  'help.settingsDesc': { 'zh-CN': '配置 WebDAV 服务器地址和认证信息', 'en': 'Configure WebDAV server and credentials' },
  'help.autoBackup': { 'zh-CN': '支持自动定时备份', 'en': 'Support scheduled backup' },
  'help.autoStartup': { 'zh-CN': '支持启动时自动备份', 'en': 'Support backup on startup' },
  'help.includeTags': { 'zh-CN': '备份数据包含书签和标签', 'en': 'Backup includes bookmarks and tags' },
  'help.mergeMode': { 'zh-CN': '合并模式', 'en': 'Merge Mode' },
  'help.mergeModeDesc': { 'zh-CN': '将备份与现有书签合并，保留现有书签', 'en': 'Merge with existing bookmarks' },
  'help.overwriteMode': { 'zh-CN': '覆盖模式', 'en': 'Replace Mode' },
  'help.overwriteModeDesc': { 'zh-CN': '删除所有现有书签，用备份替换（谨慎使用）', 'en': 'Replace all bookmarks (use with caution)' },
  'help.exportImportTags': { 'zh-CN': '独立导出或导入标签数据', 'en': 'Export or import tags separately' },
  'help.detectCleanOrphan': { 'zh-CN': '检测并清理孤立标签', 'en': 'Detect and clean orphan tags' },
  'help.freqSettings': { 'zh-CN': '常用目录设置', 'en': 'Frequently Used Settings' },
  'help.enableDisable': { 'zh-CN': '启用/禁用', 'en': 'Enable/Disable' },
  'help.enableDisableDesc': { 'zh-CN': '开启或关闭常用目录功能', 'en': 'Turn on/off frequently used feature' },
  'help.timePeriod': { 'zh-CN': '时间范围', 'en': 'Time Range' },
  'help.timePeriodDesc': { 'zh-CN': '选择统计周期（3/7/10 天）', 'en': 'Select statistics period (3/7/10 days)' },
  'help.setCount': { 'zh-CN': '设置显示的常用链接数量（5-15 个）', 'en': 'Set number of links to show (5-15)' },
  'help.blacklistMgmt': { 'zh-CN': '查看和管理已屏蔽的域名列表', 'en': 'View and manage blocked domains' },
  'help.pinnedMgmt': { 'zh-CN': '查看和管理已置顶的链接，置顶链接固定在常用文件夹顶部', 'en': 'View and manage pinned links' },
  'help.bookmarkHeight': { 'zh-CN': '书签按钮高度', 'en': 'Bookmark Height' },
  'help.bookmarkHeightHelp': { 'zh-CN': '调整侧边栏中书签项的高度 (24-48px)', 'en': 'Adjust bookmark height (24-48px)' },
  'help.treeIndentHelp': { 'zh-CN': '调整树形目录中子文件夹的缩进 (5-20px)', 'en': 'Adjust tree indent (5-20px)' },
  'help.bookmarkIndentHelp': { 'zh-CN': '调整书签相对于目录的缩进 (5-20px)', 'en': 'Adjust bookmark indent (5-20px)' },
  'help.shortcuts': { 'zh-CN': '⌨️ 快捷键', 'en': '⌨️ Keyboard Shortcuts' },
  'help.shortcutsText': { 'zh-CN': '快捷键', 'en': 'Keyboard Shortcuts' },
  'help.selectAllShortcut': { 'zh-CN': '全选当前文件夹下的所有书签', 'en': 'Select all bookmarks in current folder' },
  'help.deleteSelected': { 'zh-CN': '删除选中的书签', 'en': 'Delete selected bookmarks' },
  'help.batchSelectShortcut': { 'zh-CN': '批量选择范围内的书签', 'en': 'Batch select bookmarks in range' },

  'manager.newFolder': { 'zh-CN': '+ 新建文件夹', 'en': '+ New Folder' },
  'manager.addBookmark': { 'zh-CN': '+ 添加书签', 'en': '+ Add Bookmark' },
  'manager.addTag': { 'zh-CN': '添加标签', 'en': 'Add Tag' },

  'sidebar.visitTimes': { 'zh-CN': '访问次', 'en': 'visits' },
  'sidebar.noPinnedLinks': { 'zh-CN': '暂无置顶链接', 'en': 'No pinned links' },

  'dialog.selectTagToGroup': { 'zh-CN': '选择标签添加到分组', 'en': 'Select tags to add to group' },
  'dialog.selectFromOther': { 'zh-CN': '从其他分组或未分组中选择标签', 'en': 'Select from other groups or ungrouped' },
  'dialog.tagsSelected': { 'zh-CN': '个标签', 'en': 'tags' },

  'freq.freqUsed': { 'zh-CN': '常用', 'en': 'Frequently Used' },

  'confirm.deleteBookmark': { 'zh-CN': '确定要删除书签 "{name}" 吗？', 'en': 'Are you sure you want to delete bookmark "{name}"?' },
  'confirm.deleteBookmarks': { 'zh-CN': '确定要删除选中的 {count} 个书签吗？', 'en': 'Are you sure you want to delete {count} selected bookmarks?' },
  'confirm.deleteFolder': { 'zh-CN': '确定要删除文件夹"{name}"及其所有内容吗？此操作不可撤销。', 'en': 'Are you sure you want to delete folder "{name}" and all its contents? This cannot be undone.' },

  'common.noName': { 'zh-CN': '未命名书签', 'en': 'Unnamed Bookmark' },
  'common.noNameFolder': { 'zh-CN': '未命名文件夹', 'en': 'Unnamed Folder' },
  'common.unknown': { 'zh-CN': '未知', 'en': 'Unknown' },
  'common.enterTag': { 'zh-CN': '输入标签名后按回车添加', 'en': 'Enter tag name and press Enter' },
  'common.remove': { 'zh-CN': '移除', 'en': 'Remove' },
  'common.detecting': { 'zh-CN': '检测中...', 'en': 'Detecting...' },
  'common.cleaning': { 'zh-CN': '清理中...', 'en': 'Cleaning...' },
  'common.deleting': { 'zh-CN': '删除中...', 'en': 'Deleting...' },
  'common.refreshPage': { 'zh-CN': '请刷新页面查看', 'en': 'Please refresh the page' },

  'webdav.enableFirst': { 'zh-CN': '请先启用并配置 WebDAV', 'en': 'Please enable and configure WebDAV first' },

  'backup.restoreConfirm': { 'zh-CN': '确定要恢复备份吗？这将使用{mode}模式恢复书签。', 'en': 'Are you sure you want to restore backup? This will use {mode} mode to restore bookmarks.' },
  'backup.restoring': { 'zh-CN': '正在恢复...', 'en': 'Restoring...' },
  'backup.restoreLayoutConfirm': { 'zh-CN': '确定要从 WebDAV 恢复布局设置吗？这将覆盖当前布局设置。', 'en': 'Are you sure you want to restore layout settings from WebDAV? This will overwrite current layout settings.' },
  'backup.restoringLayout': { 'zh-CN': '正在恢复布局...', 'en': 'Restoring layout...' },
  'backup.restoreLayoutSuccess': { 'zh-CN': '布局恢复成功', 'en': 'Layout restored successfully' },
  'backup.invalidLayoutFile': { 'zh-CN': '无效的布局文件', 'en': 'Invalid layout file' },

  'cleanup.detectingOrphan': { 'zh-CN': '正在检测孤立标签...', 'en': 'Detecting orphaned tags...' },
  'cleanup.noOrphanFound': { 'zh-CN': '检测完成，未发现孤立标签', 'en': 'Detection complete, no orphaned tags found' },
  'cleanup.orphanFound': { 'zh-CN': '检测到 {count} 个孤立标签，请点击"清理无效标签"按钮进行清理', 'en': 'Found {count} orphaned tags, please click "Clean Invalid Tags" button to clean' },
  'cleanup.detectFailed': { 'zh-CN': '检测失败', 'en': 'Detection failed' },
  'cleanup.noOrphanToClean': { 'zh-CN': '没有需要清理的孤立标签', 'en': 'No orphaned tags to clean' },
  'cleanup.confirmClean': { 'zh-CN': '检测到 {count} 个孤立标签，确定要清理吗？\n\n清理后将删除这些书签的标签数据，此操作不可撤销。', 'en': 'Found {count} orphaned tags, are you sure you want to clean?\n\nThis will delete tag data for these bookmarks, this action cannot be undone.' },
  'cleanup.cleaningOrphan': { 'zh-CN': '正在清理孤立标签...', 'en': 'Cleaning orphaned tags...' },
  'cleanup.cleanSuccess': { 'zh-CN': '清理完成！共删除 {count} 个孤立标签', 'en': 'Clean complete! Deleted {count} orphaned tags' },
  'cleanup.cleanFailed': { 'zh-CN': '清理失败', 'en': 'Clean failed' },

  'duplicate.selectFirst': { 'zh-CN': '请选择要删除的书签', 'en': 'Please select bookmarks to delete' },

  'webdav.enterUrl': { 'zh-CN': '请输入服务器地址', 'en': 'Please enter server URL' },
  'webdav.testingConnection': { 'zh-CN': '正在测试连接...', 'en': 'Testing connection...' },
  'webdav.enableNeedUrl': { 'zh-CN': '启用 WebDAV 时需要填写服务器地址', 'en': 'Server URL is required when enabling WebDAV' },
  'webdav.configSaved': { 'zh-CN': '配置已保存', 'en': 'Configuration saved' },

  'backup.settingsSaved': { 'zh-CN': '备份设置已保存', 'en': 'Backup settings saved' },
  'backup.backingUp': { 'zh-CN': '正在备份...', 'en': 'Backing up...' },
  'backup.backupSuccess': { 'zh-CN': '备份成功', 'en': 'Backup successful' },
  'backup.backupFailed': { 'zh-CN': '备份失败', 'en': 'Backup failed' },
  'backup.layoutBackupSuccess': { 'zh-CN': '布局备份成功', 'en': 'Layout backup successful' },

  'common.resetSuccess': { 'zh-CN': '已恢复默认设置', 'en': 'Default settings restored' },
  'common.resetFailed': { 'zh-CN': '重置失败，请重试', 'en': 'Reset failed, please try again' },
  'common.saveFailed': { 'zh-CN': '保存失败，请重试', 'en': 'Save failed, please try again' },
  'common.enterDomain': { 'zh-CN': '请输入域名', 'en': 'Please enter domain' },
  'common.addSuccess': { 'zh-CN': '添加成功', 'en': 'Added successfully' },
  'common.addFailed': { 'zh-CN': '添加失败，请重试', 'en': 'Add failed, please try again' },
  'common.clearSuccess': { 'zh-CN': '已清空所有', 'en': 'All cleared' },
  'common.clearFailed': { 'zh-CN': '清空失败', 'en': 'Clear failed' },
  'common.createFailed': { 'zh-CN': '创建失败', 'en': 'Create failed' },
  'common.deleteFailed': { 'zh-CN': '删除失败', 'en': 'Delete failed' },
  'common.renameFailed': { 'zh-CN': '重命名失败', 'en': 'Rename failed' },
  'common.removeFailed': { 'zh-CN': '移除失败', 'en': 'Remove failed' },
  'common.unpin': { 'zh-CN': '取消置顶', 'en': 'Unpin' },
  'common.confirmClearPinned': { 'zh-CN': '确定要清空所有置顶链接吗？', 'en': 'Are you sure you want to clear all pinned links?' },

  'tags.exportSuccess': { 'zh-CN': '标签和分组导出成功', 'en': 'Tags and groups exported successfully' },
  'tags.exportFailed': { 'zh-CN': '导出失败', 'en': 'Export failed' },
  'tags.importSuccess': { 'zh-CN': '标签导入成功', 'en': 'Tags imported successfully' },
  'tags.importFailed': { 'zh-CN': '导入失败', 'en': 'Import failed' },
  'tags.readFailed': { 'zh-CN': '文件读取失败', 'en': 'File read failed' },
  'tags.addFailed': { 'zh-CN': '添加标签失败', 'en': 'Failed to add tag' },
  'tags.createGroupFailed': { 'zh-CN': '创建分组失败', 'en': 'Failed to create group' },
  'tags.deleteGroupFailed': { 'zh-CN': '删除分组失败', 'en': 'Failed to delete group' },
  'tags.renameGroupFailed': { 'zh-CN': '重命名分组失败', 'en': 'Failed to rename group' },

  'config.exportSuccess': { 'zh-CN': '配置导出成功', 'en': 'Configuration exported successfully' },
  'config.importSuccess': { 'zh-CN': '配置导入成功', 'en': 'Configuration imported successfully' },
  'config.importFailed': { 'zh-CN': '配置导入失败', 'en': 'Configuration import failed' },

  'layout.exportSuccess': { 'zh-CN': '布局设置导出成功', 'en': 'Layout settings exported successfully' },
  'layout.importSuccess': { 'zh-CN': '布局设置导入成功', 'en': 'Layout settings imported successfully' },

  'duplicate.noDuplicates': { 'zh-CN': '没有发现重复书签', 'en': 'No duplicate bookmarks found' },
  'duplicate.scanning': { 'zh-CN': '正在扫描书签...', 'en': 'Scanning bookmarks...' },

  'backup.backingUpLayout': { 'zh-CN': '正在备份布局...', 'en': 'Backing up layout...' },

  'layout.exportFailed': { 'zh-CN': '导出失败', 'en': 'Export failed' },
  'layout.importFailed': { 'zh-CN': '导入失败', 'en': 'Import failed' },

  'freq.saveFailed': { 'zh-CN': '保存常用目录设置失败', 'en': 'Failed to save frequently used settings' },
  'freq.resetFailed': { 'zh-CN': '重置常用目录设置失败', 'en': 'Failed to reset frequently used settings' },

  'pinned.clearFailed': { 'zh-CN': '清空置顶失败', 'en': 'Failed to clear pinned' },

  'blacklist.addSuccess': { 'zh-CN': '已添加到黑名单', 'en': 'Added to blacklist' },
  'blacklist.addFailed': { 'zh-CN': '添加到黑名单失败', 'en': 'Failed to add to blacklist' },

  'tagGroup.groups': { 'zh-CN': '个标签分组', 'en': 'tag groups' },
  'tagGroup.tags': { 'zh-CN': '个标签', 'en': 'tags' },
  'tagGroup.loadFailed': { 'zh-CN': '加载标签总览失败', 'en': 'Failed to load tags overview' },
  'tagGroup.enterName': { 'zh-CN': '请输入分组名称', 'en': 'Enter group name' },
  'tagGroup.loadDetailFailed': { 'zh-CN': '加载标签详情失败', 'en': 'Failed to load tag details' },

  'tags.invalidFileFormat': { 'zh-CN': '文件格式不正确', 'en': 'Invalid file format' },
  'tags.importConfirm': { 'zh-CN': '确定要导入 {count} 个书签的标签数据{groups}吗？\n\n这将合并到现有数据中，冲突的数据将被覆盖。', 'en': 'Are you sure you want to import tag data for {count} bookmarks{groups}?\n\nThis will merge into existing data, conflicting data will be overwritten.' },
  'tags.importSuccessWithCount': { 'zh-CN': '导入成功！共导入 {count} 个书签的标签{groups}', 'en': 'Import successful! Imported tags for {count} bookmarks{groups}' },
  'tags.addTagToGroupFailed': { 'zh-CN': '添加标签到分组失败', 'en': 'Failed to add tag to group' },
  'tags.removeTagFromGroupFailed': { 'zh-CN': '从分组移除标签失败', 'en': 'Failed to remove tag from group' },

  'common.noTitle': { 'zh-CN': '无标题', 'en': 'No title' },

  'common.enterTitleAndUrl': { 'zh-CN': '请填写标题和网址', 'en': 'Please enter title and URL' },
  'common.createFolderFailed': { 'zh-CN': '创建文件夹失败', 'en': 'Failed to create folder' },
  'common.addFailedRetry': { 'zh-CN': '添加失败，请重试', 'en': 'Add failed, please try again' },
  'common.createFolderFailedRetry': { 'zh-CN': '创建文件夹失败，请重试', 'en': 'Failed to create folder, please try again' },
  'common.dragFailed': { 'zh-CN': '拖拽失败', 'en': 'Drag failed' },
  'common.targetNotFound': { 'zh-CN': '找不到目标节点', 'en': 'Target not found' },
  'common.targetLocationNotFound': { 'zh-CN': '无法找到目标位置，请重试', 'en': 'Cannot find target location, please try again' },
};

translations['zh-CN'] = Object.fromEntries(
  Object.entries(i18nData).map(([key, value]) => [key, value['zh-CN'] || key])
);
translations['en'] = Object.fromEntries(
  Object.entries(i18nData).map(([key, value]) => [key, value['en'] || key])
);

class I18n {
  static currentLang = 'zh-CN';
  static observer = null;
  static initialized = false;

  static async init() {
    if (this.initialized) {
      return this.currentLang;
    }
    
    const result = await Storage.get(['language']);
    this.currentLang = result.language || 'zh-CN';
    
    if (this.currentLang !== 'zh-CN') {
      this.translatePage();
    }
    
    this.initialized = true;
    return this.currentLang;
  }

  static async setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      await Storage.set({ language: lang });
      location.reload();
      return true;
    }
    return false;
  }

  static t(key, vars = {}) {
    let text = translations[this.currentLang][key] || translations['zh-CN'][key] || key;
    
    if (typeof text === 'string' && Object.keys(vars).length > 0) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    
    return text;
  }

  static updateElement(el, key, vars = {}) {
    if (!el || !key) return;
    el.textContent = this.t(key, vars);
  }

  static translatePage() {
    if (this.currentLang === 'zh-CN') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key) {
        const translated = this.t(key);
        if (el.tagName === 'TITLE') {
          document.title = translated;
        } else {
          el.textContent = translated;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (key) {
        el.placeholder = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (key) {
        el.title = this.t(key);
      }
    });

    this.setupObserver();
  }

  static setupObserver() {
    if (this.observer) return;
    
    this.observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.dataset && (node.dataset.i18n || node.dataset.i18nPlaceholder || node.dataset.i18nTitle)) {
                shouldTranslate = true;
              }
              const translated = node.querySelector ? node.querySelector('[data-i18n], [data-i18n-placeholder], [data-i18n-title]') : null;
              if (translated) {
                shouldTranslate = true;
              }
            }
          });
        }
      });
      
      if (shouldTranslate && this.currentLang !== 'zh-CN') {
        this.translatePage();
      }
    });
    
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  static updateAll() {
    if (this.currentLang !== 'zh-CN') {
      this.translatePage();
    }
  }

  static getAvailableLanguages() {
    return [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en', name: 'English' }
    ];
  }
}
