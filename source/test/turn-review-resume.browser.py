# Run after build with local HTTP serving dist/site on 8767.
from playwright.sync_api import sync_playwright

BASE='http://127.0.0.1:8767/?nobd&nopaper'
INIT="""for(const [k,v] of Object.entries({noaudio:1,norender:1,turnReminder:1,vis:'low',quality:'low',speed:3}))localStorage.setItem('xq3d-'+k,JSON.stringify(v));"""
RED="{k:'mv',from:[0,3],to:[0,4]}"
BLACK="{k:'mv',from:[0,6],to:[0,5]}"

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for kind in ['local','ai']:
  c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);c.add_init_script(INIT)
  q=c.new_page();q.set_default_timeout(30000);errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto(BASE);q.wait_for_selector('#loading',state='detached',timeout=45000)
  q.evaluate("(kind)=>__xq.startGame(kind,'r',{bf:1,r6:1,bs:1,total:0,step:0,undo:99,hints:1,level:'easy'},{intro:false})",kind)
  q.evaluate("document.querySelector('#bfTip').classList.add('hidden');BFX.play=async()=>{};__xq.doBF("+RED+")")
  q.wait_for_selector('#turnReview:not(.hidden)');q.locator('#trNever').check();q.locator('#trNo').tap()
  q.evaluate('__xq.doBF('+RED+')')
  if kind=='ai':q.wait_for_function('__xq.busy===0 && __xq.game.turn===\'r\' && __xq.game.history.length>=2',timeout=30000)
  else:q.wait_for_function('__xq.busy===0 && __xq.game.turn===\'b\'')
  q.evaluate("window.dispatchEvent(new Event('pagehide'))")
  rec=q.evaluate("JSON.parse(localStorage.getItem('xq3d-resume'))")
  assert rec['kind']==kind and rec['turnReviewMuted'] is True
  q.goto(BASE);q.wait_for_selector('#loading',state='detached',timeout=45000);q.locator('#bResume').tap();q.wait_for_function('window.__xq?.started')
  q.evaluate("BFX.play=async()=>{};document.querySelector('#bfTip').classList.add('hidden')")
  move=RED.replace('[0,3]','[2,3]').replace('[0,4]','[2,4]') if kind=='ai' else BLACK
  before=q.evaluate('__xq.game.entries.length');q.evaluate('__xq.doBF('+move+')');assert not q.locator('#turnReview').is_visible();q.wait_for_function('(n)=>__xq.game.entries.length>n',arg=before)
  # New game restores the per-game reminder.
  q.evaluate("__xq.startGame('local','r',{bf:1,r6:1,bs:1,total:0,step:0,undo:99,hints:1},{intro:false});document.querySelector('#bfTip').classList.add('hidden');BFX.play=async()=>{};__xq.doBF("+RED+")")
  q.wait_for_selector('#turnReview:not(.hidden)');q.locator('#trNo').tap()
  # Permanent setting remains independent and survives a new game.
  q.evaluate("document.querySelector('[data-s=turnReminder] [data-v=\"0\"]').click();__xq.startGame('local','r',{bf:1,r6:1,bs:1,total:0,step:0,undo:99,hints:1},{intro:false});BFX.play=async()=>{};__xq.doBF("+RED+")")
  assert not q.locator('#turnReview').is_visible() and q.evaluate("localStorage.getItem('xq3d-turnReminder')")=='0'
  assert not errors,errors
  print(kind+' PASS resume keeps per-game mute; new game resets; permanent setting independent',flush=True)
  c.close()
 b.close()
