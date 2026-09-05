/* Real extension smoke test, isolated temporary profile. Browser plugin not available. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
async function main() {
  const extension = path.resolve('dist/chrome');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bookmark-manager-qa-'));
  const context = await chromium.launchPersistentContext(profile, { ...(process.env.BOOKMARK_CHROMIUM_PATH ? { executablePath: process.env.BOOKMARK_CHROMIUM_PATH } : { channel: 'chromium' }), headless: true, viewport: { width: 1440, height: 900 }, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
  const errors=[];
  try {
    let worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const id = new URL(worker.url()).host;
    const fixture=await worker.evaluate(async()=>{
      const tree=await chrome.bookmarks.getTree(); const root=tree[0].children.find(n=>n.id==='1');
      const a=await chrome.bookmarks.create({parentId:root.id,title:'Alpha " <b>text</b>',url:'https://alpha.test/'});
      const folder=await chrome.bookmarks.create({parentId:root.id,title:'Folder'});
      const b=await chrome.bookmarks.create({parentId:root.id,title:'Beta',url:'https://beta.test/'});
      await chrome.storage.local.set({bookmark_tags:{[a.id]:['reference'],[b.id]:['other']}});
      return {a,folder,b};
    });
    async function open(route,width=1440) {
      const page=await context.newPage(); await page.setViewportSize({width,height:900});
      page.on('pageerror',e=>errors.push(`${route}: ${e.message}`));
      await page.route('https://**/*',r=>r.abort());
      await page.goto(`chrome-extension://${id}/${route}`);
      return page;
    }
    const manager=await open('manager/manager.html');
    await manager.locator('#bookmark-list .bookmark-item').first().waitFor({timeout:10000}).catch(async()=>{await manager.waitForFunction(()=>document.querySelector('#bookmark-list').children.length>0)});
    assert.match(await manager.title(),/书签|Bookmark/);
    await manager.locator('#search-input').fill('#reference');
    await manager.waitForFunction(()=>document.getElementById('bookmark-list').textContent.includes('Alpha')&&!document.getElementById('bookmark-list').textContent.includes('Beta'));
    await manager.locator('#search-input').fill('');
    await manager.waitForFunction(()=>document.getElementById('bookmark-list').textContent.includes('Beta'));
    await manager.locator('#grid-view-btn').click();
    assert.equal(await manager.locator('#bookmark-list').evaluate(e=>e.children.length),0);
    assert(await manager.locator('#bookmark-grid').evaluate(e=>e.children.length)>=3);
    await manager.screenshot({path:path.join(profile,'manager.png')});
    // Exercise queued backend writes through two actual extension pages.
    const sidebar=await open('sidebar/sidebar.html',400);
    await sidebar.locator('#btn-add-bookmark').waitFor();
    await Promise.all([manager.evaluate(id=>domainCommand('tags','addTag',[id,'first']),fixture.a.id),sidebar.evaluate(id=>domainCommand('tags','addTag',[id,'second']),fixture.a.id)]);
    const tags=await manager.evaluate(id=>BookmarkTags.getTags(id),fixture.a.id);
    assert(tags.includes('first')&&tags.includes('second'));
    await sidebar.evaluate(()=>showAddBookmarkModal({title:'Chosen " <b>literal</b>',url:'https://chosen.test/'}));
    assert.equal(await sidebar.locator('#add-title-input').inputValue(),'Chosen " <b>literal</b>');
    assert.equal(await sidebar.locator('#add-url-input').inputValue(),'https://chosen.test/');
    assert.equal(await sidebar.locator('.edit-modal b').count(),0);
    await sidebar.screenshot({path:path.join(profile,'sidebar.png')});
    const settings=await open('manager/settings.html');
    await settings.locator('#webdav-url').waitFor({state:'attached'});
    const invalid=await settings.evaluate(()=>ExtensionAPI.runtime.sendMessage({action:'importData',data:{},merge:false,confirmed:true}));
    assert.equal(invalid.success,false);
    const exportResult=await settings.evaluate(()=>ExtensionAPI.runtime.sendMessage({action:'exportData'}));
    assert.equal(exportResult.data.schemaVersion,2);
    // Alarm disable must remove an existing periodic task, including a stale task.
    await worker.evaluate(async()=>{await chrome.storage.local.set({webdavConfig:{enabled:true,url:'https://dav.test'},backupSettings:{autoBackup:true,backupInterval:60}})});
    await settings.evaluate(()=>ExtensionAPI.runtime.sendMessage({action:'init'}));
    assert(await worker.evaluate(()=>chrome.alarms.get('backup')));
    await worker.evaluate(()=>chrome.storage.local.set({backupSettings:{autoBackup:false,backupInterval:60}}));
    await settings.evaluate(()=>ExtensionAPI.runtime.sendMessage({action:'init'}));
    assert.equal(await worker.evaluate(()=>chrome.alarms.get('backup')),undefined);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'passed',browser:context.browser().version(),extensionId:id,profile,screenshots:[path.join(profile,'manager.png'),path.join(profile,'sidebar.png')],checks:['load','search','view switching','concurrent tags','chosen bookmark and safe text','settings','invalid restore','export','alarm disable'],pageErrors:errors},null,2));
  } finally {await context.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
