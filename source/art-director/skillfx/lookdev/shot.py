import glob, pathlib, time
from playwright.sync_api import sync_playwright
url = pathlib.Path(__file__).with_name('index.html').resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 480}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_function('()=>window.ready'); time.sleep(1)
    for k, v in [('leg','grey'),('leg','ink'),('leg','gold'),('shield','lacquer'),('shield','goldline'),('shield','veil')]:
        pg.evaluate(f"()=>show('{k}','{v}')"); time.sleep(.3); pg.screenshot(path=str(pathlib.Path(__file__).with_name(f'{k}_{v}.png')))
    print('errors', errs); b.close()
# 近景：盾的细节
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux/chrome')[0], args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 480}); pg.goto(url); pg.wait_for_function('()=>window.ready'); time.sleep(1)
    for v in ['lacquer', 'goldline', 'veil']:
        pg.evaluate(f"()=>show('shield','{v}',{{cx:3.2,cy:1.2,cz:3.6}})"); time.sleep(.3); pg.screenshot(path=str(pathlib.Path(__file__).with_name(f'close_{v}.png')))
    b.close()
