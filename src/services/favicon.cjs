const KEY = 'favicon_cache_v2';
const MAX_ICON = 64 * 1024;
async function iconData(iconURL) {
  if (typeof iconURL !== 'string') throw new Error('Invalid icon URL');
  if (iconURL.startsWith('data:')) {
    if (!/^data:image\/(?:png|jpeg|gif|webp|x-icon|vnd.microsoft.icon);base64,/i.test(iconURL) || iconURL.length > MAX_ICON * 1.4) throw new Error('Invalid icon data');
    return iconURL;
  }
  const url = new URL(iconURL);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported icon source');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    const type = (response.headers.get('content-type') || '').split(';')[0];
    if (!response.ok || !/^image\/(png|jpeg|gif|webp|x-icon|vnd.microsoft.icon)$/i.test(type) || Number(response.headers.get('content-length')) > MAX_ICON) throw new Error('Invalid icon response');
    const reader = response.body.getReader(); const chunks = []; let size = 0;
    try { while (true) { const {done,value} = await reader.read(); if(done)break; size+=value.length; if(size>MAX_ICON)throw new Error('Icon too large'); chunks.push(value); } }
    finally { await reader.cancel().catch(()=>{}); }
    const bytes = new Uint8Array(size); let offset=0; for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    let binary=''; for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return `data:${type};base64,${btoa(binary)}`;
  } finally { clearTimeout(timer); }
}
function createIconCache(api) {
  const pending = new Map(); let timer, writes = Promise.resolve();
  async function flush() {
    const batch = new Map(pending); pending.clear(); timer=null;
    writes = writes.catch(()=>{}).then(async()=>{
      const result=await api.storage.local.get(KEY); const cache=result[KEY]||{};
      for(const [origin,dataUrl]of batch)cache[origin]={dataUrl,ts:Date.now()};
      let size=0,count=0;const output={};
      for(const [origin,entry]of Object.entries(cache).sort((a,b)=>b[1].ts-a[1].ts)) {
        if(Date.now()-entry.ts>30*86400000||count>=200||typeof entry.dataUrl!=='string'||entry.dataUrl.length>MAX_ICON*1.4)continue;
        if(size+entry.dataUrl.length>2*1024*1024)continue;
        size+=entry.dataUrl.length;count++;output[origin]=entry;
      }
      await api.storage.local.set({[KEY]:output});
    });
    return writes;
  }
  const flights=new Map();
  return async(pageURL,iconURL)=>{
    const origin=new URL(pageURL).origin;
    if(!/^https?:/.test(origin))return;
    if(flights.has(origin))return flights.get(origin);
    const flight=iconData(iconURL).then(data=>{pending.set(origin,data);if(!timer)timer=setTimeout(()=>flush().catch(console.error),100);}).finally(()=>flights.delete(origin));
    flights.set(origin,flight);return flight;
  };
}
module.exports={createIconCache,iconData};
