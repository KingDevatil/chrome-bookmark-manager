const {test}=require('node:test');
const assert=require('node:assert/strict');
const {normalize,serialize,restore,SerialQueue,mergeShortcuts}=require('../src/services/backup.cjs');
const {fakeAPI}=require('./helpers.cjs');
const {mutate}=require('../src/services/domain.cjs');
function sample(){return {schemaVersion:2,kind:'bookmark-manager-backup',sections:{bookmarks:{roots:[{role:'toolbar',children:[{type:'bookmark',title:'A',url:'https://same.test',tags:['A']},{type:'bookmark',title:'B',url:'https://same.test',tags:['B']}]}]},shortcuts:[{title:'Remote',url:'https://remote.test'}]}}}
test('snapshot verification accepts storage object key reordering',async()=>{
 const f=fakeAPI();const get=f.api.storage.local.get;
 const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,reorder(value[key])])):value;
 f.api.storage.local.get=async key=>reorder(await get(key));
 const result=await restore(f.api,sample(),false);
 assert.equal(result.created,2);assert.equal(f.data.restore_job.status,'complete');
});
for(const corruption of ['missing','value','array-order']) test('snapshot verification blocks '+corruption+' before deleting bookmarks',async()=>{
 const f=fakeAPI();const get=f.api.storage.local.get;
 f.api.storage.local.get=async key=>{const result=await get(key);if(key==='restore_snapshot'){
  if(corruption==='missing')delete result.restore_snapshot;
  else if(corruption==='value')result.restore_snapshot.sections.bookmarks.roots[0].children[0].title='Corrupt';
  else result.restore_snapshot.sections.bookmarks.roots.reverse();
 }return result;};
 await assert.rejects(restore(f.api,sample(),false),/快照.*校验失败/);
 assert.equal(f.creates,0);assert.equal(f.tree[0].children[0].children[0].id,'10');assert.equal(f.data.restore_job,undefined);
});
for(const data of [{},null,{bookmarks:[]},{bookmarks:[{}]},{schemaVersion:99},{version:'9',bookmarks:[]}]) test('Invalid input has zero writes: '+JSON.stringify(data),async()=>{const f=fakeAPI();await assert.rejects(restore(f.api,data,false));assert.equal(f.writes,0);assert.equal(f.tree[0].children[0].children.length,1)});
test('duplicate URL labels survive serialization and cross-ID restore',async()=>{const f=fakeAPI();await restore(f.api,sample(),false);const children=f.tree[0].children[0].children;assert.deepEqual(f.data.bookmark_tags[children[0].id],['A']);assert.deepEqual(f.data.bookmark_tags[children[1].id],['B']);const b=serialize(f.tree,f.data);assert.deepEqual(b.sections.bookmarks.roots[0].children.map(n=>n.tags),[['A'],['B']]);});
test('merge preserves local shortcuts and is idempotent',async()=>{const f=fakeAPI();await restore(f.api,sample(),true);await restore(f.api,sample(),true);assert.equal(f.tree[0].children[0].children.length,3);assert.equal(f.data.shortcuts.length,2);assert.equal(f.data.shortcuts[0].id,'local');});
test('legacy ID tags map to newly created IDs',async()=>{const f=fakeAPI();await restore(f.api,{version:'1.5',bookmarks:[{id:'0',children:[{id:'1',title:'Toolbar',children:[{id:'old',title:'A',url:'https://a.test'}]}]}],tags:{old:['tag']}},false);assert.deepEqual(f.data.bookmark_tags[f.tree[0].children[0].children[0].id],['tag']);assert.equal(f.data.bookmark_tags.old,undefined)});
test('snapshot is saved before failure and blocks unattended retry',async()=>{const f=fakeAPI({failCreate:2});await assert.rejects(restore(f.api,sample(),false),/快照/);assert(f.data.restore_snapshot);assert.equal(f.data.restore_job.status,'failed');await assert.rejects(restore(f.api,sample(),false),/上次恢复/)});
test('snapshot persistence failure prevents deletion',async()=>{const f=fakeAPI({failStorage:x=>Boolean(x.restore_snapshot)});await assert.rejects(restore(f.api,sample(),false));assert.equal(f.creates,0);assert.equal(f.tree[0].children[0].children[0].id,'10');});
test('layout-only import never removes bookmarks',async()=>{const f=fakeAPI();await restore(f.api,{version:'1.0',layoutSettings:{bookmarkHeight:30}},false);assert.equal(f.tree[0].children[0].children[0].id,'10')});
test('legacy tag-only files are rejected rather than guessing IDs',()=>{assert.throws(()=>normalize({tags:{10:['wrong']}}),/配套书签树/)});
test('100 serialized concurrent tag commands retain every change',async()=>{const tree=[{id:'0',children:[{id:'1',title:'Toolbar',children:Array.from({length:100},(_,i)=>({id:String(i+10),title:'A',url:'https://a.test'}))}]}];const f=fakeAPI({tree});const q=new SerialQueue();await Promise.all(Array.from({length:100},(_,i)=>q.run(()=>mutate(f.api,{domain:'tags',method:'addTag',args:[String(i+10),'tag']}))));assert.equal(Object.values(f.data.bookmark_tags).filter(t=>t.includes('tag')).length,100);});
test('queue continues after rejection',async()=>{const q=new SerialQueue();await assert.rejects(q.run(()=>{throw Error('fail')}));assert.equal(await q.run(()=>42),42)});
test('duplicate incoming shortcuts do not replace local title',()=>{const x=mergeShortcuts([{id:'a',title:'local',url:'https://a.test'}],[{title:'remote',url:'https://a.test'}],true);assert.equal(x.length,1);assert.equal(x[0].title,'local')});
test('interrupted job can be recovered from its persisted snapshot',async()=>{const f=fakeAPI({failCreate:2});await assert.rejects(restore(f.api,sample(),false));const snapshot=f.data.restore_snapshot;f.data.restore_job.status='running';await restore(f.api,snapshot,false,{recovery:true});assert.equal(f.data.restore_job.status,'complete');const n=f.tree[0].children[0].children[0];assert.equal(n.title,'Local');assert.deepEqual(f.data.bookmark_tags[n.id],['local']);});
test('same-title duplicate folders retain multiplicity across repeated merge',async()=>{const f=fakeAPI();const b=sample();b.sections.bookmarks.roots[0].children=[{type:'folder',title:'Same',children:[]},{type:'folder',title:'Same',children:[]}];await restore(f.api,b,true);await restore(f.api,b,true);assert.equal(f.tree[0].children[0].children.filter(n=>!n.url).length,2)});
test('Firefox roots map by semantic role',async()=>{const f=fakeAPI({tree:[{id:'root________',children:[{id:'toolbar_____',title:'Toolbar',children:[]},{id:'unfiled_____',title:'Other',children:[]}]}]});await restore(f.api,sample(),false);assert.equal(f.tree[0].children[0].children.length,2)});
test('account and local roots remain distinct in schema',()=>{const b=serialize([{id:'0',children:[{id:'1',folderType:'bookmarks-bar',title:'Local',children:[]},{id:'9',folderType:'bookmarks-bar',syncing:true,title:'Account',children:[]}]}]);assert.equal(normalize(b).sections.bookmarks.roots.length,2)});
test('external modification stops restore and releases event listeners',async()=>{
 const f=fakeAPI();const listeners=new Set();f.api.bookmarks.onChanged={addListener:fn=>listeners.add(fn),removeListener:fn=>listeners.delete(fn)};
 const create=f.api.bookmarks.create;f.api.bookmarks.create=async node=>{const result=await create(node);for(const fn of listeners)fn('10',{title:'External'});return result};
 await assert.rejects(restore(f.api,sample(),true),/外部书签修改/);assert.equal(f.creates,1);assert.equal(f.data.restore_job.status,'failed');assert(f.data.restore_snapshot);assert.equal(listeners.size,0);
});
test('shortcut import validates entire array before mutation',async()=>{
 const f=fakeAPI();await assert.rejects(mutate(f.api,{domain:'shortcuts',method:'import',args:[[{title:'Bad',url:'invalid'}]]}));assert.equal(f.writes,0);
 await mutate(f.api,{domain:'shortcuts',method:'import',args:[[{title:'Good',url:'https://good.test'}]]});assert.equal(f.data.shortcuts[0].title,'Good');assert(f.data.shortcuts[0].id);
});
test('restore journal maps duplicate paths to distinct IDs and counts subtree deletions',async()=>{
 const f=fakeAPI({tree:[{id:'0',children:[{id:'1',title:'Toolbar',children:[{id:'10',title:'Folder',children:[{id:'11',title:'Old',url:'https://old.test'}]}]}]}]});
 const result=await restore(f.api,sample(),false);assert.equal(result.deleted,2);assert.deepEqual(f.data.restore_job.completedRoots,['toolbar']);
 assert.notEqual(f.data.restore_job.nodeMap['toolbar/0'],f.data.restore_job.nodeMap['toolbar/1']);assert.equal(Object.keys(f.data.restore_job.nodeMap).length,2);
});
