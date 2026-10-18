"""Bounded browser regression: compare normal-mode materials against a main build.
Usage: python3 test/king-stone.browser.py --baseline /tmp/main-site --output /tmp/king-check
Requires the existing Playwright/Chromium test environment; does not install dependencies.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import argparse,functools,threading,json,hashlib,datetime,traceback,sys
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);p.add_argument('--site',default=str(Path(__file__).resolve().parents[1]/'dist/site'));p.add_argument('--output',required=True);p.add_argument('--resume-ui',action='store_true');a=p.parse_args();O=Path(a.output);O.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
servers=[]
def serve(path):
 s=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(path)));threading.Thread(target=s.serve_forever,daemon=True).start();servers.append(s);return f'http://127.0.0.1:{s.server_address[1]}/'
urls={'baseline':serve(a.baseline),'candidate':serve(a.site)}
INIT="let seed=104729;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967295};for(const[k,v]of Object.entries({noaudio:1,models:0,quality:'mid',vis:'low',eco:1,tilt:0,localView:'free'}))localStorage.setItem('xq3d-'+k,JSON.stringify(v));"
FINGERPRINT="""async () => {
 const sha=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const texture=async t=>{if(!t)return null;const im=t.image;if(!im)return {space:t.colorSpace};let bytes;
 if(im.data)bytes=im.data;else if(im.width){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(im,0,0);bytes=q.getImageData(0,0,c.width,c.height).data;}
 return {width:im.width,height:im.height,space:t.colorSpace,hash:bytes?await sha(bytes):null};};
 const mat=async m=>({type:m.type,color:m.color?.getHex(),roughness:m.roughness,metalness:m.metalness,opacity:m.opacity,transparent:m.transparent,clearcoat:m.clearcoat,envIntensity:m.envMapIntensity,maps:await Promise.all(['map','normalMap','roughnessMap','metalnessMap','aoMap'].map(k=>texture(m[k])))});
 const out=[];for(const m of Board.pieces.values()){const slots=[];for(const c of m.children.slice(0,3))slots.push({visible:c.visible,position:c.position.toArray(),scale:c.scale.toArray(),geometry:await sha(c.geometry.attributes.position.array),material:await mat(c.material)});out.push({id:m.userData.id,side:m.userData.s,type:m.userData.t,slots});}return out;
}"""
CHECK="""()=>({pieces:Board.pieces.size,history:__xq.game.history.length,notes:__xq.notes.length,skill:!!__xq.game.bf,kings:[...Board.pieces.values()].filter(m=>m.userData.t==='k').map(m=>({side:m.userData.s,stone:m.userData.kingStone||null,body:m.children[0].material.type})),otherStone:[...Board.pieces.values()].filter(m=>m.userData.t!=='k'&&m.userData.kingStone).length,glError:Core.renderer.getContext().getError(),state:typeof KingStone==='undefined'?null:KingStone.state,render:Core.render,eco:Core.ECO})"""
report={'startedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':[],'errors':[],'screenshots':[],'normalSignatures':{}}
if a.resume_ui:
 report=json.loads((O/'report.json').read_text());(O/'first-pass.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));report['priorHarnessIssue']=report['errors'];report['errors']=[];report['resumedUIAfterTransitionWaitCorrection']=True
def save():(O/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
def add(name,value=True):report['checks'].append({'name':name,'value':value});save();print(name,json.dumps(value,ensure_ascii=False)[:180],flush=True)
def ready(pg):
 pg.wait_for_function('__xq.started&&__xq.busy===0');pg.wait_for_selector('#loading',state='detached')
 if pg.locator('#bfTipOk').is_visible():pg.locator('#bfTipOk').click()
 pg.wait_for_function("[...Board.pieces.values()].every(m=>m.userData.h||!m.children[1].material.normalMap||m.children[1].material.normalMap.image?.width>1)")
def start(pg,opts,mode='local'):
 pg.evaluate("o=>__xq.startGame(o.mode,'r',{total:0,step:0,undo:99,hints:1,...o.opts},{intro:false})",{'mode':mode,'opts':opts});ready(pg)
def shot(pg,name):
 pg.mouse.move(2,300);pg.wait_for_timeout(250);pg.screenshot(path=str(O/name));report['screenshots'].append(name);save()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);report['browser']=b.version
 try:
  if not a.resume_ui:
   normal={};pages={};contexts=[];requests=[]
   for label in ['baseline','candidate']:
    c=b.new_context(viewport={'width':960,'height':720});contexts.append(c);c.add_init_script(INIT);pg=c.new_page();pages[label]=pg;pg.set_default_timeout(90000);pg.on('pageerror',lambda e:report['errors'].append(str(e)))
    if label=='candidate':pg.on('request',lambda req:requests.append(req.url) if '/king-stone-r4/' in req.url else None)
    pg.goto(urls[label]+'#local',wait_until='domcontentloaded');ready(pg)
    for key,opts in [('wood',{}),('silver',{'skin':2}),('gold',{'skin':3}),('jade',{'skin':4}),('jieqi',{'jq':1})]:
     # Fix the random layout stream for the revealed-piece mode in both builds.
     pg.evaluate("()=>{let seed=20261018;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967295}}")
     start(pg,opts);sig=pg.evaluate(FINGERPRINT);h=hashlib.sha256(json.dumps(sig,sort_keys=True).encode()).hexdigest();report['normalSignatures'].setdefault(label,{})[key]=h
     if label=='baseline':normal[key]=sig
     else:
      assert sig==normal[key],f'normal material differs: {key}'
      assert not requests and pg.evaluate('KingStone.state')=='idle';assert all(k['stone'] is None for k in pg.evaluate(CHECK)['kings']);add('normal '+key+': all piece geometry/material/texture fingerprints match main; zero asset requests',h)
     if key=='wood':shot(pg,label+'-normal-wood.png')
    save()
   baseline,candidate=pages['baseline'],pages['candidate']
   for pg in [baseline,candidate]:
    pg.evaluate("()=>{let seed=20261018;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967295}}")
    start(pg,{'bf':1})
   candidate.wait_for_function("KingStone.state==='ready'&&[...Board.pieces.values()].filter(m=>m.userData.t==='k').every(m=>m.userData.kingStone==='01-R4')")
   before=baseline.evaluate(FINGERPRINT);after=candidate.evaluate(FINGERPRINT)
   assert [m for m in before if m['type']!='k']==[m for m in after if m['type']!='k'];assert [[s['geometry'] for s in m['slots']] for m in before]==[[s['geometry'] for s in m['slots']] for m in after]
   add('skill: exactly two kings changed; other 30 material fingerprints and all geometry match main',candidate.evaluate(CHECK))
   assert len(requests)==12;add('skill-only lazy assets: twelve requests, no runtime generation',len(requests))
   # Verify actual decoded maps against the approved R4 pixel hashes.
   manifest=json.loads((Path(a.site).parents[1]/'img/king-stone-r4/manifest.json').read_text())
   maps={x['file']:x['rgbaSHA256'] for x in manifest['files']}
   for m in after:
    if m['type']!='k':continue
    for slot,kind in [(0,'body'),(1,'face')]:
     for index,channel in [(0,'color'),(1,'normal'),(2,'orm')]:assert m['slots'][slot]['material']['maps'][index]['hash']==maps[f"{m['side']}-{kind}-{channel}.png"]
   add('decoded production textures exactly match approved R4 RGBA hashes')
   def square(at):return candidate.evaluate('a=>{const p=Board.pos(a[0],a[1],Board.TOP+.1).project(Core.camera);return[(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]}',at)
   candidate.mouse.click(*square([4,0]));candidate.mouse.click(*square([4,1]),click_count=3,delay=80);candidate.wait_for_timeout(350)
   if candidate.locator('#turnReview').is_visible():candidate.locator('#trYes').click()
   candidate.wait_for_function('__xq.game.history.length===1&&__xq.busy===0');assert candidate.evaluate('__xq.notes.length')==1;add('king move and repeated click commit once with matching history')
   candidate.locator('#tUndo').click();candidate.locator('#askYes').click();candidate.wait_for_function('__xq.game.history.length===0&&__xq.busy===0');assert candidate.evaluate('__xq.notes.length')==0;add('undo restores king and history')
  else:
   contexts=[];c=b.new_context(viewport={'width':960,'height':720});contexts.append(c);c.add_init_script(INIT);candidate=c.new_page();candidate.set_default_timeout(90000);candidate.on('pageerror',lambda e:report['errors'].append(str(e)))
   candidate.goto(urls['candidate']+'#local',wait_until='domcontentloaded');ready(candidate);start(candidate,{'bf':1});candidate.wait_for_function("KingStone.state==='ready'")
  candidate.evaluate('Squads.Stand.set(true)');candidate.wait_for_function("Squads.Stand.count===32&&[...Board.pieces.values()].filter(m=>m.userData.t==='k').every(m=>!m.children[0].visible&&!!Squads.Stand.sq(m)?.hero)");candidate.evaluate('Squads.Stand.set(false)');candidate.wait_for_function("[...Board.pieces.values()].filter(m=>m.userData.t==='k').every(m=>m.children[0].visible)");add('existing hero models remain authoritative and return to discs')
  start(candidate,{'bf':1});assert all(k['stone']=='01-R4' for k in candidate.evaluate(CHECK)['kings']);add('restart preserves skill king appearance')
  start(candidate,{});assert candidate.evaluate(CHECK)['otherStone']==0 and all(k['stone'] is None for k in candidate.evaluate(CHECK)['kings']);sig=candidate.evaluate(FINGERPRINT);assert hashlib.sha256(json.dumps(sig,sort_keys=True).encode()).hexdigest()==report['normalSignatures']['baseline']['wood'];add('after leaving skill mode, normal wood material fingerprints still match main')
  start(candidate,{'bf':1,'level':'mid'},'ai');shot(candidate,'skill-pc-day.png');candidate.evaluate("EnvironmentMode.set('night')");shot(candidate,'skill-pc-night.png');candidate.locator('#tView').click();candidate.wait_for_function('Core.Cam.view===1&&!Core.Cam.spinning');candidate.wait_for_timeout(1600);shot(candidate,'skill-pc-top-night.png');candidate.evaluate("EnvironmentMode.set('day')");candidate.locator('#tView').click();candidate.locator('#tView').click();candidate.wait_for_function('Core.Cam.view===0');add('skill day/night and top/default camera transitions',candidate.evaluate(CHECK))
  for c in contexts:c.close()
  c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,user_agent=p.devices['iPhone 13']['user_agent']);c.add_init_script(INIT);pg=c.new_page();pg.set_default_timeout(90000);pg.on('pageerror',lambda e:report['errors'].append(str(e)));pg.goto(urls['candidate']+'#local',wait_until='domcontentloaded');ready(pg);start(pg,{'bf':1,'level':'mid'},'ai');pg.wait_for_function("KingStone.state==='ready'");shot(pg,'skill-mobile-day.png');pg.locator('#tView').click();pg.wait_for_function('Core.Cam.view===1&&!Core.Cam.spinning');pg.wait_for_timeout(1600);shot(pg,'skill-mobile-top.png');add('mobile touch viewport, default and top view',pg.evaluate(CHECK));c.close()
 except Exception:
  report['errors'].append(traceback.format_exc());print(traceback.format_exc(),flush=True)
 finally:report['completedUTC']=datetime.datetime.now(datetime.timezone.utc).isoformat();save();b.close()
for s in servers:s.shutdown()
if report['errors']:sys.exit(1)
