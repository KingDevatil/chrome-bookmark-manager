const { createAPI } = require('./api.cjs');
globalThis.ExtensionAPI = createAPI(globalThis.browser || globalThis.chrome);
globalThis.PlatformRoots = { toolbar: '1', other: '2', root: '0' };
globalThis.platformReady = ExtensionAPI.bookmarks.getTree().then(tree => {
  const roots = tree[0].children.filter(n => !n.unmodifiable);
  PlatformRoots.root = tree[0].id;
  PlatformRoots.toolbar = (roots.find(n => n.folderType === 'bookmarks-bar' || ['1', 'toolbar_____'].includes(n.id)) || roots[0]).id;
  PlatformRoots.other = (roots.find(n => n.folderType === 'other' || ['2', 'unfiled_____'].includes(n.id)) || roots[0]).id;
});
