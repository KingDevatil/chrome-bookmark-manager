const {test}=require('node:test');const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');const path=require('node:path');
const {fakeAPI}=require('./helpers.cjs');const {mutate}=require('../src/services/domain.cjs');const {SerialQueue,serialize}=require('../src/services/backup.cjs');
async function load(route, options) {
  const f=fakeAPI(options);const errors=[];const queue=new SerialQueue();
  const event=()=>({addListener(){},removeListener(){}});
  const native={...f.api,history:{search:async()=>[],getVisits:async()=>[],onVisited:event(),onVisitRemoved:event()},tabs:{query:async()=>[{title:'Current',url:'https://current.test'}],create:async()=>{}},runtime:{id:'test',getURL:x=>x,onMessage:event(),sendMessage:async m=>{
    if(m.action==='domain')try{return{success:true,data:await queue.run(()=>mutate(native,m))}}catch(e){return{success:false,error:e.message}}
    if(m.action==='exportData')return{success:true,data:serialize(f.tree,f.data)};
    if(m.action==='listBackups')return [];
    return {success:true};
  }}};
  native.storage.onChanged=event();for(const e of ['onCreated','onRemoved','onChanged','onMoved','onChildrenReordered','onImportEnded'])native.bookmarks[e]=event();
  native.bookmarks.get=async id=>{const ids=Array.isArray(id)?id:[id];const found=[];const visit=n=>{if(ids.includes(n.id))found.push(n);n.children?.forEach(visit)};f.tree.forEach(visit);return structuredClone(found)};
  const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('CSS'))errors.push(e.message)});
  const dom=await JSDOM.fromFile(path.resolve('dist/chrome',route),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.chrome=native;w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.CSS={escape:x=>x.replace(/"/g,'\\"')};w.TextDecoder=TextDecoder;w.AbortController=AbortController;w.fetch=async()=>{throw Error('offline test')};}});
  await new Promise(resolve=>dom.window.addEventListener('load',()=>setTimeout(resolve,100)));
  return {dom,errors,f};
}
test('manager loads, searches tags, switches to a single rendered view',async()=>{
 const {dom,errors}=await load('manager/manager.html');try{const w=dom.window;assert.match(w.document.getElementById('bookmark-list').textContent,/Local/);
 await w.handleSearch({target:{value:'#local'}});assert.match(w.document.getElementById('bookmark-list').textContent,/Local/);
 w.setViewMode('grid');assert.equal(w.document.getElementById('bookmark-list').children.length,0);assert.equal(w.document.getElementById('bookmark-grid').children.length,1);assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
test('sidebar uses selected item and preserves quoted HTML as literal input',async()=>{
 const {dom,errors}=await load('sidebar/sidebar.html');try{const w=dom.window;
 await w.showAddBookmarkModal({title:'Chosen " <b>text</b>',url:'https://chosen.test'});
 assert.equal(w.document.getElementById('add-title-input').value,'Chosen " <b>text</b>');assert.equal(w.document.getElementById('add-url-input').value,'https://chosen.test');assert.equal(w.document.querySelector('.edit-modal b'),null);assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
test('settings loads and safely renders arbitrary group names',async()=>{
 const {dom,errors}=await load('manager/settings.html');try{const w=dom.window;assert(w.document.getElementById('webdav-url'));const card=w.createTagGroupCard({id:'a',name:'<b>literal</b>',tags:['<i>tag</i>']});assert.equal(card.querySelector('b,i'),null);assert.match(card.textContent,/<b>literal<\/b>/);assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
test('10,000-row list keeps a bounded DOM and full-data selection',async()=>{
 const tree=[{id:'0',children:[{id:'1',title:'Toolbar',children:Array.from({length:10000},(_,i)=>({id:String(i+10),title:'Item '+i,url:'https://example.test/'+i}))},{id:'2',title:'Other',children:[]}]}];
 const {dom,errors}=await load('manager/manager.html',{tree});
 try{const w=dom.window;const list=w.document.getElementById('bookmark-list');assert(list.querySelectorAll('.bookmark-row').length<=40);w.selectAll();assert.equal(w.eval('state.selectedIds.size'),10000);
 const scroller=w.document.querySelector('.bookmark-container');scroller.scrollTop=300000;scroller.dispatchEvent(new w.Event('scroll'));await new Promise(r=>setTimeout(r,50));assert.match(list.textContent,/Item 49/);assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
test('manager sorting uses raw sibling anchors in both directions and ignores search',async()=>{
 const children=[{id:'10',title:'A',url:'https://a.test'},{id:'11',title:'Folder',children:[]},{id:'12',title:'B',url:'https://b.test'},{id:'13',title:'C',url:'https://c.test'}];
 const {dom}=await load('manager/manager.html',{tree:[{id:'0',children:[{id:'1',title:'Toolbar',children},{id:'2',title:'Other',children:[]}]}]});
 try{const w=dom.window;const moves=[];w.testMove=(id,destination)=>moves.push({id,...destination});w.eval('BookmarkUtils.move = async (id, destination) => testMove(id, destination)');
 await w.moveBookmark(1,3);assert.deepEqual(moves.pop(),{id:'10',parentId:'1',index:3});
 await w.moveBookmark(3,1);assert.deepEqual(moves.pop(),{id:'13',parentId:'1',index:0});
 await w.handleSearch({target:{value:'A'}});await w.moveBookmark(0,1);assert.equal(moves.length,0);
 }finally{dom.window.close()}
});
