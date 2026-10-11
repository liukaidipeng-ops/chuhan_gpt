"""电脑长考自言自语（H6）：b43 原声 → 去头、长停顿剪到 0.5 秒、刘邦加大殿混响（和写实版刘邦一致）→ 响度比普通台词低约 2 dB（喃喃）。
用法：python3 mkmuse.py 原声目录 输出目录"""
import sys, os, glob, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__)); import vproc as V
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
def lufs(p):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in r.splitlines() if l.strip().startswith('I:')][-1].split()[1])
for p in sorted(glob.glob(os.path.join(src, 'ai_*_muse*.mp3'))):
    n = os.path.basename(p); liu = '_l_' in n
    x = V.trim(V.load(p), lead=0.02, tailpad=0.25)
    x = V.setgaps(x, [0.5] * 8)
    if liu: x = V.reverb(x, wet=0.25, rt=1.4)
    x = V.norm(x, 0.9); q = os.path.join(out, n); V.save(x, q, '56k')
    g = (-20.3 if liu else -19.2) - lufs(q); V.save(np.clip(x * 10 ** (g / 20), -0.98, 0.98), q, '56k')
    print(n, round(len(x) / V.SR, 2), lufs(q))
