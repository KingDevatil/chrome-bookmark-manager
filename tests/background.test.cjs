const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');
const {buildSync}=require('esbuild');const {fakeAPI}=require('./helpers.cjs');
const code=buildSync({entryPoints:['src/background.cjs'],bundle:true,write:false,platform:'browser'}).outputFiles[0].text;
async function boot(browser=false, initialize=true, responseFactory=()=>new Response('')) {
 const f=fakeAPI();const event=()=>{const listeners=[];return{addListener:fn=>listeners.push(fn),removeListener:fn=>{const i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1)},emit:(...args)=>listeners.forEach(fn=>fn(...args)),listeners}};
 const alarms=new Map();const requests=[];
 const native={...f.api,alarms:{create:async(name,v)=>alarms.set(name,v),clear:async name=>alarms.delete(name),onAlarm:event()},tabs:{onUpdated:event()},action:{onClicked:event()},runtime:{id:'test',onMessage:event(),onInstalled:event(),onStartup:event(),sendMessage:async()=>{} }};
 native.storage.onChanged=event();for(const key of ['onRemoved','onCreated','onMoved','onChanged','onChildrenReordered'])native.bookmarks[key]=event();
 const context=vm.createContext({[browser?'browser':'chrome']:native,console,URL,TextEncoder,TextDecoder,AbortController,Uint8Array,crypto,structuredClone,setTimeout,clearTimeout,btoa,fetch:async(url,options)=>{requests.push({url,options});return responseFactory(url,options)}});
 vm.runInContext(code,context);
 const send=m=>new Promise(resolve=>native.runtime.onMessage.listeners[0](m,{id:'test'},resolve));
 if (initialize) await send({action:'init'});
 return{f,native,send,alarms,requests};
}
for(const firefox of [false,true])test((firefox?'Firefox Promise':'Chrome')+' storage and alarm disable',async()=>{
 const b=await boot(firefox);await b.f.api.storage.local.set({webdavConfig:{enabled:true,url:'https://dav.test'},backupSettings:{autoBackup:true,backupInterval:60}});assert.equal((await b.send({action:'init'})).success,true);assert(b.alarms.has('backup'));
 await b.f.api.storage.local.set({backupSettings:{autoBackup:false,backupInterval:60}});await b.send({action:'init'});assert.equal(b.alarms.size,0);
 b.native.alarms.onAlarm.emit({name:'backup'});await new Promise(r=>setTimeout(r,20));assert.equal(b.requests.length,0);
});
test('manual backup returns consistent success and writes modern schema',async()=>{
 const b=await boot();await b.f.api.storage.local.set({webdavConfig:{enabled:true,url:'https://dav.test'}});await b.send({action:'init'});const r=await b.send({action:'backup'});assert.equal(r.success,true);const puts=b.requests.filter(r=>r.options.method==='PUT');assert.equal(puts.length,2);assert.equal(JSON.parse(puts[0].options.body).schemaVersion,2);
});
test('preview token prevents an import from using changed bookmark state',async()=>{
 const b=await boot();const exported=await b.send({action:'exportData'});const p=await b.send({action:'previewRestore',data:exported.data,merge:false});assert(p.token);
 await b.f.api.bookmarks.create({parentId:'1',title:'External',url:'https://external.test'});
 const r=await b.send({action:'importData',token:p.token,merge:false,confirmed:true});assert.equal(r.success,false);assert.match(r.error,/重新预览/);
});
test('unpreviewed overwrite cannot mutate data',async()=>{
 const b=await boot();const before=JSON.stringify(b.f.tree);const r=await b.send({action:'importData',data:{},merge:false,confirmed:true});assert.equal(r.success,false);assert.equal(JSON.stringify(b.f.tree),before);
});
test('restore mode cannot change after preview',async()=>{
 const b=await boot();const data=(await b.send({action:'exportData'})).data;const p=await b.send({action:'previewRestore',data,merge:true});const before=JSON.stringify(b.f.tree);
 const r=await b.send({action:'importData',token:p.token,merge:false,confirmed:true});assert.equal(r.success,false);assert.match(r.error,/模式/);assert.equal(JSON.stringify(b.f.tree),before);
});
test('layout import validates before writing and preserves omitted fields',async()=>{
 const b=await boot();await b.f.api.storage.local.set({layoutSettings:{treeIndent:10}});const before=b.f.writes;
 for(const layoutSettings of [null,[],false,'bad',{bookmarkHeight:999}])assert.equal((await b.send({action:'importLayout',data:{layoutSettings}})).success,false);
 assert.equal(b.f.writes,before);assert.equal((await b.send({action:'importLayout',data:{layoutSettings:{bookmarkHeight:32}}})).success,true);
 assert.deepEqual(b.f.data.layoutSettings,{treeIndent:10,bookmarkHeight:32});assert.equal(b.f.tree[0].children[0].children[0].id,'10');
});
test('cold-start command awaits initialization without explicit init message',async()=>{
 const b=await boot(false,false);const result=await b.send({action:'exportData'});assert.equal(result.success,true);assert.equal(result.data.schemaVersion,2);assert.equal(b.alarms.size,0);
});
test('cleanup failure preserves backup success and restore never deletes remotely',async()=>{
 let listings=0;const b=await boot(false,true,(_url,options)=>new Response('',{status:options.method==='PROPFIND'&&++listings>1?500:200}));
 await b.f.api.storage.local.set({webdavConfig:{enabled:true,url:'https://dav.test'},backupSettings:{autoCleanup:true}});await b.send({action:'init'});
 const result=await b.send({action:'backup'});assert.equal(result.success,true);assert.match(result.warning,/清理失败/);
 const data=(await b.send({action:'exportData'})).data;const p=await b.send({action:'previewRestore',data,merge:true});const before=b.requests.length;
 assert.equal((await b.send({action:'importData',token:p.token,confirmed:true,merge:true})).success,true);assert.equal(b.requests.length,before);
});
