# 自查 src/duel.js：一个空页面只载 three + duel.js，四级各拍两张
import time, pathlib, os
from playwright.sync_api import sync_playwright
H = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.abspath(H + '/../..'); THREE = SRC + '/node_modules/three/build/three.min.js'
open(H + '/_t.html', 'w').write('<!doctype html><meta charset=utf-8><body style="margin:0;background:#000"><script src="three.min.js"></script><script src="duel.js"></script>')
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 960, 'height': 540}); pg.on('pageerror', lambda e: print('PAGEERROR', e))
    pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
    pg.route('**/duel.js', lambda r: r.fulfill(path=SRC + '/src/duel.js', content_type='application/javascript'))
    pg.goto(pathlib.Path(H + '/_t.html').as_uri()); time.sleep(1.5)
    for sc in ['1v1', '2v2', '3v3', 'zm3']:
        for kill, tt in [(0, 2.0), (1, 4.0)]:
            pg.evaluate("([sc,k])=>{const E=Duel.engine;E._test.setKill(!!k);E._test.build(sc);E._test.canvas.style.display='block';if(!E._test.canvas.parentNode)document.body.appendChild(E._test.canvas)}", [sc, kill])
            pg.evaluate("(tt)=>{const E=Duel.engine;let t=0,k=0;while(t<tt&&k++<3000)t=E._test.step(0.01)}", tt)
            time.sleep(0.3); pg.screenshot(path=f'{H}/t_{sc}_{kill}.png'); print('shot', sc, kill, flush=True)
    r = pg.evaluate("async()=>{const t0=performance.now();await Duel.play({lv:2,kill:true,speed:6});return performance.now()-t0}")
    print('play resolved ms', r)
    b.close()
