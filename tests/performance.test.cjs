const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('history statistics bounds concurrency at six and coalesces identical requests',async()=>{
 let active=0,peak=0,calls=0;
 const history=Array.from({length:30},(_,i)=>({title:'item '+i,url:'https://site.test/'+i}));
 const ctx=vm.createContext({console,URL,Date,Set,Map,Promise,BookmarkUtils:{getTree:async()=>[]},ExtensionAPI:{history:{search:async()=>history,getVisits:async()=>{calls++;peak=Math.max(peak,++active);await new Promise(r=>setTimeout(r,2));active--;return[{visitTime:Date.now(),transition:'typed'}]}},bookmarks:{getTree:async()=>[]}}});
 vm.runInContext(fs.readFileSync('src/shared/frequentlyUsed.js','utf8'),ctx);
 const result=await vm.runInContext('Promise.all([FrequentlyUsed.getFrequentlyUsed(),FrequentlyUsed.getFrequentlyUsed()])',ctx);
 assert.equal(calls,30);assert(peak<=6&&peak>1);assert.equal(result[0].length,10);assert.equal(JSON.stringify(result[0]),JSON.stringify(result[1]));
});
test('concurrent favicon cache hits read storage once per page',async()=>{
 let reads=0;const ctx=vm.createContext({URL,Date,Map,console,ExtensionAPI:{storage:{local:{get:async()=>{reads++;return{favicon_cache_v2:{'https://a.test':{dataUrl:'data:image/png;base64,AQ==',ts:Date.now()}}}}},onChanged:{addListener(){}}}}});
 vm.runInContext(fs.readFileSync('src/shared/favicon.js','utf8'),ctx);
 const result=await vm.runInContext('Promise.all(Array.from({length:1000},()=>FaviconCache.get("https://a.test/path")))',ctx);assert.equal(reads,1);assert.equal(result.length,1000);assert(result.every(x=>x==='data:image/png;base64,AQ=='));
});
test('worker icon conversion handles bytes without FileReader and rejects oversized body',async()=>{
 const {iconData}=require('../src/services/favicon.cjs');const original=global.fetch;
 try{global.fetch=async()=>new Response(new Uint8Array([0,127,128,255]),{headers:{'content-type':'image/png'}});assert.equal(await iconData('https://a.test/favicon.ico'),'data:image/png;base64,AH+A/w==');
 global.fetch=async()=>new Response(new Uint8Array(65537),{headers:{'content-type':'image/png'}});await assert.rejects(iconData('https://a.test/favicon.ico'),/too large/);
 }finally{global.fetch=original}
});
