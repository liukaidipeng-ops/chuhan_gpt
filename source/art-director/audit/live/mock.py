import glob, pathlib, time, sys, json
from playwright.sync_api import sync_playwright
SRC, OUT = sys.argv[1], sys.argv[2]; here = pathlib.Path(__file__).parent
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri()
# 示例：汉方 +0.36（小优），条上朱色占 68%
HTML = {
 'h': '''<div id="liveBar" class="h"><div class="row1"><button class="seal" type="button" title="局势">势</button></div><div class="lbx"><div class="lb"><b>汉</b> 小优</div><div class="ends"><span>汉</span><span>楚</span></div><div class="trk" style="--p:68%"><i class="r"></i><i class="mid"></i><i class="mk"></i></div></div></div>''',
 'v': '''<div id="liveBar" class="v"><button class="seal" type="button" title="局势">势</button><div class="lbx"><span class="end">楚</span><div class="trk" style="--p:68%"><i class="r"></i><i class="mid"></i><i class="mk"></i></div><span class="end">汉</span><div class="lb2"><b>汉</b><br>小优</div></div></div>''',
}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    for dev, (w, h, d, mob) in {'m': (390, 844, 2, True), 'pc': (1440, 900, 1, False)}.items():
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=d, has_touch=mob, is_mobile=mob)
        pg = ctx.new_page(); pg.add_init_script("localStorage.setItem('xq3d-noaudio','1');localStorage.setItem('xq3d-quality',JSON.stringify('low'))")
        pg.goto(url); pg.wait_for_function("()=>window.__xq&&!document.getElementById('loading')", timeout=180000); time.sleep(2)
        pg.evaluate("()=>__xq.startGame('local','r',{undo:0,total:0,step:0,hints:0},{intro:false})"); time.sleep(5)
        pg.add_style_tag(content=open(here / 'live.css').read())
        st = pg.evaluate("()=>{const r=document.getElementById('status').getBoundingClientRect(), b=document.getElementById('cardOpp').getBoundingClientRect(), m=document.getElementById('cardMe').getBoundingClientRect(); return {st:[r.left,r.top,r.right,r.bottom], opp:b.bottom, me:m.top}}")
        for v in ['h', 'v']:
            for open_ in [False, True]:
                pg.evaluate("""([h,v,o,st,mob])=>{ document.getElementById('liveBar')?.remove(); document.body.insertAdjacentHTML('beforeend', h); const L=document.getElementById('liveBar'); if(o) L.classList.add('open');
                  if(v==='h'){ L.style.top=(st.st[3]+8)+'px'; L.style.setProperty('--w', mob?'200px':'300px'); }
                  else { const mid=(st.opp+st.me)/2; L.style.top=(mid-(o? (mob?150:170):15))+'px'; L.style.setProperty('--h', mob?'220px':'260px'); } }""", [HTML[v], v, open_, st, mob])
                time.sleep(.4); pg.screenshot(path=f'{OUT}/{dev}_{v}_{"open" if open_ else "shut"}.png')
        print(dev, json.dumps(st)); ctx.close()
    b.close()
