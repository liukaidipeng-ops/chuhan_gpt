"""M34 兵卒对打逐帧录：python3 steprec_duel.py <站点> <输出目录> <攻方等级 1-4> <kill 1|0> <秒数> [fps]
汉兵 (4,4) 吃 / 打楚卒 (4,5)；kill=0 时把卒血调高让它扛住。时钟全接管（游戏 + 对打画布），逐帧截整页。"""
import sys, time, subprocess, os
from playwright.sync_api import sync_playwright
site, out, lv, kill, secs = sys.argv[1:6]
fps = float(sys.argv[6]) if len(sys.argv) > 6 else 20
W, H = [int(x) for x in os.environ.get('WH', '800x450').split('x')]
port = 8150 + (abs(hash(out)) % 40)
os.makedirs(out, exist_ok=True)
for f in os.listdir(out): os.remove(os.path.join(out, f))
http = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=site, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        c = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1)
        c.add_init_script("localStorage.setItem('xq3d-noaudio','1'); localStorage.setItem('xq3d-quality', JSON.stringify('mid')); localStorage.setItem('xq3d-confirm','0'); localStorage.setItem('xq3d-models','1'); localStorage.setItem('xq3d-vis', JSON.stringify('cine'));")
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(f'http://127.0.0.1:{port}/?nopaper&nobd', wait_until='commit', timeout=180000); t0 = time.time()
        while time.time() - t0 < 500 and not pg.evaluate("!!window.__xq && !document.getElementById('loading')"): time.sleep(0.3)
        pg.evaluate("window.__xq.startGame('local','r',{undo:99,total:0,step:0,hints:1,bf:1},{intro:false})"); time.sleep(5)
        pg.evaluate("(() => { const o = document.getElementById('bfTipOk'); if (o && !document.getElementById('bfTip').classList.contains('hidden')) o.click(); })()")
        print('setup', pg.evaluate("""(() => { const X = __xq, g = X.game, S = g.S, BF = X.BF, lv = %s, kill = %s;
          const r = S.board[3][4]; S.board[3][4] = null; S.board[4][4] = r; r.lv = lv; r.hp = BF.hpOf('p', lv);
          const k = S.board[6][4]; S.board[6][4] = null; S.board[5][4] = k; k.lv = 1; k.hp = kill ? 1 : 9;
          X.Board.reconcile(g); return JSON.stringify({ turn: S.turn, r, k }); })()""" % (lv, kill)), flush=True)
        time.sleep(1)
        pg.evaluate("""(() => { THREE.Clock.prototype.getDelta = function () { return window.__dt || 0; }; window.__dt = 0; window.__vt = performance.now();
          performance.now = () => window.__vt; const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => raf(() => cb(window.__vt)); })()""")
        STEP = "(dt) => new Promise(res => { window.__dt = dt; window.__vt += dt * 1000; requestAnimationFrame(() => { window.__dt = 0; res(); }); })"
        print('attack', pg.evaluate("__xq.doBF({ k: 'mv', from: [4, 4], to: [4, 5] })"), flush=True)
        N = int(float(secs) * fps); t1 = time.time(); left = -1
        for i in range(N):
            pg.evaluate(f"({STEP})({1 / fps})")
            pg.screenshot(path=f"{out}/f{i:04d}.jpg", type='jpeg', quality=85)
            if i % 20 == 0:
                bz = pg.evaluate('__xq.busy'); print('frame', i, round(time.time() - t1, 1), 'busy', bz, flush=True)
                if not bz and i > 40 and left < 0: left = 15
            if left > 0:
                left -= 1
                if left == 0: break
        print('after', pg.evaluate("JSON.stringify({k: __xq.game.at(4,5), r: __xq.game.at(4,4)})"))
        print('errs', errs[:5])
        b.close()
finally:
    http.kill()
