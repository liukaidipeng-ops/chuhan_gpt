# 两版减挤方案的实机截图：注入样式 + 一颗收放工具的把手；四个状态：平时、工具展开、跳过、对话气泡
import os, glob, pathlib, time, sys, json
from playwright.sync_api import sync_playwright
SRC, OUT = sys.argv[1], sys.argv[2]; here = pathlib.Path(__file__).parent
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri()
HANDLE = {'A': '令', 'B': '工具'}
SETUP = """(v)=>{ const t=document.getElementById('tools'); let h=document.getElementById('tHandle'); if(!h){ h=document.createElement('button'); h.id='tHandle'; h.className='tool'; h.type='button'; t.appendChild(h); h.onclick=()=>document.body.classList.toggle('toolsOpen'); }
  h.textContent=v; const m=document.getElementById('cardMe').getBoundingClientRect(); document.documentElement.style.setProperty('--meTop',(innerHeight-m.top)+'px'); dispatchEvent(new Event('resize')); }"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    for var in sys.argv[3].split(','):
        ctx = b.new_context(viewport=dict(zip(('width','height'),map(int,os.environ.get('WH','390x844').split('x')))), device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script("localStorage.setItem('xq3d-noaudio','1');localStorage.setItem('xq3d-quality',JSON.stringify('low'))")
        pg.goto(url); pg.wait_for_function("()=>window.__xq&&!document.getElementById('loading')", timeout=180000); time.sleep(2)
        pg.evaluate("()=>__xq.startGame('ai','r',{bf:1,ai:'mid',undo:3,total:0,step:0,hints:1},{intro:false})"); time.sleep(6)
        pg.evaluate("(() => { const o = document.getElementById('bfTipOk'); if (o && !document.getElementById('bfTip').classList.contains('hidden')) o.click(); })()")
        if var != 'now': pg.add_style_tag(content=open(here / f'mock{var}.css').read()); pg.evaluate(SETUP, HANDLE[var])
        time.sleep(1); pg.screenshot(path=f'{OUT}/{var}_idle.png')
        if var != 'now': pg.evaluate("()=>document.body.classList.add('toolsOpen')"); time.sleep(.6); pg.screenshot(path=f'{OUT}/{var}_open.png'); pg.evaluate("()=>document.body.classList.remove('toolsOpen')"); time.sleep(.4)
        # 跳过：真走一步吃子（会进电影镜头），跳过按钮出来时截图
        mv = pg.evaluate("""()=>{const g=__xq.game; const ms=[]; for(let r=0;r<10;r++)for(let f=0;f<9;f++){const q=g.at(f,r); if(q&&q.s==='r') for(const m of g.legalFrom(f,r)) ms.push(m);} ms.sort((a,b)=>(g.at(b.to[0],b.to[1])?1:0)-(g.at(a.to[0],a.to[1])?1:0)); return ms[0]}""")
        pg.evaluate("(m)=>__xq.doBF({k:'mv',from:m.from,to:m.to})", mv)
        for k in range(60):
            if pg.evaluate("()=>!document.getElementById('skip').classList.contains('hidden')"): time.sleep(.3); pg.screenshot(path=f'{OUT}/{var}_skip.png'); print(var, 'skip shot', k, pg.evaluate("()=>document.body.className")); break
            time.sleep(.2)
        for k in range(80):
            if not pg.evaluate("()=>__xq.busy") and pg.evaluate("()=>__xq.game.turn")=='r': break
            time.sleep(.4)
        pg.evaluate("()=>{ __xq.BFX.hooks.bubble('b','竖子不足与谋！今日便叫你片甲不留。',8000); __xq.BFX.hooks.bubble('r','吾宁斗智，不能斗力。',8000); }"); time.sleep(.8); pg.screenshot(path=f'{OUT}/{var}_bubble.png')
        g = pg.evaluate("""()=>{const R=id=>{const e=document.getElementById(id); const r=e.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}; return {tools:R('tools'),cardMe:R('cardMe'),skip:R('skip'),bubOpp:R('bubOpp'),bubMe:R('bubMe')}}""")
        print(var, json.dumps(g), 'errors', errs[:2], flush=True); ctx.close()
    b.close()
