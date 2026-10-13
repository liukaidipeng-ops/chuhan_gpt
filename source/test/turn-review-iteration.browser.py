# Run after build with local HTTP serving dist/site on 8767. Uses installed Playwright/Chromium.
# Low quality + CSS-only diagnostics bound software-GPU cost; candidate rendering stays enabled.
# TURN_REVIEW_SKIP_PC_VISUAL=1 resumes after an already completed desktop visual check.
from playwright.sync_api import sync_playwright
import json,os
BASE='http://127.0.0.1:8767/?nobd&nopaper#bf'
INIT="""for(const [k,v] of Object.entries({noaudio:1,vis:'low',quality:'low',speed:3,eco:0,turnReminder:1}))if(localStorage.getItem('xq3d-'+k)===null)localStorage.setItem('xq3d-'+k,JSON.stringify(v));"""
RINGS="Board.root.getObjectByName('upgradeHints').children"
MOVE="{k:'mv',from:[0,3],to:[0,4]}"
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for mobile in [False,True]:
  ctx=b.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},is_mobile=mobile,has_touch=mobile);ctx.add_init_script(INIT)
  skip_visual=not mobile and os.environ.get('TURN_REVIEW_SKIP_PC_VISUAL')=='1'
  if skip_visual:ctx.add_init_script("localStorage.setItem('xq3d-norender','1')")
  pg=ctx.new_page();pg.set_default_timeout(25000);errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.goto(BASE,wait_until='domcontentloaded');pg.wait_for_function('window.__xq?.started');pg.wait_for_selector('#loading',state='detached',timeout=45000)
  pg.evaluate("document.querySelector('#bfTip').classList.add('hidden')")
  def start(mode='local',bf=1):
   pg.evaluate("([mode,bf])=>__xq.startGame(mode,'r',{bf,r6:1,bs:1,total:0,step:0,undo:99,hints:1},{intro:false})",[mode,bf]);pg.evaluate("document.querySelector('#bfTip').classList.add('hidden')")
  def trial(m=MOVE):pg.evaluate('__xq.doBF('+m+')');pg.wait_for_selector('#turnReview:not(.hidden)')
  def click(sel):
   if mobile:pg.locator(sel).tap()
   else:pg.locator(sel).click()
  def nohint():assert pg.evaluate(RINGS+'.length')==0
  if not skip_visual:
   start();trial();click('#trItems .tr-item:first-child em')
   expected=pg.evaluate("()=>{let a=[];for(let r=0;r<10;r++)for(let f=0;f<9;f++)if(__xq.game.canUpgrade(f,r))a.push([f,r]);return a}")
   assert len(expected)>1 and pg.evaluate(RINGS+'.length')==2*len(expected)
   assert pg.evaluate('Board.hovered===null') and pg.locator('#bfRow [data-a="up"]').count()==0
   assert pg.evaluate('__xq.game.entries.length')==0
   positions=pg.evaluate(RINGS+".filter((x,i)=>i%2===0).map(m=>[m.position.x,m.position.z])")
   expected_pos=pg.evaluate('(a)=>a.map(([f,r])=>[Board.X(f),Board.Z(r)])',expected);assert positions==expected_pos
   ids=pg.evaluate(RINGS+'.map(x=>x.uuid)');before=pg.evaluate(RINGS+'.map(x=>x.material.opacity)');pg.wait_for_function('(before)=>JSON.stringify(Board.root.getObjectByName(\'upgradeHints\').children.map(x=>x.material.opacity))!==JSON.stringify(before)',arg=before);after=pg.evaluate(RINGS+'.map(x=>x.material.opacity)');assert before!=after
   pg.evaluate("__xq.bfButton('cancel');__xq.bfButton('cancel')");assert pg.evaluate(RINGS+'.map(x=>x.uuid)')==ids,'stable candidates must reuse materials'
   pg.screenshot(path='/tmp/chuhan-quality/iterate-'+('mobile' if mobile else 'pc')+'.png')
   # Real mouse/touch input selects a piece only after the player chooses it.
   point=pg.evaluate("()=>{const v=Board.pos(2,0).clone();v.y+=0.2;v.project(Core.camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2}}")
   if mobile:pg.touchscreen.tap(point['x'],point['y'])
   else:pg.mouse.click(point['x'],point['y'])
   pg.wait_for_selector('#bfRow [data-a="up"]');assert pg.evaluate('Board.hovered!==null');nohint()
   print(('mobile' if mobile else 'PC')+' PASS all candidates, breathing, no auto-selection, real manual selection, reuse',flush=True)
  # Use instantaneous battle playback below to bound lifecycle tests; rendering above is real.
  pg.evaluate('Core.onFrame(()=>{Core.render=false});BFX.play=async()=>{}')
  start();trial();pg.locator('#trNever').check();click('#trNo');assert pg.evaluate("localStorage.getItem('xq3d-turnReminder')")=='1'
  pg.evaluate('__xq.doBF('+MOVE+')');assert not pg.locator('#turnReview').is_visible();pg.wait_for_function('__xq.busy===0')
  trial("{k:'mv',from:[0,6],to:[0,5]}");assert not pg.locator('#trNever').is_checked();click('#trYes');pg.wait_for_function('__xq.busy===0')
  trial("{k:'mv',from:[2,3],to:[2,4]}");click('#trNo')
  # An actual rewind must not restore an old turn's suppression.
  trial("{k:'mv',from:[2,3],to:[2,4]}");pg.locator('#trNever').check();click('#trNo');pg.evaluate('()=>{__xq.requestUndo()}');pg.wait_for_selector('#mAsk:not(.hidden)');click('#askYes');pg.wait_for_function('__xq.busy===0 && __xq.game.turn===\'b\'')
  trial("{k:'mv',from:[0,6],to:[0,5]}");assert not pg.locator('#trNever').is_checked();click('#trNo')
  print(('mobile' if mobile else 'PC')+' PASS turn suppression and undo',flush=True)
  # Global preference is independent, persistent, and never overwritten by a new game.
  click('#tSet');click('#setTabs [data-t="etc"]');click('[data-s="turnReminder"] [data-v="0"]');click('#bSetClose');start()
  pg.evaluate('__xq.doBF('+MOVE+')');assert not pg.locator('#turnReview').is_visible();pg.wait_for_function('__xq.busy===0')
  pg.evaluate("localStorage.setItem('xq3d-norender','1')");pg.reload(wait_until='domcontentloaded');pg.wait_for_function('window.__xq?.started');assert pg.evaluate("localStorage.getItem('xq3d-turnReminder')")=='0'
  pg.evaluate("document.querySelector('#bfTip').classList.add('hidden');document.querySelector('[data-s=turnReminder] [data-v=\"1\"]').click();BFX.play=async()=>{}")
  start();trial();click('#trItems .tr-item:first-child em');assert pg.evaluate(RINGS+'.length')>0
  start(bf=0);nohint();start();nohint()
  trial();click('#trItems .tr-item:first-child em');start('watch');nohint()
  start();trial();click('#trItems .tr-item:first-child em');pg.evaluate("__xq.finishGame(__xq.game.timeout('r'))");nohint()
  assert not errors,errors
  print(('mobile' if mobile else 'PC')+' PASS per-turn suppression, next turn, undo, global persistence, restart/mode/load/watch/end cleanup',flush=True)
  ctx.close()
 b.close()
