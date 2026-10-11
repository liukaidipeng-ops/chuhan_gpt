# 手机技能模式现状：和电脑下几步，跳过按钮、对话气泡出现时各截一张
import os, glob, pathlib, time, sys, json
from playwright.sync_api import sync_playwright
SRC, OUT = sys.argv[1], sys.argv[2]
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport=dict(zip(('width','height'),map(int,os.environ.get('WH','390x844').split('x')))), device_scale_factor=2, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('xq3d-noaudio','1');localStorage.setItem('xq3d-quality',JSON.stringify('low'))")
    pg.goto(url); pg.wait_for_function("()=>window.__xq&&!document.getElementById('loading')", timeout=180000); time.sleep(2)
    pg.add_style_tag(content='#toast.gpu,.gpuWarn{display:none!important}')
    pg.evaluate("()=>__xq.startGame('ai','r',{bf:1,ai:'mid',undo:3,total:0,step:0,hints:1},{intro:false})"); time.sleep(6)
    pg.evaluate("(() => { const o = document.getElementById('bfTipOk'); if (o && !document.getElementById('bfTip').classList.contains('hidden')) o.click(); })()")
    pg.screenshot(path=f'{OUT}/now_idle.png'); got = set()
    for step in range(10):
        mv = pg.evaluate("""()=>{const g=__xq.game; if(g.turn!=='r'||__xq.busy) return null; const ms=[]; for(let r=0;r<10;r++)for(let f=0;f<9;f++){const q=g.at(f,r); if(q&&q.s==='r') for(const m of g.legalFrom(f,r)) ms.push(m);} ms.sort((a,b)=>(g.at(b.to[0],b.to[1])?1:0)-(g.at(a.to[0],a.to[1])?1:0)); return ms[0]||null}""")
        if mv: pg.evaluate("(m)=>__xq.doBF({k:'mv',from:m.from,to:m.to})", mv)
        for k in range(40):
            st = pg.evaluate("()=>({skip:!document.getElementById('skip').classList.contains('hidden'), bub:['bubOpp','bubMe'].filter(i=>document.getElementById(i).classList.contains('on')), busy:__xq.busy, turn:__xq.game.turn})")
            if st['skip'] and 'skip' not in got: pg.screenshot(path=f'{OUT}/now_skip.png'); got.add('skip'); print('skip', step, k)
            if st['bub'] and 'bub' not in got: pg.screenshot(path=f'{OUT}/now_bubble.png'); got.add('bub'); print('bubble', st['bub'], step, k)
            if not st['busy'] and st['turn'] == 'r': break
            time.sleep(0.4)
        if {'skip', 'bub'} <= got: break
    geo = pg.evaluate("""()=>{const R=id=>{const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}; return {tools:R('tools'),cardMe:R('cardMe'),cardOpp:R('cardOpp'),skip:R('skip'),bubOpp:R('bubOpp'),bubMe:R('bubMe'),bfBar:R('bfBar'),status:R('status'),cls:document.body.className}}""")
    print(json.dumps(geo, ensure_ascii=False)); print('errors', errs[:3]); b.close()
