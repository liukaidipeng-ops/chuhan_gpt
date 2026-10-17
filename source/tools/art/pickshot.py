"""召回良将弹窗截图（美术部门 art-005）：python3 tools/art/pickshot.py <输出目录>
开一局人机，按 main.js reviveFlow / pick() 的原样标记填 #mPick，三种二级样式 × 三种屏幕各拍一张。"""
import sys, os, pathlib, time
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__)) + "/../.."
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri()
VP = {'m': (390, 844, 2), 'land': (844, 390, 2), 'pc': (1280, 720, 1)}
SM = '<small style="display:block;font-size:calc(12px * var(--fs,1));line-height:1.4;opacity:.85">{}</small>'
STY = {
  'before': 'background:linear-gradient(160deg,#fbfcfd,#cfd6df 55%,#eef1f5);border-color:#8a94a3;box-shadow:inset 0 0 0 1px #fff8;',
  'a': 'background:#45484d;border-color:#c3c9d1;color:#f0e7d2;box-shadow:inset 0 0 0 1px #45484d,inset 0 0 0 2px #8d949e;',
  'b': 'background:linear-gradient(160deg,#fbfcfd,#cfd6df 55%,#eef1f5);border-color:#8a94a3;box-shadow:inset 0 0 0 1px #fff8;color:#141311;text-shadow:none;',
}
def items(sty):
  b = lambda n, lv, s='': f'<button class="btn small r" style="width:74px;max-width:260px;padding-left:4px;padding-right:4px;{s}">{n}{SM.format(lv)}</button>'
  return b('俥', '一级') + b('炮', '二级', sty) + b('傌', '一级')
with sync_playwright() as p:
  br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  for vk, (w, h, dpr) in VP.items():
    pg = br.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    pg.goto(url + '#local'); time.sleep(3)
    pg.evaluate("()=>{document.getElementById('bAI').click()}"); time.sleep(1)
    pg.evaluate("()=>{const b=document.getElementById('bAIGo'); b&&b.click()}"); time.sleep(5)
    pg.evaluate("()=>{const s=document.getElementById('skip'); s&&!s.classList.contains('hidden')&&s.click()}"); time.sleep(12)   # 开场跳过；等「没用显卡」提示（9 秒）消失
    for k, s in STY.items():
      pg.evaluate("""([html])=>{document.getElementById('pickT').textContent='召 回 良 将';
        document.getElementById('pickP').textContent='复活一枚被吃的子，放回原位（最多二级）。';
        document.getElementById('pickList').innerHTML=html;document.getElementById('mPick').classList.remove('hidden')}""", [items(s)])
      time.sleep(0.6)
      pg.screenshot(path=f'{OUT}/{k}_{vk}.png')
    print(vk, pg.evaluate("()=>window.APP_VERSION"))
    pg.close()
  br.close()
