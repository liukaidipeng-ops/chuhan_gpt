# Run after node build.js, local HTTP on 8767 and node mqttsrv.js (8883).
from playwright.sync_api import sync_playwright
import json,time
BASE='http://127.0.0.1:8767/'
INIT="""for(const [k,v] of Object.entries({noaudio:1,norender:1,autostart:1,server:'ws://127.0.0.1:8883',vis:'low',quality:'low',speed:3,turnReminder:1}))localStorage.setItem('xq3d-'+k,JSON.stringify(v));"""
MOVE="{k:'mv',from:[0,3],to:[0,4]}"
SNAP="JSON.stringify({S:__xq.game.S,E:__xq.game.entries,H:__xq.notes,clock:[__xq.clock.r,__xq.clock.b,__xq.clock.step]})"
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 errors=[]
 def page(url=BASE+'#bf',mobile=False):
  c=b.new_context(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 900},is_mobile=mobile,has_touch=mobile);c.add_init_script(INIT)
  pg=c.new_page();pg.set_default_timeout(25000);pg.on('pageerror',lambda e:errors.append(str(e)))
  url=url.replace(BASE,BASE+'?nobd&nopaper&').replace('&?','&')
  pg.goto(url,wait_until='domcontentloaded');pg.wait_for_function('!!window.__xq');pg.wait_for_selector('#loading',state='detached',timeout=45000)
  pg.evaluate("BFX.play=async()=>{};__xq.Fx.level='low';__xq.Core.Time.boost=8")
  return pg
 def start(pg,mode='local',bf=1):
  pg.evaluate("([m,bf])=>__xq.startGame(m,'r',{bf,r6:1,bs:1,total:1,step:60,undo:99,hints:1,level:'easy'},{intro:false})",[mode,bf]);pg.evaluate("document.querySelector('#bfTip').classList.add('hidden')")
 def trial(pg,move=MOVE):
  return pg.evaluate("()=>{const before="+SNAP+";if(!__xq.doBF("+move+"))throw Error('trial rejected');return before}")
 def visible(pg):return pg.locator('#turnReview').is_visible()
 A=page();start(A)
 old=trial(A);assert visible(A);A.wait_for_timeout(500)
 assert A.evaluate(SNAP)==old and not A.evaluate('__xq.aiThinking')
 assert A.evaluate('__xq.doBF('+MOVE+')')==False
 A.locator('#trNo').click();assert A.evaluate(SNAP)==old
 trial(A);A.locator('.tr-item').first.click();assert A.evaluate('__xq.game.entries.length')==0
 trial(A);A.locator('#trNever').check();assert A.evaluate("localStorage.getItem('xq3d-turnReminder')")=='1'
 assert A.locator('[data-s="turnReminder"] [data-v="1"]').get_attribute('class')=='on'
 A.locator('#trNo').click();start(A)
 trial(A);A.evaluate("document.querySelector('#trYes').click();document.querySelector('#trYes').click()")
 A.wait_for_function('__xq.busy===0');assert A.evaluate('__xq.game.entries.length')==1 and A.evaluate('__xq.game.turn')=='b'
 start(A);trial(A);start(A,bf=0);assert not visible(A) and not A.evaluate('__xq.game.bf||false')
 A.evaluate("document.querySelector('#trYes').click()");assert A.evaluate('__xq.game.history.length')==0
 start(A);trial(A);start(A);assert not visible(A) and A.evaluate('__xq.game.entries.length')==0
 print('PASS local cancellation, clocks, row return, settings, rapid confirm, restart/mode switch',flush=True)
 # Human vs AI: no search before acceptance; AI acts after acceptance.
 start(A,'ai');old=trial(A);A.wait_for_timeout(600);assert A.evaluate(SNAP)==old and not A.evaluate('__xq.aiThinking')
 A.locator('#trNo').click();assert A.evaluate('__xq.game.entries.length')==0
 trial(A);A.locator('#trYes').click();A.wait_for_function('__xq.game.turn===\'r\' && __xq.game.history.length>=2 && !__xq.busy',timeout=30000)
 print('PASS AI deferred until acceptance, reply completes',flush=True)
 # Ordinary check is committed immediately, without the optional reminder.
 start(A);A.evaluate("""()=>{const g=__xq.game;g.setup(S=>{S.board=Array.from({length:10},()=>Array(9).fill(null));let id=700;const put=(f,r,s,t)=>S.board[r][f]={s,t,id:id++,lv:1,hp:1,cd:0,jm:0,xp:0,kills:0};put(3,0,'r','k');put(5,9,'b','k');put(4,7,'r','r');put(0,3,'r','p');S.merit.r=10;});Board.setPosition(g);__xq.doBF({k:'mv',from:[4,7],to:[5,7]});}""")
 assert not visible(A);assert A.evaluate('__xq.game.inCheck()');A.wait_for_function('__xq.busy===0')
 print('PASS check priority',flush=True)
 # Real local MQTT host + guest + spectator, unmodified network transport.
 H=page(BASE);H.evaluate("document.querySelector('#bCreate').click(); for(const [k,v] of Object.entries({v:'bf',undo:'99',side:'r',total:'15',step:'60'}))document.querySelector('[data-k='+k+'] [data-v=\"'+v+'\"]').click();document.querySelector('#bCreateGo').click()")
 H.wait_for_function("/^[A-Z0-9]{4,}$/.test(document.querySelector('#roomCode').textContent.trim())")
 code=H.inner_text('#roomCode').strip();G=page(BASE+'?room='+code)
 H.wait_for_function('__xq.started && __xq.mode===\'host\'');G.wait_for_function('__xq.started && __xq.mode===\'guest\'')
 for pg in [H,G]:pg.evaluate("document.querySelector('#skip').click();document.querySelector('#bfTip').classList.add('hidden')")
 H.wait_for_function('__xq.busy===0 && __xq.Net.peerState===\'ok\'');G.wait_for_function('__xq.busy===0')
 C=page(BASE+'?room='+code);C.wait_for_function('__xq.started && __xq.mode===\'watch\'')
 for pg in [H,G,C]:pg.evaluate("BFX.play=async()=>{};window.sent=[];const send=Net.send;Net.send=d=>{sent.push(d);return send(d)}")
 def state(pg):return pg.evaluate('JSON.stringify(__xq.game.S)')
 old=state(H);trial(H);H.wait_for_timeout(800)
 assert state(H)==old==state(G)==state(C)
 assert H.evaluate('sent.filter(x=>x&&x.t===\'bf\').length')==0
 H.locator('#trNo').click();assert state(H)==old
 trial(H);H.evaluate("document.querySelector('#trYes').click();document.querySelector('#trYes').click()")
 G.wait_for_function('__xq.game.entries.length===1');C.wait_for_function('__xq.game.entries.length===1')
 assert state(H)==state(G)==state(C);assert H.evaluate('sent.filter(x=>x&&x.t===\'bf\').length')==1
 # Duplicate delivery must not apply twice.
 packet=H.evaluate('sent.find(x=>x&&x.t===\'bf\')');G.evaluate('(d)=>__xq.onData(d)',packet);assert G.evaluate('__xq.game.entries.length')==1
 # Guest stages its own action; matching host snapshot must keep pending state and clocks.
 G.wait_for_function('__xq.busy===0');trial(G,"{k:'mv',from:[0,6],to:[0,5]}");assert visible(G)
 G.evaluate("Net.send({t:'syncReq'})");G.wait_for_timeout(500);assert visible(G) and G.evaluate('__xq.game.entries.length')==1
 G.locator('#trNo').click();assert state(H)==state(G)
 trial(G,"{k:'mv',from:[0,6],to:[0,5]}");G.locator('#trYes').click();H.wait_for_function('__xq.game.entries.length===2');C.wait_for_function('__xq.game.entries.length===2');assert state(H)==state(G)==state(C)
 # Pending host cannot accept peer undo request; authoritative snapshot stays pre-trial.
 H.wait_for_function('__xq.busy===0');trial(H,"{k:'mv',from:[2,3],to:[2,4]}")
 H.evaluate("__xq.onData({t:'undoReq',n:__xq.game.history.length,plies:1})")
 assert H.evaluate("sent.filter(x=>x&&x.t==='undoRes').at(-1).ok") is False
 # Disconnect confirmation cancels safely, without publishing action.
 H.evaluate('Net.close()');H.locator('#trYes').click();assert H.evaluate('__xq.game.entries.length')==2
 print('PASS MQTT host/guest/spectator: no premature move, convergence, duplicate delivery, pending sync, undo guard, disconnect',flush=True)
 M=page(mobile=True);start(M);trial(M);box=M.locator('.tr-dialog').bounding_box();assert box['x']>=0 and box['x']+box['width']<=390 and box['y']>=0 and box['y']+box['height']<=844
 M.locator('#trNo').tap();assert not visible(M)
 print('PASS mobile touch/layout; page errors: '+json.dumps(errors),flush=True);assert not errors
 b.close()
