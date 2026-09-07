const { XMLParser, XMLValidator } = require('fast-xml-parser');
const array = x => x === undefined ? [] : Array.isArray(x) ? x : [x];
function parseBackups(xml) {
  if (xml.length > 5 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error('Invalid DAV XML');
  const parsed = new XMLParser({ ignoreAttributes: false, parseTagValue: false, trimValues: true }).parse(xml);
  function children(node, local, namespaces = {}) {
    if (!node || typeof node !== 'object') return [];
    const ns = { ...namespaces };
    for (const [key, value] of Object.entries(node)) if (key === '@_xmlns') ns[''] = value; else if (key.startsWith('@_xmlns:')) ns[key.slice(8)] = value;
    return Object.entries(node).filter(([key]) => !key.startsWith('@_') && key.split(':').at(-1) === local).flatMap(([key, values]) => array(values).filter(value => {
      const prefix = key.includes(':') ? key.split(':')[0] : '';
      return (value?.[`@_xmlns${prefix ? ':' + prefix : ''}`] || ns[prefix]) === 'DAV:';
    }).map(value => ({ value, ns })));
  }
  const output = [];
  for (const multi of children(parsed, 'multistatus')) for (const response of children(multi.value, 'response', multi.ns)) {
    const href = children(response.value, 'href', response.ns)[0]?.value;
    if (typeof href !== 'string') continue;
    for (const propstat of children(response.value, 'propstat', response.ns)) {
      const status = children(propstat.value, 'status', propstat.ns)[0]?.value;
      if (!/\s200\s/.test(status || '')) continue;
      const prop = children(propstat.value, 'prop', propstat.ns)[0];
      if (!prop) continue;
      const field = name => children(prop.value, name, prop.ns)[0]?.value;
      let filename;
      try { filename = decodeURIComponent(new URL(href, 'https://dav.invalid/').pathname.split('/').pop()); } catch { continue; }
      if (!/^bookmarks_backup_[^/\\]+\.json$/.test(filename) || /[\x00-\x1f]/.test(filename)) continue;
      output.push({ filename, href, lastModified: field('getlastmodified') || '', size: Number(field('getcontentlength')) || 0 });
    }
  }
  return [...new Map(output.map(x => [x.filename, x])).values()].sort((a, b) => (Date.parse(b.lastModified) || 0) - (Date.parse(a.lastModified) || 0));
}
class WebDAVClient {
  // Native worker fetch requires its global receiver when stored as a method.
  constructor(config, fetcher = globalThis.fetch.bind(globalThis)) { this.config = config; this.fetcher = fetcher; this.controllers = new Set(); }
  cancel() { for (const c of this.controllers) c.abort(); }
  async request(method, filename = '', data) {
    if (typeof filename !== 'string' || /[/\\\x00-\x1f]/.test(filename) || filename === '..' || filename === '.') throw new Error('Invalid backup filename');
    let base;
    try { const address = this.config?.url?.trim(); base = new URL(address.endsWith('/') ? address : address + '/'); }
    catch { throw new Error('WebDAV 地址无效，请填写完整的 http:// 或 https:// 地址'); }
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('WebDAV 地址必须使用 HTTP(S)，且不能包含账号、查询参数或锚点；账号请填写在单独的输入框');
    const url = new URL('bookmarks/' + encodeURIComponent(filename), base);
    const headers = { Depth: '1' };
    if (this.config.username || this.config.password) {
      const bytes = new TextEncoder().encode(`${this.config.username || ''}:${this.config.password || ''}`);
      headers.Authorization = 'Basic ' + btoa(Array.from(bytes, x => String.fromCharCode(x)).join(''));
    }
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    const controller = new AbortController(); this.controllers.add(controller);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 30000);
    try {
      const response = await this.fetcher(url.href, { method, headers, body: data === undefined ? undefined : JSON.stringify(data), signal: controller.signal, redirect: 'error', credentials: 'omit' });
      if (!response.ok) {
        const reasons = { 401: '认证失败，请检查用户名和密码', 403: '权限不足，请检查目录读写权限', 404: '目录或备份文件不存在，请检查路径或选择其他备份', 405: '服务器不支持此 WebDAV 操作，请检查服务地址', 409: '父目录不存在，请先在服务器创建配置的目录', 413: '备份超过服务器大小限制', 429: '请求过于频繁，请稍后重试', 507: '服务器存储空间不足' };
        const error = new Error(`WebDAV HTTP ${response.status}：${reasons[response.status] || '服务器请求失败，请检查服务状态后重试'}`); error.status = response.status; throw error;
      }
      // The timeout covers body consumption, not just response headers.
      const limit = method === 'PROPFIND' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
      if (Number(response.headers.get('content-length')) > limit) throw new Error('WebDAV response too large');
      const reader = response.body?.getReader();
      if (!reader) return '';
      let bytes = 0, text = ''; const decoder = new TextDecoder();
      try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.length; if (bytes > limit) throw new Error('WebDAV response too large'); text += decoder.decode(value, { stream: true }); } return text + decoder.decode(); }
      finally { await reader.cancel().catch(() => {}); }
    } catch (error) {
      if (controller.signal.aborted) throw new Error(timedOut ? 'WebDAV 请求超时（30 秒），请检查网络和服务器后重试' : 'WebDAV 请求已取消，配置可能已改变，请重新操作');
      if (error instanceof TypeError) throw new Error('无法连接 WebDAV，请检查网络、证书、服务地址及重定向设置');
      if (error.message === 'WebDAV response too large') throw new Error('WebDAV 响应超过大小限制（目录 5 MB，备份 20 MB），请减少文件数量或拆分备份');
      throw error;
    } finally { clearTimeout(timer); this.controllers.delete(controller); }
  }
  async ensureBookmarksFolder() { try { await this.request('PROPFIND'); } catch (e) { if (e.status !== 404) throw e; await this.request('MKCOL'); } }
  async uploadBookmarks(data) { await this.ensureBookmarksFolder(); const filename = `bookmarks_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`; await this.request('PUT', filename, data); await this.request('PUT', 'bookmarks.json', data); return filename; }
  async downloadBookmarks(filename = 'bookmarks.json') {
    const text = await this.request('GET', filename);
    try { return JSON.parse(text); } catch { throw new Error('云端文件不是有效的 JSON 备份，可能为空、已损坏或返回了登录页面，请检查文件和 WebDAV 地址'); }
  }
  async listBackups() { return parseBackups(await this.request('PROPFIND')); }
  async deleteBackup(filename) { if (!/^bookmarks_backup_[^/\\]+\.json$/.test(filename)) throw new Error('Not a backup file'); await this.request('DELETE', filename); return { success: true }; }
  async cleanupOldBackups(keep = 3) {
    const files = (await this.listBackups()).filter(f => Number.isFinite(Date.parse(f.lastModified)));
    let cleaned = 0;
    for (const file of files.slice(keep)) { await this.deleteBackup(file.filename); cleaned++; }
    return { cleaned };
  }
}
module.exports = { WebDAVClient, parseBackups };
