const {test}=require('node:test');const assert=require('node:assert/strict');
const {parseBackups,WebDAVClient}=require('../src/services/webdav.cjs');
function xml(prefix){const p=prefix?prefix+':':'';return `<${p}multistatus xmlns${prefix?':'+prefix:''}="DAV:"><${p}response><${p}href>/bookmarks/bookmarks_backup_a.json</${p}href><${p}propstat><${p}prop><${p}getlastmodified>Sat, 05 Sep 2026 00:00:00 GMT</${p}getlastmodified></${p}prop><${p}status>HTTP/1.1 200 OK</${p}status></${p}propstat></${p}response></${p}multistatus>`}
for(const prefix of ['D','x',''])test('DAV namespace '+prefix,()=>assert.equal(parseBackups(xml(prefix))[0].filename,'bookmarks_backup_a.json'));
test('wrong namespace ignored',()=>assert.equal(parseBackups(xml('x').replace('DAV:','other:')).length,0));
test('XML entities rejected',()=>assert.throws(()=>parseBackups('<!DOCTYPE a><a/>')));
test('failed propstat ignored',()=>assert.equal(parseBackups(xml('D').replace('200 OK','404 Not Found')).length,0));
test('path traversal rejected without network',async()=>{const c=new WebDAVClient({url:'https://dav.test'},()=>{throw Error('network called')});await assert.rejects(c.request('GET','../secret'),/filename/)});
test('UTF8 credentials and successful body',async()=>{let headers;const c=new WebDAVClient({url:'https://dav.test',username:'用户',password:'密码'},async(url,opts)=>{headers=opts.headers;return new Response('{}')});assert.equal(await c.request('GET','a.json'),'{}');assert.match(headers.Authorization,/^Basic /)});
for (const [status, hint] of [[401,'认证'],[403,'权限'],[404,'不存在'],[409,'父目录'],[429,'频繁'],[507,'空间']]) test('DAV actionable HTTP '+status,async()=>{
 const c=new WebDAVClient({url:'https://dav.test'},async()=>new Response('',{status}));
 await assert.rejects(c.request('GET'),e=>e.status===status&&e.message.includes(hint));assert.equal(c.controllers.size,0);
});
test('DAV network, invalid address and invalid JSON have actionable errors',async()=>{
 const c=new WebDAVClient({url:'https://dav.test'},async()=>{throw new TypeError('Failed to fetch')});
 await assert.rejects(c.request('GET'),/网络.*证书/);
 await assert.rejects(new WebDAVClient({url:'broken'},()=>assert.fail()).request('GET'),/地址无效/);
 await assert.rejects(new WebDAVClient({url:'https://dav.test'},async()=>new Response('<html>login</html>')).downloadBookmarks(),/登录页面/);
});
test('DAV cancellation releases controllers and gives retry instruction',async()=>{
 const c=new WebDAVClient({url:'https://dav.test'},async(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))));
 const pending=c.request('GET');c.cancel();await assert.rejects(pending,/已取消.*重新操作/);assert.equal(c.controllers.size,0);
});
test('DAV oversized response is rejected before import',async()=>{
 const c=new WebDAVClient({url:'https://dav.test'},async()=>new Response('{}',{headers:{'content-length':String(21*1024*1024)}}));
 await assert.rejects(c.downloadBookmarks(),/大小限制/);
});
test('DAV missing collection creates folder but forbidden collection does not',async()=>{
 const methods=[];const c=new WebDAVClient({url:'https://dav.test'},async(_url,{method})=>{methods.push(method);return new Response('',{status:method==='PROPFIND'?404:201})});
 await c.ensureBookmarksFolder();assert.deepEqual(methods,['PROPFIND','MKCOL']);
 methods.length=0;c.fetcher=async(_url,{method})=>{methods.push(method);return new Response('',{status:403})};
 await assert.rejects(c.ensureBookmarksFolder(),/权限/);assert.deepEqual(methods,['PROPFIND']);
});

test('default fetch retains the global receiver required by service workers',async()=>{
 const original=globalThis.fetch;const methods=[];
 globalThis.fetch=async function(url,options){
  assert.equal(this,globalThis,'fetch must be called with the global receiver');
  methods.push(options.method);return new Response('{}');
 };
 try{
  const client=new WebDAVClient({url:'https://dav.test/dav/'});
  await client.ensureBookmarksFolder();await client.uploadBookmarks({schemaVersion:2});
  assert.deepEqual(await client.downloadBookmarks(),{});
  assert.deepEqual(methods,['PROPFIND','PROPFIND','PUT','PUT','GET']);
 }finally{globalThis.fetch=original}
});
