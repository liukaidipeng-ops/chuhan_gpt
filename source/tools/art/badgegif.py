"""技能牌转镜头动图（美术部门 art-007，Ham 10-21）：python3 tools/art/badgegif.py <输出.gif> [宽,高]
技能模式本地局摆中盘（同 badgeshot.py），镜头绕棋盘转一圈，逐帧截图拼 GIF，看牌子是不是一直在棋子屏幕正上方、不打转。"""
import sys, os, pathlib, time, io, math
from playwright.sync_api import sync_playwright
from PIL import Image
SRC = os.path.dirname(os.path.abspath(__file__)) + "/../.."
OUT = sys.argv[1]
W, H = map(int, (sys.argv[2] if len(sys.argv) > 2 else "1000,573").split(','))
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri() + '#bf'
SETUP = """()=>{const X=window.__xq,g=X.game;g.setup(T=>{const B=T.board;
 const lv=(f,r,l,hp)=>{const p=B[r][f];if(!p)return;p.lv=l;p.hp=hp==null?X.BF.hpOf(p.t,l):hp;};
 const mv=(f,r,F,R)=>{B[R][F]=B[r][f];B[r][f]=null;};
 mv(0,0,0,3);mv(1,2,4,4);mv(1,0,2,2);mv(0,9,0,6);mv(7,9,6,7);mv(1,7,1,4);mv(2,9,4,7);
 lv(0,3,4);lv(4,4,3);lv(5,0,2);lv(2,2,2,1);lv(6,3,3);lv(0,6,2);lv(6,7,3,2);lv(4,7,4);lv(1,4,3,2);lv(4,6,3);lv(8,3,2);lv(8,6,2);lv(3,0,3);lv(7,2,3);
 for(const row of B)for(const q of row)if(q&&q.t==='p'&&q.s==='r'){if(q.lv===3)q.jm=T.cnt.b+2;if(q.lv===2)q.cd=T.cnt.r+3;}
 });X.Board.syncPosition(g);}"""
N = 30
CROP = (170, 70, 830, 520)   # 只留棋盘一块，GIF 小一点
with sync_playwright() as p:
  br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  pg = br.new_context(viewport={'width': W, 'height': H}).new_page(); pg.goto(url); time.sleep(6)
  pg.evaluate(SETUP); time.sleep(8)
  pg.add_style_tag(content='.toast,#toast,.tip{display:none!important}')
  pg.evaluate("()=>{for(const e of document.querySelectorAll('body *'))if(e.children.length<3&&/硬件加速/.test(e.textContent))e.style.display='none'}")
  print(pg.evaluate("()=>window.APP_VERSION"))
  th0 = pg.evaluate("()=>window.__xq.Core.Cam.theta")
  frames = []
  for i in range(N):
    pg.evaluate(f"()=>{{const C=window.__xq.Core.Cam;C.theta={th0}+{2*math.pi*i/N};C.upTh=C.theta;}}"); time.sleep(0.9)
    frames.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB').crop(CROP).quantize(96))
  br.close()
frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=160, loop=0, optimize=True)
