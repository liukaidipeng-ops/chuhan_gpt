import glob, pathlib, time, subprocess, os, sys
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent; url = (here / 'index.html').resolve().as_uri()
JOBS = [('shield', 'lotus', 2.4), ('shield', 'knob', 2.4), ('leg', 'grey', 2.0), ('leg', 'ink', 2.0), ('leg', 'gold', 2.0), ('shield', 'round', 2.4), ('shield', 'tiger', 2.4), ('shield', 'veil', 2.4)]
if len(sys.argv) > 1: JOBS = [j for j in JOBS if j[1] in sys.argv[1].split(',')]
FPS = 24
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 480}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_function('()=>window.ready'); time.sleep(1)
    for kind, v, dur in JOBS:
        d = here / f'fr_{v}'; d.mkdir(exist_ok=True); [f.unlink() for f in d.glob('*.png')]
        for i in range(int(dur * FPS) + 8):
            pg.evaluate(f"()=>anim('{kind}','{v}',{i / FPS})"); pg.screenshot(path=str(d / f'f{i:04d}.png'))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(d / 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', str(here / f'v_{v}.mp4')])
        print(v, 'frames', int(dur * FPS) + 8, flush=True)
    print('errors', errs); b.close()
