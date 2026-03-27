/**
 * 语言翻译文件
 * 支持: zh-CN (简体中文), en (English)
 */

const translations = {
  'zh-CN': {},
  'en': {}
};

const zhText = {
  // 通用
  'settings': '设置',
  '设置': '设置',
  'save': '保存',
  'cancel': '取消',
  'delete': '删除',
  'edit': '编辑',
  'confirm': '确认',
  'close': '关闭',
  'loading': '加载中...',
  'success': '成功',
  'error': '错误',
  'warning': '警告',
  'backup': '备份',
  'restore': '恢复',
  'export': '导出',
  'import': '导入',
  'enable': '启用',
  'disable': '禁用',
  'enabled': '已启用',
  'disabled': '已禁用',
  'yes': '是',
  'no': '否',
  'ok': '确定',
  'back': '返回',
  'refresh': '刷新',
  'search': '搜索',
  'all': '全部',
  'none': '无',
  'more': '更多',
  'less': '更少',
  'default': '默认',
  'custom': '自定义',
  
  // 设置页面 - 侧边栏菜单
  'WebDAV 同步': 'WebDAV 同步',
  '备份与恢复': '备份与恢复',
  '标签总览': '标签总览',
  '布局': '布局',
  '常用目录': '常用目录',
  '语言': '语言',
  '操作说明': '操作说明',
  '返回管理器': '返回管理器',
  
  // 设置页面 - WebDAV
  'WebDAV 同步设置': 'WebDAV 同步设置',
  '启用 WebDAV 同步': '启用 WebDAV 同步',
  '服务器地址': '服务器地址',
  '用户名': '用户名',
  '密码': '密码',
  '测试连接': '测试连接',
  '保存设置': '保存设置',
  '连接成功': '连接成功',
  '连接失败': '连接失败',
  '设置已保存': '设置已保存',
  '开启后可以将书签备份到 WebDAV 服务器': '开启后可以将书签备份到 WebDAV 服务器',
  'WebDAV 服务器地址，例如：https://example.com/dav': 'WebDAV 服务器地址，例如：https://example.com/dav',
  
  // 设置页面 - 备份
  '自动备份': '自动备份',
  '启用自动备份': '启用自动备份',
  '备份间隔': '备份间隔',
  '备份间隔（分钟）': '备份间隔（分钟）',
  '每 15 分钟': '每 15 分钟',
  '每 30 分钟': '每 30 分钟',
  '每 1 小时': '每 1 小时',
  '每 3 小时': '每 3 小时',
  '每 6 小时': '每 6 小时',
  '每 12 小时': '每 12 小时',
  '每天': '每天',
  '启动时备份': '启动时备份',
  '每次打开浏览器时自动备份书签': '每次打开浏览器时自动备份书签',
  '手动操作': '手动操作',
  '书签备份': '书签备份',
  '备份书签': '备份书签',
  '将当前书签备份到 WebDAV 服务器': '将当前书签备份到 WebDAV 服务器',
  '书签恢复': '书签恢复',
  '恢复书签': '恢复书签',
  '从 WebDAV 服务器恢复书签备份': '从 WebDAV 服务器恢复书签备份',
  '恢复备份': '恢复备份',
  '恢复模式': '恢复模式',
  '合并': '合并',
  '覆盖': '覆盖',
  '备份成功': '备份成功',
  '备份失败': '备份失败',
  '恢复成功': '恢复成功',
  '恢复失败': '恢复失败',
  '布局备份': '布局备份',
  '备份布局': '备份布局',
  '将布局设置备份到 WebDAV 服务器': '将布局设置备份到 WebDAV 服务器',
  '布局恢复': '布局恢复',
  '恢复布局': '恢复布局',
  '从 WebDAV 服务器恢复布局设置': '从 WebDAV 服务器恢复布局设置',
  '统一导出/导入': '统一导出/导入',
  '导出或导入书签、布局、标签配置': '导出或导入书签、布局、标签配置',
  '导出配置': '导出配置',
  '导入配置': '导入配置',
  '从 JSON 文件导入配置（自动识别内容类型）': '从 JSON 文件导入配置（自动识别内容类型）',
  '选择文件': '选择文件',
  '选择导出内容': '选择导出内容',
  '书签': '书签',
  '布局设置': '布局设置',
  '标签': '标签',
  
  // 标签数据清理
  '标签数据清理': '标签数据清理',
  '检测并清理已删除书签的孤立标签数据': '检测并清理已删除书签的孤立标签数据',
  '检测孤立标签': '检测孤立标签',
  '检查标签数据中是否存在对应书签已被删除的孤立标签': '检查标签数据中是否存在对应书签已被删除的孤立标签',
  '开始检测': '开始检测',
  '清理无效标签': '清理无效标签',
  '删除所有孤立标签数据，释放存储空间': '删除所有孤立标签数据，释放存储空间',
  
  // 书签查重
  '书签查重': '书签查重',
  '检测并删除重复的书签（相同URL的书签）': '检测并删除重复的书签（相同URL的书签）',
  '扫描所有书签，查找相同URL的重复书签': '扫描所有书签，查找相同URL的重复书签',
  '检测结果': '检测结果',
  '删除选中': '删除选中',
  '全选': '全选',
  
  // 标签分组
  '标签分组': '标签分组',
  '创建分组来组织管理标签，方便快速添加标签': '创建分组来组织管理标签，方便快速添加标签',
  '新建分组': '新建分组',
  '未分组标签': '未分组标签',
  '以下标签尚未归类到任何分组，点击可查看详情': '以下标签尚未归类到任何分组，点击可查看详情',
  '标签分组管理': '标签分组管理',
  
  // 选择标签弹窗
  '选择标签添加到分组': '选择标签添加到分组',
  '从其他分组或未分组中选择标签': '从其他分组或未分组中选择标签',
  '已选择': '已选择',
  '个标签': '个标签',
  '确定': '确定',
  
  // 设置页面 - 布局
  '侧边栏外观': '侧边栏外观',
  '书签按钮高度': '书签按钮高度',
  '调整侧边栏中书签和文件夹按钮的高度': '调整侧边栏中书签和文件夹按钮的高度',
  '目录缩进宽度': '目录缩进宽度',
  '调整树形目录中子文件夹的缩进宽度': '调整树形目录中子文件夹的缩进宽度',
  '书签缩进宽度': '书签缩进宽度',
  '调整书签相对于目录的缩进宽度': '调整书签相对于目录的缩进宽度',
  '预览': '预览',
  '恢复默认': '恢复默认',
  '文件夹示例': '文件夹示例',
  '书签示例': '书签示例',
  '布局已保存': '布局已保存',
  
  // 设置页面 - 常用目录
  '常用目录设置': '常用目录设置',
  '启用常用目录': '启用常用目录',
  '在侧边栏顶部显示常用文件夹，展示最近访问最频繁的链接': '在侧边栏顶部显示常用文件夹，展示最近访问最频繁的链接',
  '统计时间范围': '统计时间范围',
  '统计最近多少天内的浏览记录': '统计最近多少天内的浏览记录',
  '最近 3 天': '最近 3 天',
  '最近 7 天': '最近 7 天',
  '最近 10 天': '最近 10 天',
  '显示数量': '显示数量',
  '在常用文件夹中显示多少个链接（5-15 个）': '在常用文件夹中显示多少个链接（5-15 个）',
  '个': '个',
  
  // 黑名单管理
  '📋 黑名单管理': '📋 黑名单管理',
  '黑名单管理': '黑名单管理',
  '被屏蔽的域名永远不会出现在常用列表中。在侧边栏常用文件夹中右键点击链接可选择屏蔽。': '被屏蔽的域名永远不会出现在常用列表中。在侧边栏常用文件夹中右键点击链接可选择屏蔽。',
  '已屏蔽的域名列表': '已屏蔽的域名列表',
  '暂无屏蔽的域名': '暂无屏蔽的域名',
  '手动添加屏蔽域名': '手动添加屏蔽域名',
  '添加': '添加',
  '输入域名（不需要协议和前缀），点击添加按钮': '输入域名（不需要协议和前缀），点击添加按钮',
  
  // 置顶管理
  '📌 置顶管理': '📌 置顶管理',
  '置顶管理': '置顶管理',
  '置顶的链接会固定在常用文件夹顶部，不受热度值刷新影响。在侧边栏常用文件夹中右键点击链接可选择置顶。': '置顶的链接会固定在常用文件夹顶部，不受热度值刷新影响。在侧边栏常用文件夹中右键点击链接可选择置顶。',
  '已置顶的链接': '已置顶的链接',
  '暂无置顶的链接': '暂无置顶的链接',
  '清空所有置顶': '清空所有置顶',
  '置顶链接': '置顶链接',
  '常用': '常用',
  
  // 设置页面 - 语言
  '语言设置': '语言设置',
  '选择语言': '选择语言',
  '选择界面显示语言': '选择界面显示语言',
  '简体中文': '简体中文',
  
  // 设置页面 - 帮助
  '操作说明': '操作说明',
  '使用帮助': '使用帮助',
  '🚀 快速开始': '🚀 快速开始',
  '快速开始': '快速开始',
  '侧边栏': '侧边栏',
  '打开侧边栏': '打开侧边栏',
  '点击浏览器工具栏中的扩展图标': '点击浏览器工具栏中的扩展图标',
  '打开书签': '打开书签',
  '点击书签项即可在新标签页中打开': '点击书签项即可在新标签页中打开',
  '展开/折叠文件夹': '展开/折叠文件夹',
  '点击文件夹或左侧的展开箭头': '点击文件夹或左侧的展开箭头',
  '搜索书签': '搜索书签',
  '在搜索框中输入关键词进行搜索': '在搜索框中输入关键词进行搜索',
  '切换主题': '切换主题',
  '点击菜单按钮 → 深色模式开关': '点击菜单按钮 → 深色模式开关',
  '右键菜单': '右键菜单',
  '书签和文件夹支持右键删除、编辑操作': '书签和文件夹支持右键删除、编辑操作',
  '拖拽排序': '拖拽排序',
  '可拖拽书签调整顺序': '可拖拽书签调整顺序',
  '拖拽移动': '拖拽移动',
  '可拖拽书签到文件夹中移动位置': '可拖拽书签到文件夹中移动位置',
  
  // 常用目录帮助
  '常用目录': '常用目录',
  '启用常用目录': '启用常用目录',
  '点击菜单按钮 → 启用常用开关': '点击菜单按钮 → 启用常用开关',
  '动态统计': '动态统计',
  '自动统计最近访问最频繁的链接': '自动统计最近访问最频繁的链接',
  '快速添加书签': '快速添加书签',
  '右键点击常用链接可快速添加到书签': '右键点击常用链接可快速添加到书签',
  '黑名单功能': '黑名单功能',
  '右键屏蔽特定域名，不再出现在常用列表中': '右键屏蔽特定域名，不再出现在常用列表中',
  '自动刷新': '自动刷新',
  '打开侧边栏时自动更新，每 5 分钟自动刷新': '打开侧边栏时自动更新，每 5 分钟自动刷新',
  
  // 管理器帮助
  '📚 管理器': '📚 管理器',
  '管理器': '管理器',
  '导航': '导航',
  '浏览文件夹': '浏览文件夹',
  '点击左侧文件夹树中的文件夹': '点击左侧文件夹树中的文件夹',
  '折叠文件夹': '折叠文件夹',
  '点击文件夹前的 ▶ 箭头图标': '点击文件夹前的 ▶ 箭头图标',
  '面包屑导航': '面包屑导航',
  '点击顶部路径可快速跳转': '点击顶部路径可快速跳转',
  
  // 书签操作
  '书签操作': '书签操作',
  '添加书签': '添加书签',
  '点击「+ 添加书签」按钮': '点击「+ 添加书签」按钮',
  '新建文件夹': '新建文件夹',
  '点击「+ 新建文件夹」按钮，可选择存放位置': '点击「+ 新建文件夹」按钮，可选择存放位置',
  '双击书签项可在新标签页中打开链接': '双击书签项可在新标签页中打开链接',
  '选择书签': '选择书签',
  '单击书签项（不需要点击复选框）': '单击书签项（不需要点击复选框）',
  '批量选择': '批量选择',
  '按住 Shift 键点击可选择范围内的所有书签': '按住 Shift 键点击可选择范围内的所有书签',
  '全选': '全选',
  '取消选择': '取消选择',
  '按 Esc 键': '按 Esc 键',
  '删除书签': '删除书签',
  '点击书签右侧的删除按钮，或选中后按 Delete 键': '点击书签右侧的删除按钮，或选中后按 Delete 键',
  '编辑书签': '编辑书签',
  '点击书签右侧的编辑按钮，可修改名称、URL 和移动文件夹': '点击书签右侧的编辑按钮，可修改名称、URL 和移动文件夹',
  
  // 拖拽操作
  '拖拽操作': '拖拽操作',
  '排序书签': '排序书签',
  '拖拽书签行可调整顺序': '拖拽书签行可调整顺序',
  '移动到文件夹': '移动到文件夹',
  '将书签拖拽到左侧文件夹树上': '将书签拖拽到左侧文件夹树上',
  
  // 视图切换
  '视图切换': '视图切换',
  '列表视图': '列表视图',
  '显示详细信息，适合管理': '显示详细信息，适合管理',
  '网格视图': '网格视图',
  '卡片式布局，适合浏览': '卡片式布局，适合浏览',
  
  // 标签管理帮助
  '🏷️ 标签管理': '🏷️ 标签管理',
  '标签管理': '标签管理',
  '书签标签': '书签标签',
  '在书签详情面板输入标签名后按回车': '在书签详情面板输入标签名后按回车',
  '批量添加标签': '批量添加标签',
  '选中多个书签后点击「添加标签」按钮': '选中多个书签后点击「添加标签」按钮',
  '删除标签': '删除标签',
  '点击标签上的 × 按钮即可删除': '点击标签上的 × 按钮即可删除',
  '标签显示': '标签显示',
  '书签列表和详情页都会显示标签': '书签列表和详情页都会显示标签',
  '标签搜索': '标签搜索',
  '在搜索框输入 #标签名 可搜索包含该标签的所有书签': '在搜索框输入 #标签名 可搜索包含该标签的所有书签',
  
  // 标签总览
  '查看所有标签': '查看所有标签',
  '设置 → 标签总览，显示所有标签及书签数量': '设置 → 标签总览，显示所有标签及书签数量',
  '查看标签详情': '查看标签详情',
  '点击标签卡片可查看该标签下的所有书签': '点击标签卡片可查看该标签下的所有书签',
  '点击书签列表中的书签可在新窗口打开': '点击书签列表中的书签可在新窗口打开',
  
  // 标签备份
  '标签备份': '标签备份',
  'WebDAV 备份': 'WebDAV 备份',
  '使用 WebDAV 备份时自动包含标签数据': '使用 WebDAV 备份时自动包含标签数据',
  '独立导出': '独立导出',
  '设置 → 备份与恢复 → 导出标签，导出为 JSON 文件': '设置 → 备份与恢复 → 导出标签，导出为 JSON 文件',
  '独立导入': '独立导入',
  '从 JSON 文件导入标签数据（合并到现有数据）': '从 JSON 文件导入标签数据（合并到现有数据）',
  '数据清理': '数据清理',
  '检测并清理已删除书签的孤立标签': '检测并清理已删除书签的孤立标签',
  
  // 设置帮助
  '⚙️ 设置': '⚙️ 设置',
  '配置 WebDAV 服务器地址和认证信息': '配置 WebDAV 服务器地址和认证信息',
  '支持自动定时备份': '支持自动定时备份',
  '支持启动时自动备份': '支持启动时自动备份',
  '备份数据包含书签和标签': '备份数据包含书签和标签',
  '合并模式': '合并模式',
  '将备份与现有书签合并，保留现有书签': '将备份与现有书签合并，保留现有书签',
  '覆盖模式': '覆盖模式',
  '删除所有现有书签，用备份替换（谨慎使用）': '删除所有现有书签，用备份替换（谨慎使用）',
  '独立导出或导入标签数据': '独立导出或导入标签数据',
  '检测并清理孤立标签': '检测并清理孤立标签',
  
  // 常用目录设置帮助
  '常用目录设置': '常用目录设置',
  '启用/禁用': '启用/禁用',
  '开启或关闭常用目录功能': '开启或关闭常用目录功能',
  '时间范围': '时间范围',
  '选择统计周期（3/7/10 天）': '选择统计周期（3/7/10 天）',
  '设置显示的常用链接数量（5-15 个）': '设置显示的常用链接数量（5-15 个）',
  '查看和管理已屏蔽的域名列表': '查看和管理已屏蔽的域名列表',
  '查看和管理已置顶的链接，置顶链接固定在常用文件夹顶部': '查看和管理已置顶的链接，置顶链接固定在常用文件夹顶部',
  
  // 布局设置帮助
  '书签按钮高度': '书签按钮高度',
  '调整侧边栏中书签项的高度 (24-48px)': '调整侧边栏中书签项的高度 (24-48px)',
  '调整树形目录中子文件夹的缩进 (5-20px)': '调整树形目录中子文件夹的缩进 (5-20px)',
  '调整书签相对于目录的缩进 (5-20px)': '调整书签相对于目录的缩进 (5-20px)',
  
  // 快捷键
  '⌨️ 快捷键': '⌨️ 快捷键',
  '快捷键': '快捷键',
  '全选当前文件夹下的所有书签': '全选当前文件夹下的所有书签',
  '删除选中的书签': '删除选中的书签',
  '批量选择范围内的书签': '批量选择范围内的书签',
  
  // 管理器页面
  '书签管理器': '书签管理器',
  '文件夹': '文件夹',
  '全部书签': '全部书签',
  '搜索书签（标题、网址、标签）': '搜索书签（标题、网址、标签）',
  '+ 新建文件夹': '+ 新建文件夹',
  '+ 添加书签': '+ 添加书签',
  '已选择': '已选择',
  '项': '项',
  '添加标签': '添加标签',
  '批量删除': '批量删除',
  '该文件夹为空': '该文件夹为空',
  '选择一个书签查看详情': '选择一个书签查看详情',
  
  // 添加书签弹窗
  '添加新书签': '添加新书签',
  '标题': '标题',
  '输入书签标题': '输入书签标题',
  '网址': '网址',
  'https://...': 'https://...',
  '输入标签，逗号分隔多个标签': '输入标签，逗号分隔多个标签',
  '从分组中选择标签': '从分组中选择标签',
  '已选择的标签': '已选择的标签',
  '将应用到': '将应用到',
  '个书签': '个书签',
  
  // 侧边栏
  '书签侧边栏': '书签侧边栏',
  '书签': '书签',
  '历史': '历史',
  '访问次': '访问次',
  '暂无书签': '暂无书签',
  '暂无历史记录': '暂无历史记录',
  '未找到结果': '未找到结果',
  '所有书签': '所有书签',
  '暂无置顶链接': '暂无置顶链接',
  '外观': '外观',
  '深色模式': '深色模式',
  '启用常用': '启用常用',
  '菜单': '菜单',
  '管理器': '管理器',
  '新建文件夹': '新建文件夹',
  '立即备份': '立即备份',
  '版本': '版本',
  '移入文件夹': '移入文件夹',
  '搜索书签（标题、网址、标签）': '搜索书签（标题、网址、标签）',
  
  // 标签相关
  '所有标签': '所有标签',
  '暂无标签': '暂无标签',
  '标签管理': '标签管理',
  '确定要删除这个标签吗？': '确定要删除这个标签吗？',
  '标签已删除': '标签已删除',
  '新建标签': '新建标签',
  '标签名称': '标签名称',
  '选择标签': '选择标签',
  '新建分组': '新建分组',
  '暂无分组，点击上方按钮创建': '暂无分组，点击上方按钮创建',
  '所有标签已分组': '所有标签已分组',
  '个标签': '个标签',
  '编辑': '编辑',
  '删除': '删除',
  '添加标签': '添加标签',
  '没有可选择的标签，所有标签已在此分组中': '没有可选择的标签，所有标签已在此分组中',
  '确定要删除分组「': '确定要删除分组「',
  '」吗？分组内的标签将变为未分组状态。': '」吗？分组内的标签将变为未分组状态。',
  '请输入新的分组名称：': '请输入新的分组名称：',
  '确定': '确定',
  '取消': '取消',
  '例如': '例如',
  
  // 表单相关
  '上级文件夹': '上级文件夹',
  '选择文件夹': '选择文件夹',
  '请输入标题': '请输入标题',
  '请输入网址': '请输入网址',
  '输入文件夹名称': '输入文件夹名称',
  '编辑书签 - ': '编辑书签 - ',
  
  // 文件夹详情
  '文件夹详情': '文件夹详情',
  '名称': '名称',
  '包含内容': '包含内容',
  '个文件夹': '个文件夹',
  '个书签': '个书签',
  '添加时间': '添加时间',
  '进入文件夹': '进入文件夹',
  
  // 书签详情
  '书签详情': '书签详情',
  '标题': '标题',
  '网址': '网址',
  '标签': '标签',
  '输入标签名后按回车添加': '输入标签名后按回车添加',
  '暂无标签': '暂无标签',
  '快速添加标签': '快速添加标签',
  '暂无标签，请先添加标签': '暂无标签，请先添加标签',
  '打开': '打开',
  
  // 批量添加标签
  '输入标签': '输入标签',
  '暂无标签，请先在书签详情中添加标签': '暂无标签，请先在书签详情中添加标签',
  
  // 删除确认
  '确定要删除选中的': '确定要删除选中的',
  '确定要删除吗？': '确定要删除吗？',
  
  // 右键菜单
  '置顶': '置顶',
  '添加到书签': '添加到书签',
  '屏蔽': '屏蔽',
  '取消置顶': '取消置顶',
  '添加至常用并置顶': '添加至常用并置顶',
  '修改': '修改',
  
  // 修改书签弹窗
  '修改书签': '修改书签',
  
  // 常用目录
  '例如': '例如',
  
  // 消息
  '保存成功': '保存成功',
  '删除成功': '删除成功',
  '添加成功': '添加成功',
  '更新成功': '更新成功',
  '操作失败': '操作失败',
  '加载中...': '加载中...',
  
  // 确认
  '确认删除': '确认删除',
  '此操作不可撤销，是否继续？': '此操作不可撤销，是否继续？',
  '覆盖确认': '覆盖确认',
  '将用备份数据覆盖当前数据，是否继续？': '将用备份数据覆盖当前数据，是否继续？',
  '确定要删除吗？': '确定要删除吗？',
  
  // 其他
  '设置 - 书签管理器': '设置 - 书签管理器',
};

const enText = {
  // Common
  'settings': 'Settings',
  '设置': 'Settings',
  'save': 'Save',
  'cancel': 'Cancel',
  'delete': 'Delete',
  'edit': 'Edit',
  'confirm': 'Confirm',
  'close': 'Close',
  'loading': 'Loading...',
  'success': 'Success',
  'error': 'Error',
  'warning': 'Warning',
  'backup': 'Backup',
  'restore': 'Restore',
  'export': 'Export',
  'import': 'Import',
  'enable': 'Enable',
  'disable': 'Disable',
  'enabled': 'Enabled',
  'disabled': 'Disabled',
  'yes': 'Yes',
  'no': 'No',
  'ok': 'OK',
  'back': 'Back',
  'refresh': 'Refresh',
  'search': 'Search',
  'all': 'All',
  'none': 'None',
  'more': 'More',
  'less': 'Less',
  'default': 'Default',
  'custom': 'Custom',
  
  // Settings - Sidebar Menu
  'WebDAV 同步': 'WebDAV Sync',
  '备份与恢复': 'Backup & Restore',
  '标签总览': 'Tags Overview',
  '布局': 'Layout',
  '常用目录': 'Frequently Used',
  '语言': 'Language',
  '操作说明': 'Help',
  '返回管理器': 'Back to Manager',
  
  // Settings - WebDAV
  'WebDAV 同步设置': 'WebDAV Sync Settings',
  '启用 WebDAV 同步': 'Enable WebDAV Sync',
  '服务器地址': 'Server URL',
  '用户名': 'Username',
  '密码': 'Password',
  '测试连接': 'Test Connection',
  '保存设置': 'Save Settings',
  '连接成功': 'Connection successful',
  '连接失败': 'Connection failed',
  '设置已保存': 'Settings saved',
  '开启后可以将书签备份到 WebDAV 服务器': 'Enable to backup bookmarks to WebDAV server',
  'WebDAV 服务器地址，例如：https://example.com/dav': 'WebDAV server URL, e.g.: https://example.com/dav',
  
  // Settings - Backup
  '自动备份': 'Auto Backup',
  '启用自动备份': 'Enable Auto Backup',
  '备份间隔': 'Backup Interval',
  '备份间隔（分钟）': 'Backup Interval (minutes)',
  '每 15 分钟': 'Every 15 minutes',
  '每 30 分钟': 'Every 30 minutes',
  '每 1 小时': 'Every 1 hour',
  '每 3 小时': 'Every 3 hours',
  '每 6 小时': 'Every 6 hours',
  '每 12 小时': 'Every 12 hours',
  '每天': 'Every day',
  '启动时备份': 'Backup on Startup',
  '每次打开浏览器时自动备份书签': 'Auto backup bookmarks when opening browser',
  '手动操作': 'Manual Operations',
  '书签备份': 'Bookmark Backup',
  '备份书签': 'Backup Bookmarks',
  '将当前书签备份到 WebDAV 服务器': 'Backup current bookmarks to WebDAV server',
  '书签恢复': 'Bookmark Restore',
  '恢复书签': 'Restore Bookmarks',
  '从 WebDAV 服务器恢复书签备份': 'Restore bookmarks from WebDAV server',
  '恢复备份': 'Restore Backup',
  '恢复模式': 'Restore Mode',
  '合并': 'Merge',
  '覆盖': 'Replace',
  '备份成功': 'Backup successful',
  '备份失败': 'Backup failed',
  '恢复成功': 'Restore successful',
  '恢复失败': 'Restore failed',
  '布局备份': 'Layout Backup',
  '备份布局': 'Backup Layout',
  '将布局设置备份到 WebDAV 服务器': 'Backup layout settings to WebDAV server',
  '布局恢复': 'Layout Restore',
  '恢复布局': 'Restore Layout',
  '从 WebDAV 服务器恢复布局设置': 'Restore layout settings from WebDAV server',
  '统一导出/导入': 'Export/Import All',
  '导出或导入书签、布局、标签配置': 'Export or import bookmarks, layout, and tag settings',
  '导出配置': 'Export Config',
  '导入配置': 'Import Config',
  '从 JSON 文件导入配置（自动识别内容类型）': 'Import from JSON file (auto-detect)',
  '选择文件': 'Select File',
  '选择导出内容': 'Select Export Content',
  '书签': 'Bookmarks',
  '布局设置': 'Layout',
  '标签': 'Tags',
  
  // Tag Data Cleanup
  '标签数据清理': 'Tag Data Cleanup',
  '检测并清理已删除书签的孤立标签数据': 'Detect and clean orphan tag data',
  '检测孤立标签': 'Detect Orphan Tags',
  '检查标签数据中是否存在对应书签已被删除的孤立标签': 'Check for orphan tags',
  '开始检测': 'Start Detection',
  '清理无效标签': 'Clean Invalid Tags',
  '删除所有孤立标签数据，释放存储空间': 'Delete all orphan tags',
  
  // Duplicate Detection
  '书签查重': 'Duplicate Detection',
  '检测并删除重复的书签（相同URL的书签）': 'Detect and delete duplicate bookmarks',
  '扫描所有书签，查找相同URL的重复书签': 'Scan for duplicates',
  '检测结果': 'Detection Results',
  '删除选中': 'Delete Selected',
  '全选': 'Select All',
  
  // Tag Groups
  '标签分组': 'Tag Groups',
  '创建分组来组织管理标签，方便快速添加标签': 'Create groups to organize tags',
  '新建分组': 'New Group',
  '未分组标签': 'Ungrouped Tags',
  '以下标签尚未归类到任何分组，点击可查看详情': 'Ungrouped tags below',
  '标签分组管理': 'Tag Group Management',
  
  // Select Tags Modal
  '选择标签添加到分组': 'Select tags to add to group',
  '从其他分组或未分组中选择标签': 'Select from other groups or ungrouped',
  '已选择': 'Selected',
  '个标签': 'tags',
  '确定': 'Confirm',
  
  // Settings - Layout
  '侧边栏外观': 'Sidebar Appearance',
  '书签按钮高度': 'Bookmark Height',
  '调整侧边栏中书签和文件夹按钮的高度': 'Adjust height of bookmark and folder buttons',
  '目录缩进宽度': 'Tree Indent',
  '调整树形目录中子文件夹的缩进宽度': 'Adjust indent of subfolders in tree',
  '书签缩进宽度': 'Bookmark Indent',
  '调整书签相对于目录的缩进宽度': 'Adjust indent of bookmarks relative to folders',
  '预览': 'Preview',
  '恢复默认': 'Reset to Default',
  '文件夹示例': 'Sample Folder',
  '书签示例': 'Sample Bookmark',
  '布局已保存': 'Layout saved',
  
  // Settings - Frequently Used
  '常用目录设置': 'Frequently Used Settings',
  '启用常用目录': 'Enable Frequently Used',
  '在侧边栏顶部显示常用文件夹，展示最近访问最频繁的链接': 'Show frequently used folder at top of sidebar',
  '统计时间范围': 'Time Range',
  '统计最近多少天内的浏览记录': 'Statistics for recent browsing history',
  '最近 3 天': 'Last 3 days',
  '最近 7 天': 'Last 7 days',
  '最近 10 天': 'Last 10 days',
  '显示数量': 'Display Count',
  '在常用文件夹中显示多少个链接（5-15 个）': 'Number of links to show (5-15)',
  '个': '',
  
  // Blacklist Management
  '📋 黑名单管理': '📋 Blacklist Management',
  '黑名单管理': 'Blacklist Management',
  '被屏蔽的域名永远不会出现在常用列表中。在侧边栏常用文件夹中右键点击链接可选择屏蔽。': 'Blocked domains will never appear in frequently used list.',
  '已屏蔽的域名列表': 'Blocked Domains',
  '暂无屏蔽的域名': 'No blocked domains',
  '手动添加屏蔽域名': 'Add Domain to Block',
  '添加': 'Add',
  '输入域名（不需要协议和前缀），点击添加按钮': 'Enter domain (no protocol), click add',
  
  // Pinned Management
  '📌 置顶管理': '📌 Pinned Management',
  '置顶管理': 'Pinned Management',
  '置顶的链接会固定在常用文件夹顶部，不受热度值刷新影响。在侧边栏常用文件夹中右键点击链接可选择置顶。': 'Pinned links stay at top of frequently used folder.',
  '已置顶的链接': 'Pinned Links',
  '暂无置顶的链接': 'No pinned links',
  '清空所有置顶': 'Clear All Pinned',
  '置顶链接': 'Pinned',
  '常用': 'Frequently Used',
  
  // Settings - Language
  '语言设置': 'Language Settings',
  '选择语言': 'Select Language',
  '选择界面显示语言': 'Choose interface display language',
  '简体中文': 'Chinese (Simplified)',
  
  // Settings - Help
  '操作说明': 'Help',
  '使用帮助': 'User Guide',
  '🚀 快速开始': '🚀 Quick Start',
  '快速开始': 'Quick Start',
  '侧边栏': 'Sidebar',
  '打开侧边栏': 'Open Sidebar',
  '点击浏览器工具栏中的扩展图标': 'Click extension icon in browser toolbar',
  '打开书签': 'Open Bookmark',
  '点击书签项即可在新标签页中打开': 'Click bookmark to open in new tab',
  '展开/折叠文件夹': 'Expand/Collapse Folder',
  '点击文件夹或左侧的展开箭头': 'Click folder or expand arrow',
  '搜索书签': 'Search Bookmarks',
  '在搜索框中输入关键词进行搜索': 'Enter keywords in search box',
  '切换主题': 'Switch Theme',
  '点击菜单按钮 → 深色模式开关': 'Click menu button → Dark mode toggle',
  '右键菜单': 'Right-click Menu',
  '书签和文件夹支持右键删除、编辑操作': 'Right-click to delete or edit',
  '拖拽排序': 'Drag to Sort',
  '可拖拽书签调整顺序': 'Drag bookmarks to reorder',
  '拖拽移动': 'Drag to Move',
  '可拖拽书签到文件夹中移动位置': 'Drag bookmarks to folders',
  
  // Frequently Used Help
  '常用目录': 'Frequently Used',
  '启用常用目录': 'Enable Frequently Used',
  '点击菜单按钮 → 启用常用开关': 'Click menu button → Enable toggle',
  '动态统计': 'Dynamic Statistics',
  '自动统计最近访问最频繁的链接': 'Auto track most visited links',
  '快速添加书签': 'Quick Add Bookmark',
  '右键点击常用链接可快速添加到书签': 'Right-click to add to bookmarks',
  '黑名单功能': 'Blacklist',
  '右键屏蔽特定域名，不再出现在常用列表中': 'Right-click to block domains',
  '自动刷新': 'Auto Refresh',
  '打开侧边栏时自动更新，每 5 分钟自动刷新': 'Auto update on open, refresh every 5 min',
  
  // Manager Help
  '📚 管理器': '📚 Manager',
  '管理器': 'Manager',
  '导航': 'Navigation',
  '浏览文件夹': 'Browse Folders',
  '点击左侧文件夹树中的文件夹': 'Click folder in tree',
  '折叠文件夹': 'Collapse Folder',
  '点击文件夹前的 ▶ 箭头图标': 'Click ▶ arrow before folder',
  '面包屑导航': 'Breadcrumb Navigation',
  '点击顶部路径可快速跳转': 'Click path to navigate',
  
  // Bookmark Operations
  '书签操作': 'Bookmark Operations',
  '添加书签': 'Add Bookmark',
  '点击「+ 添加书签」按钮': 'Click "+ Add Bookmark" button',
  '新建文件夹': 'New Folder',
  '点击「+ 新建文件夹」按钮，可选择存放位置': 'Click "+ New Folder" button',
  '双击书签项可在新标签页中打开链接': 'Double-click to open in new tab',
  '选择书签': 'Select Bookmark',
  '单击书签项（不需要点击复选框）': 'Single click to select',
  '批量选择': 'Batch Select',
  '按住 Shift 键点击可选择范围内的所有书签': 'Hold Shift and click to select range',
  '全选': 'Select All',
  '取消选择': 'Deselect',
  '按 Esc 键': 'Press Esc key',
  '删除书签': 'Delete Bookmark',
  '点击书签右侧的删除按钮，或选中后按 Delete 键': 'Click delete button or press Delete key',
  '编辑书签': 'Edit Bookmark',
  '点击书签右侧的编辑按钮，可修改名称、URL 和移动文件夹': 'Click edit button to modify',
  
  // Drag Operations
  '拖拽操作': 'Drag Operations',
  '排序书签': 'Sort Bookmarks',
  '拖拽书签行可调整顺序': 'Drag bookmark row to reorder',
  '移动到文件夹': 'Move to Folder',
  '将书签拖拽到左侧文件夹树上': 'Drag bookmark to folder tree',
  
  // View Switching
  '视图切换': 'View Switching',
  '列表视图': 'List View',
  '显示详细信息，适合管理': 'Detailed view for management',
  '网格视图': 'Grid View',
  '卡片式布局，适合浏览': 'Card layout for browsing',
  
  // Tag Management Help
  '🏷️ 标签管理': '🏷️ Tag Management',
  '标签管理': 'Tag Management',
  '书签标签': 'Bookmark Tags',
  '在书签详情面板输入标签名后按回车': 'Enter tag name and press Enter',
  '批量添加标签': 'Batch Add Tags',
  '选中多个书签后点击「添加标签」按钮': 'Select bookmarks and click "Add Tag"',
  '删除标签': 'Delete Tag',
  '点击标签上的 × 按钮即可删除': 'Click × button on tag',
  '标签显示': 'Tag Display',
  '书签列表和详情页都会显示标签': 'Tags shown in list and details',
  '标签搜索': 'Tag Search',
  '在搜索框输入 #标签名 可搜索包含该标签的所有书签': 'Search #tagname to find bookmarks',
  
  // Tags Overview
  '查看所有标签': 'View All Tags',
  '设置 → 标签总览，显示所有标签及书签数量': 'Settings → Tags Overview',
  '查看标签详情': 'View Tag Details',
  '点击标签卡片可查看该标签下的所有书签': 'Click tag card to view bookmarks',
  '点击书签列表中的书签可在新窗口打开': 'Click bookmark to open in new window',
  
  // Tag Backup
  '标签备份': 'Tag Backup',
  'WebDAV 备份': 'WebDAV Backup',
  '使用 WebDAV 备份时自动包含标签数据': 'Tags included in WebDAV backup',
  '独立导出': 'Independent Export',
  '设置 → 备份与恢复 → 导出标签，导出为 JSON 文件': 'Settings → Backup → Export Tags as JSON',
  '独立导入': 'Independent Import',
  '从 JSON 文件导入标签数据（合并到现有数据）': 'Import tags from JSON (merge)',
  '数据清理': 'Data Cleanup',
  '检测并清理已删除书签的孤立标签': 'Detect and clean orphan tags',
  
  // Settings Help
  '⚙️ 设置': '⚙️ Settings',
  '配置 WebDAV 服务器地址和认证信息': 'Configure WebDAV server and credentials',
  '支持自动定时备份': 'Support scheduled backup',
  '支持启动时自动备份': 'Support backup on startup',
  '备份数据包含书签和标签': 'Backup includes bookmarks and tags',
  '合并模式': 'Merge Mode',
  '将备份与现有书签合并，保留现有书签': 'Merge with existing bookmarks',
  '覆盖模式': 'Replace Mode',
  '删除所有现有书签，用备份替换（谨慎使用）': 'Replace all bookmarks (use with caution)',
  '独立导出或导入标签数据': 'Export or import tags separately',
  '检测并清理孤立标签': 'Detect and clean orphan tags',
  
  // Frequently Used Settings Help
  '常用目录设置': 'Frequently Used Settings',
  '启用/禁用': 'Enable/Disable',
  '开启或关闭常用目录功能': 'Turn on/off frequently used feature',
  '时间范围': 'Time Range',
  '选择统计周期（3/7/10 天）': 'Select statistics period (3/7/10 days)',
  '设置显示的常用链接数量（5-15 个）': 'Set number of links to show (5-15)',
  '查看和管理已屏蔽的域名列表': 'View and manage blocked domains',
  '查看和管理已置顶的链接，置顶链接固定在常用文件夹顶部': 'View and manage pinned links',
  
  // Layout Settings Help
  '书签按钮高度': 'Bookmark Height',
  '调整侧边栏中书签项的高度 (24-48px)': 'Adjust bookmark height (24-48px)',
  '调整树形目录中子文件夹的缩进 (5-20px)': 'Adjust tree indent (5-20px)',
  '调整书签相对于目录的缩进 (5-20px)': 'Adjust bookmark indent (5-20px)',
  
  // Keyboard Shortcuts
  '⌨️ 快捷键': '⌨️ Keyboard Shortcuts',
  '快捷键': 'Keyboard Shortcuts',
  '全选当前文件夹下的所有书签': 'Select all bookmarks in current folder',
  '删除选中的书签': 'Delete selected bookmarks',
  '批量选择范围内的书签': 'Batch select bookmarks in range',
  
  // Manager Page
  '书签管理器': 'Bookmark Manager',
  '文件夹': 'Folders',
  '全部书签': 'All Bookmarks',
  '搜索书签（标题、网址、标签）': 'Search by title, URL, or tag',
  '+ 新建文件夹': '+ New Folder',
  '+ 添加书签': '+ Add Bookmark',
  '已选择': 'Selected',
  '项': 'items',
  '添加标签': 'Add Tag',
  '批量删除': 'Batch Delete',
  '该文件夹为空': 'This folder is empty',
  '选择一个书签查看详情': 'Select a bookmark to view details',
  
  // Add Bookmark Modal
  '添加新书签': 'Add New Bookmark',
  '标题': 'Title',
  '输入书签标题': 'Enter bookmark title',
  '网址': 'URL',
  'https://...': 'https://...',
  '输入标签，逗号分隔多个标签': 'Enter tags, comma separated',
  '从分组中选择标签': 'Select tags from groups',
  '已选择的标签': 'Selected Tags',
  '将应用到': 'Will apply to',
  '个书签': 'bookmarks',
  
  // Sidebar
  '书签侧边栏': 'Bookmark Sidebar',
  '书签': 'Bookmarks',
  '历史': 'History',
  '访问次': 'visits',
  '暂无书签': 'No bookmarks',
  '暂无历史记录': 'No history',
  '未找到结果': 'No results found',
  '所有书签': 'All Bookmarks',
  '暂无置顶链接': 'No pinned links',
  '外观': 'Appearance',
  '深色模式': 'Dark Mode',
  '启用常用': 'Enable Frequently Used',
  '菜单': 'Menu',
  '管理器': 'Manager',
  '新建文件夹': 'New Folder',
  '立即备份': 'Backup Now',
  '版本': 'Version',
  '移入文件夹': 'Move to Folder',
  '搜索书签（标题、网址、标签）': 'Search bookmarks (title, URL, tag)',
  
  // Tags
  '所有标签': 'All Tags',
  '暂无标签': 'No tags',
  '标签管理': 'Tag Manager',
  '确定要删除这个标签吗？': 'Are you sure you want to delete this tag?',
  '标签已删除': 'Tag deleted',
  '新建标签': 'New Tag',
  '标签名称': 'Tag Name',
  '选择标签': 'Select Tag',
  '新建分组': 'New Group',
  '暂无分组，点击上方按钮创建': 'No groups, click button above to create',
  '所有标签已分组': 'All tags are grouped',
  '个标签': 'tags',
  '编辑': 'Edit',
  '删除': 'Delete',
  '添加标签': 'Add Tag',
  '没有可选择的标签，所有标签已在此分组中': 'No tags to select, all tags are in this group',
  '确定要删除分组「': 'Are you sure you want to delete group "',
  '」吗？分组内的标签将变为未分组状态。': '"? Tags in this group will become ungrouped.',
  '请输入新的分组名称：': 'Enter new group name:',
  '确定': 'Confirm',
  '取消': 'Cancel',
  
  // Form
  '上级文件夹': 'Parent Folder',
  '选择文件夹': 'Select Folder',
  '请输入标题': 'Enter title',
  '请输入网址': 'Enter URL',
  '输入文件夹名称': 'Enter folder name',
  '编辑书签 - ': 'Edit Bookmark - ',
  
  // Folder Details
  '文件夹详情': 'Folder Details',
  '名称': 'Name',
  '包含内容': 'Contains',
  '个文件夹': 'folders',
  '个书签': 'bookmarks',
  '添加时间': 'Added',
  '进入文件夹': 'Enter Folder',
  
  // Bookmark Details
  '书签详情': 'Bookmark Details',
  '标题': 'Title',
  '网址': 'URL',
  '标签': 'Tags',
  '输入标签名后按回车添加': 'Enter tag name and press Enter',
  '暂无标签': 'No tags',
  '快速添加标签': 'Quick Add Tag',
  '暂无标签，请先添加标签': 'No tags, please add tags first',
  '打开': 'Open',
  
  // Batch Add Tags
  '输入标签': 'Enter Tag',
  '暂无标签，请先在书签详情中添加标签': 'No tags, please add tags in bookmark details first',
  
  // Delete Confirm
  '确定要删除选中的': 'Are you sure you want to delete selected',
  '确定要删除吗？': 'Are you sure you want to delete?',
  
  // Context Menu
  '置顶': 'Pin',
  '添加到书签': 'Add to Bookmarks',
  '屏蔽': 'Block',
  '取消置顶': 'Unpin',
  '添加至常用并置顶': 'Add to Frequently Used & Pin',
  '修改': 'Edit',
  
  // Edit Bookmark Modal
  '修改书签': 'Edit Bookmark',
  '名称': 'Name',
  '文件夹': 'Folder',
  '保存': 'Save',
  
  // Messages
  '保存成功': 'Saved successfully',
  '删除成功': 'Deleted successfully',
  '添加成功': 'Added successfully',
  '更新成功': 'Updated successfully',
  '操作失败': 'Operation failed',
  '加载中...': 'Loading...',
  
  // Confirm
  '确认删除': 'Confirm Delete',
  '此操作不可撤销，是否继续？': 'This action cannot be undone. Continue?',
  '覆盖确认': 'Confirm Overwrite',
  '将用备份数据覆盖当前数据，是否继续？': 'This will replace current data. Continue?',
  '确定要删除吗？': 'Are you sure you want to delete?',
  
  // Other
  '设置 - 书签管理器': 'Settings - Bookmark Manager',
};

translations['zh-CN'] = zhText;
translations['en'] = enText;

class I18n {
  static currentLang = 'zh-CN';
  static observer = null;
  
  static async init() {
    const result = await Storage.get(['language']);
    this.currentLang = result.language || 'zh-CN';
    this.translatePage();
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
  
  static t(key) {
    return translations[this.currentLang][key] || translations['zh-CN'][key] || key;
  }
  
  static translatePage() {
    console.log('translatePage called, lang:', this.currentLang);
    if (this.currentLang === 'zh-CN') return;
    
    const textMap = translations[this.currentLang];
    
    // 先翻译文本节点
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const nodesToReplace = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      if (text && textMap[text]) {
        nodesToReplace.push({ node, text: textMap[text] });
      }
    }
    
    nodesToReplace.forEach(({ node, text }) => {
      node.textContent = text;
    });
    
    // 翻译 placeholder 属性
    document.querySelectorAll('[placeholder]').forEach(el => {
      const placeholder = el.getAttribute('placeholder');
      if (placeholder && textMap[placeholder]) {
        el.setAttribute('placeholder', textMap[placeholder]);
      }
    });
    
    // 翻译 title 属性
    document.querySelectorAll('[title]').forEach(el => {
      const title = el.getAttribute('title');
      if (title && textMap[title]) {
        el.setAttribute('title', textMap[title]);
      }
    });
    
    // 设置 MutationObserver 来翻译动态添加的内容
    if (!this.observer) {
      this.observer = new MutationObserver(() => {
        this.translatePage();
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
  }
  
  static getAvailableLanguages() {
    return [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en', name: 'English' }
    ];
  }
}
