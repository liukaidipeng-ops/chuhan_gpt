"""技能牌正式补丁截图（美术部门 art-007）：python3 tools/art/badgeshot.py <输出目录> [视口 m,land,pc] [off]
技能模式本地局（#bf）摆中盘：汉三级兵拒马激活、汉二级兵拒马冷却 3/4 回合、各兵种二到四级；带 off 时先把设置里的牌关掉。"""
import sys, os, pathlib, time
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__)) + "/../.."
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri() + '#bf'
VP = {'m': (390, 844, 2), 'land': (844, 390, 2), 'pc': (1280, 720, 1)}
ONLYV = sys.argv[2].split(',') if len(sys.argv) > 2 else list(VP)
OFF = len(sys.argv) > 3 and sys.argv[3] == 'off'
SETUP = """()=>{const X=window.__xq,g=X.game;g.setup(T=>{const B=T.board;
 const lv=(f,r,l,hp)=>{const p=B[r][f];if(!p)return;p.lv=l;p.hp=hp==null?X.BF.hpOf(p.t,l):hp;};
 const mv=(f,r,F,R)=>{B[R][F]=B[r][f];B[r][f]=null;};
 mv(0,0,0,3);mv(1,2,4,4);mv(1,0,2,2);mv(0,9,0,6);mv(7,9,6,7);mv(1,7,1,4);mv(2,9,4,7);
 lv(0,3,4);lv(4,4,3);lv(5,0,2);lv(2,2,2,1);lv(6,3,3);lv(0,6,2);lv(6,7,3,2);lv(4,7,4);lv(1,4,3,2);lv(4,6,3);lv(8,3,2);lv(8,6,2);lv(3,0,3);lv(7,2,3);
 for(const row of B)for(const q of row)if(q&&q.t==='p'&&q.s==='r'){if(q.lv===3)q.jm=T.cnt.b+2;if(q.lv===2)q.cd=T.cnt.r+3;}
 });X.Board.syncPosition(g);}"""
with sync_playwright() as p:
  br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  for vk in ONLYV:
    w, h, dpr = VP[vk]
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    if OFF: ctx.add_init_script("try{localStorage.setItem('xq3d-badges','0')}catch(e){}")
    pg = ctx.new_page(); pg.goto(url); time.sleep(6)
    pg.evaluate(SETUP); time.sleep(11)
    pg.screenshot(path=f'{OUT}/{"off" if OFF else "on"}_{vk}.png')
    print(vk, pg.evaluate("()=>window.APP_VERSION"))
    ctx.close()
  br.close()
