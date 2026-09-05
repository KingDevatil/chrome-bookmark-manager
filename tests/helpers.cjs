function fakeAPI(options = {}) {
  let id = 100, writes = 0, creates = 0;
  let tree = structuredClone(options.tree || [{ id: '0', children: [{ id: '1', title: 'Toolbar', children: [{ id: '10', title: 'Local', url: 'https://local.test' }] }, { id: '2', title: 'Other', children: [] }] }]);
  let data = structuredClone(options.data || { bookmark_tags: { '10': ['local'] }, shortcuts: [{ id: 'local', title: 'Local', url: 'https://local.test' }] });
  const find = id => { let result; const visit = n => { if(n.id === id) result=n; n.children?.forEach(visit); }; tree.forEach(visit); return result; };
  const api = {
    storage: { local: {
      get: async key => { if(key == null) return structuredClone(data); return Object.fromEntries((Array.isArray(key)?key:[key]).filter(k => data[k] !== undefined).map(k=>[k,structuredClone(data[k])])); },
      set: async update => { if(options.failStorage?.(update)) throw Error('quota exceeded'); writes++; Object.assign(data,structuredClone(update)); }
    } },
    bookmarks: {
      getTree: async()=>structuredClone(tree),
      getChildren: async id=> { const n=find(id); if(!n)throw Error('Missing parent'); return structuredClone(n.children || []); },
      create: async node=> { if(++creates === options.failCreate) throw Error('creation failed'); const n={id:String(id++),...node,...(!node.url?{children:[]}:{})}; find(node.parentId).children.push(n); return structuredClone(n); },
      removeTree: async id=> { const remove=n=>{if(n.children){n.children=n.children.filter(c=>c.id!==id); n.children.forEach(remove)}}; tree.forEach(remove); }
    }
  };
  return {api,get data(){return data},get writes(){return writes},get tree(){return tree},get creates(){return creates}};
}
module.exports={fakeAPI};
