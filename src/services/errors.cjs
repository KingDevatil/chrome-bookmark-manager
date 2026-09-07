function errorMessage(error) {
  const message = typeof error === 'string' ? error : error?.message || '';
  if (error?.name === 'SyntaxError') return '文件不是有效的 JSON 备份，请重新导出或选择正确的文件';
  if (/quota|QUOTA_BYTES/i.test(message)) return '本地存储空间不足，请释放空间后重试；不要删除尚未处理的恢复快照';
  if (/Extension context invalidated|Receiving end does not exist|message port closed/i.test(message)) return '扩展已重载或后台连接中断，请刷新页面后重试；恢复操作请先查看恢复快照状态';
  if (/^(Invalid|Unsupported|Backup exceeds|No writable bookmark roots)/.test(message)) {
    if (/version/i.test(message)) return '备份版本不受支持，请更新扩展或从原设备重新导出';
    if (/20 MB/.test(message)) return '备份不能超过 20 MB，请拆分后导入';
    if (/writable/.test(message)) return '浏览器没有可写书签目录，请检查浏览器策略或权限';
    return '备份或配置内容不合法，请检查文件是否完整、网址及字段格式是否正确（' + message + '）';
  }
  return message || '操作失败，未收到有效错误信息，请刷新页面并检查扩展后台状态';
}
module.exports = { errorMessage };
