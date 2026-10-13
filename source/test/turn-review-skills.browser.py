# Local dist/site on port 8767. Low quality/CSS diagnostics keep real candidate rendering enabled.
from playwright.sync_api import sync_playwright
RINGS="Board.root.getObjectByName('upgradeHints').children"
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for mobile in [False,True]:
  c=b.new_context(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 900},is_mobile=mobile,has_touch=mobile)
  c.add_init_script("for(const [k,v] of Object.entries({noaudio:1,vis:'low',quality:'low',speed:3,turnReminder:1}))localStorage.setItem('xq3d-'+k,JSON.stringify(v))")
  pg=c.new_page();pg.set_default_timeout(25000);errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.goto('http://127.0.0.1:8767/?nobd&nopaper#bf',wait_until='domcontentloaded');pg.wait_for_function('window.__xq?.started');pg.wait_for_selector('#loading',state='detached',timeout=45000)
  def click(selector):
   if mobile:pg.locator(selector).tap()
   else:pg.locator(selector).click()
  def setup(n):
   pg.evaluate("async n=>{await __xq.startGame('local','r',{bf:1,r6:1,bs:1,total:0,step:0,undo:99},{intro:false});document.querySelector('#bfTip').classList.add('hidden');__xq.game.setup(S=>{S.merit.r=0;for(let i=0;i<n;i++){let q=S.board[3][i*2];q.lv=2;q.hp=2;}let q=S.board[3][4];q.lv=2;q.hp=2;q.cd=100;q.c_juma=100;});Board.setPosition(__xq.game);__xq.bfButton('cancel');}",n)
  for n in [2,1]:
   setup(n);old=pg.evaluate('JSON.stringify(__xq.game.S)')
   pg.evaluate("__xq.doBF({k:'mv',from:[8,3],to:[8,4]})")
   item=pg.locator('#trItems .tr-item').filter(has_text='拒马')
   if mobile:item.tap()
   else:item.click()
   assert pg.evaluate('JSON.stringify(__xq.game.S)')==old
   assert pg.evaluate(RINGS+'.length')==n*2
   assert pg.evaluate('Board.hovered===null && __xq.bfMode===null && __xq.game.entries.length===0')
   assert pg.locator('#bfRow [data-a="sk"]').count()==0
   positions=pg.evaluate(RINGS+'.filter((x,i)=>i%2===0).map(x=>[x.position.x,x.position.z])')
   assert positions==pg.evaluate('n=>Array.from({length:n},(_,i)=>[Board.X(i*2),Board.Z(3)])',n)
   if n==2:
    pg.screenshot(path='/tmp/chuhan-quality/skill-hints-'+('mobile' if mobile else 'pc')+'.png')
    pg.evaluate("__xq.game.setup(S=>{S.board[3][0].cd=100;S.board[3][0].c_juma=100});__xq.bfButton('cancel')")
    assert pg.evaluate(RINGS+'.length')==2,'candidate set refreshes after cooldown change'
    continue
   point=pg.evaluate("()=>{let v=Board.pos(0,3).clone();v.y+=.2;v.project(Core.camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2}}")
   if mobile:pg.touchscreen.tap(point['x'],point['y'])
   else:pg.mouse.click(point['x'],point['y'])
   pg.wait_for_selector('#bfRow [data-sk="juma"]');assert pg.evaluate(RINGS+'.length')==0
   pg.evaluate('Core.onFrame(()=>{Core.render=false});BFX.play=async()=>{}')
   click('#bfRow [data-sk="juma"]')
   if pg.locator('#bfRow [data-a="ok"]').count():click('#bfRow [data-a="ok"]')
   pg.wait_for_function('__xq.game.freeUsed && __xq.busy===0')
   assert pg.evaluate('__xq.game.entries.length===1 && __xq.game.turn===\'r\'')
  pg.evaluate("__xq.startGame('local','r',{total:0,step:0},{intro:false})");assert pg.evaluate(RINGS+'.length')==0
  assert not errors,errors
  print(('mobile' if mobile else 'PC')+' PASS multiple/single legal skill hints, no auto-selection/action, cooldown update, real manual selection/use, reset, no errors',flush=True)
  c.close()
 b.close()
