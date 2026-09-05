const globals = require('globals');
module.exports = [{
  files: ['src/**/*.js', 'src/**/*.cjs'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: {
    ...globals.browser, ...globals.node, chrome: 'readonly', browser: 'readonly',
    ExtensionAPI: 'readonly', PlatformRoots: 'readonly', platformReady: 'readonly',
    ThemeManager: 'readonly', Storage: 'readonly', DOM: 'readonly', BookmarkUtils: 'readonly',
    Utils: 'readonly', FrequentlyUsedConfig: 'readonly', BookmarkTags: 'readonly', TagGroups: 'readonly',
    ShortcutUtils: 'readonly', I18n: 'readonly', FaviconService: 'readonly', FrequentlyUsed: 'readonly',
    Dialog: 'readonly', showConfirm: 'readonly', showAlert: 'readonly', showPrompt: 'readonly', VirtualList: 'readonly'
  } },
  rules: { 'no-undef': 'error', 'no-redeclare': ['error', { builtinGlobals: false }], 'constructor-super': 'error', 'no-unreachable': 'error' }
}];
