const {test}=require('node:test');const assert=require('node:assert/strict');
const {parseBackups,WebDAVClient}=require('../src/services/webdav.cjs');
function xml(prefix){const p=prefix?prefix+':':'';return `<${p}multistatus xmlns${prefix?':'+prefix:''}="DAV:"><${p}response><${p}href>/bookmarks/bookmarks_backup_a.json</${p}href><${p}propstat><${p}prop><${p}getlastmodified>Sat, 05 Sep 2026 00:00:00 GMT</${p}getlastmodified></${p}prop><${p}status>HTTP/1.1 200 OK</${p}status></${p}propstat></${p}response></${p}multistatus>`}
for(const prefix of ['D','x',''])test('DAV namespace '+prefix,()=>assert.equal(parseBackups(xml(prefix))[0].filename,'bookmarks_backup_a.json'));
test('wrong namespace ignored',()=>assert.equal(parseBackups(xml('x').replace('DAV:','other:')).length,0));
test('XML entities rejected',()=>assert.throws(()=>parseBackups('<!DOCTYPE a><a/>')));
test('failed propstat ignored',()=>assert.equal(parseBackups(xml('D').replace('200 OK','404 Not Found')).length,0));
test('path traversal rejected without network',async()=>{const c=new WebDAVClient({url:'https://dav.test'},()=>{throw Error('network called')});await assert.rejects(c.request('GET','../secret'),/filename/)});
test('UTF8 credentials and successful body',async()=>{let headers;const c=new WebDAVClient({url:'https://dav.test',username:'用户',password:'密码'},async(url,opts)=>{headers=opts.headers;return new Response('{}')});assert.equal(await c.request('GET','a.json'),'{}');assert.match(headers.Authorization,/^Basic /)});
