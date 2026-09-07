const {test}=require('node:test');const assert=require('node:assert/strict');
const {errorMessage}=require('../src/services/errors.cjs');
test('errors give recovery steps without hiding existing details',()=>{
 assert.match(errorMessage(new SyntaxError('token')),/JSON/);
 assert.match(errorMessage(new Error('QUOTA_BYTES exceeded')),/存储空间不足/);
 assert.match(errorMessage(new Error('Extension context invalidated')),/刷新页面/);
 assert.match(errorMessage(new Error('Unsupported backup version')),/更新扩展/);
 assert.match(errorMessage(undefined),/操作失败/);
 assert.equal(errorMessage('恢复未完成：快照已保留'),'恢复未完成：快照已保留');
});
