"""攻击力显示原型截图（美术部门 art-006）：python3 tools/art/atkshot.py <输出目录> [视口 m,land,pc] [方案 0,1,2,3,4]
用 art/atk-proto 分支构建；技能模式本地局（#bf），摆一个中盘局面，window.ATKV = 0 现状 / 1～4 四个方案。"""
import sys, os, pathlib, time
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.abspath(__file__)) + "/../.."
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
url = pathlib.Path(SRC + '/dist/site/index.html').resolve().as_uri() + '#bf'
BADGES = SRC + '/art-wip/skill-icons/out/badges.js'   # art-007 的单张牌（claude/art 分支）
VP = {'m': (390, 844, 2), 'land': (844, 390, 2), 'pc': (1280, 720, 1)}
ONLYV = sys.argv[2].split(',') if len(sys.argv) > 2 else list(VP)
ONLYA = sys.argv[3].split(",") if len(sys.argv) > 3 else ["0", "1", "2", "3", "4"]   # 「11:2」= ATKV 11、JMV 2
SETUP = """()=>{const X=window.__xq,g=X.game;g.setup(T=>{const B=T.board;
 const lv=(f,r,l,hp)=>{const p=B[r][f];if(!p)return 'x';p.lv=l;p.hp=hp==null?X.BF.hpOf(p.t,l):hp;};
 const mv=(f,r,F,R)=>{B[R][F]=B[r][f];B[r][f]=null;};
 mv(0,0,0,3);mv(1,2,4,4);mv(1,0,2,2);
 mv(0,9,0,6);mv(7,9,6,7);mv(1,7,1,4);mv(2,9,4,7);
 lv(0,3,4);lv(4,4,3);lv(5,0,2);lv(2,2,2,1);lv(6,3,3);
 lv(0,6,2);lv(6,7,3,2);lv(4,7,4);lv(1,4,3,2);lv(4,6,3);lv(8,3,2);lv(8,6,2);lv(3,0,3);lv(7,2,3);for(const row of B)for(const q of row)if(q&&q.t==="p"&&q.s==="r"&&q.lv===3)q.jm=T.cnt.b+2;
 });X.Board.syncPosition(g);return g.S?1:0}"""
with sync_playwright() as p:
  br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  for vk in ONLYV:
    w, h, dpr = VP[vk]
    for v in ONLYA:
      ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
      a, _, j = v.partition(':'); jade = a.endswith('y'); a = a.rstrip('y')
      ctx.add_init_script(f"window.ATKV={a};window.JMV={j or 0};window.JADESPK={1 if jade else 0}")
      if os.path.exists(BADGES): ctx.add_init_script(open(BADGES).read())
      pg = ctx.new_page(); pg.goto(url); time.sleep(6)
      pg.evaluate(SETUP); time.sleep(11)
      pg.screenshot(path=f'{OUT}/v{v.replace(":", "j")}_{vk}.png')
      if v == '0': print(vk, pg.evaluate("()=>window.APP_VERSION"))
      ctx.close()
  br.close()
