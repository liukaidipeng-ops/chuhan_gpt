const assert = require('assert');
const R = require('../src/game-issue-repo.js');

assert.equal(R.CURRENT_REPO, 'liukaidipeng-ops/chuhan_gpt');
assert.equal(R.repoOf({repo: R.LEGACY_REPO, n: 5}), R.LEGACY_REPO);
assert.equal(R.repoOf({url: 'https://github.com/liukaidipeng-ops/chuhan_v01/issues/5', n: 5}), R.LEGACY_REPO);
assert.equal(R.repoOf({n: 5}), R.LEGACY_REPO, 'old records without repo/url must keep the legacy default');

const oldData = {entries:[{k:'mv'}], receipt:{ack:'kept'}};
const records = [{id:'old', data:oldData, issue:{n:5,url:'https://github.com/liukaidipeng-ops/chuhan_v01/issues/5',chunks:3,sent:1}}];
assert.equal(R.migrateRecords(records), true);
assert.equal(records[0].issue.repo, R.LEGACY_REPO);
assert.deepEqual(records[0].data, oldData, 'migration must preserve local game and historical receipt data');

(async () => {
  const calls = [], saved = [];
  const fresh = {id:'new',data:{entries:[1]}};
  const freshIssue = await R.sendIssue({rec:fresh,parts:['a','b'],title:'new',label:'对局',
    request:async (path,method,body,repo)=>{calls.push({path,method,body,repo});return path.endsWith('/issues')?{number:17,html_url:'https://github.com/liukaidipeng-ops/chuhan_gpt/issues/17'}:{};},
    persist:rec=>saved.push(JSON.parse(JSON.stringify(rec)))});
  assert.equal(freshIssue.repo,R.CURRENT_REPO);
  assert.equal(calls[0].path,`/repos/${R.CURRENT_REPO}/issues`);
  assert.equal(calls[1].path,`/repos/${R.CURRENT_REPO}/issues/17/comments`);
  assert.equal(saved.at(-1).issue.sent,2);

  const retry = {id:'old-partial',data:{entries:[1]},issue:{n:5,url:'https://github.com/liukaidipeng-ops/chuhan_v01/issues/5',repo:R.LEGACY_REPO,chunks:3,sent:1,state:'open',receipt:'keep'}};
  const retryCalls = []; let fail=true;
  const request = async (path,method,body,repo)=>{retryCalls.push({path,method,body,repo});if(method==='GET')return {body:'a'};if(fail&&body.body==='c')throw Error('network down');return {};};
  await assert.rejects(()=>R.sendIssue({rec:retry,parts:['a','b','c'],title:'old',label:'对局',request,persist:()=>{}}),/network down/);
  assert.equal(retry.issue.sent,2,'successful chunks must be checkpointed before a later failure');
  assert.equal(retry.issue.repo,R.LEGACY_REPO);
  assert.equal(retry.issue.receipt,'keep');
  fail=false; retryCalls.length=0;
  await R.sendIssue({rec:retry,parts:['a','b','c'],title:'old',label:'对局',request,persist:()=>{}});
  assert.deepEqual(retryCalls.map(x=>x.path),[`/repos/${R.LEGACY_REPO}/issues/5`,`/repos/${R.LEGACY_REPO}/issues/5/comments`], 'retry must verify and resume the old issue in its original repository');
  assert.equal(retry.issue.sent,3);

  const changed={id:'changed',data:{keep:true},issue:{n:6,repo:R.LEGACY_REPO,chunks:2,sent:1}};
  await assert.rejects(()=>R.sendIssue({rec:changed,parts:['new first','b'],title:'x',label:'对局',request:async()=>({body:'old first'}),persist:()=>{}}),/首块/);
  assert.equal(changed.issue.sent,1,'a mismatched legacy issue must not advance');

  const mismatch={id:'mismatch',data:{keep:true},issue:{n:9,repo:R.LEGACY_REPO,chunks:2,sent:1}};
  await assert.rejects(()=>R.sendIssue({rec:mismatch,parts:['a','b','c'],title:'x',label:'对局',request:async()=>{throw Error('must not call network');},persist:()=>{}}),/分块数量/);
  assert.deepEqual(mismatch.data,{keep:true});
  console.log('GAME ISSUE REPO MIGRATION OK');
})().catch(e=>{console.error(e);process.exit(1);});
