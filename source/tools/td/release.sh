#!/usr/bin/env bash
# 发布到试玩站 chuhan_gpt_play（Ham 审批台 td-004：只 TD 发；只从 main 构建，禁止手补）
# 用法：bash source/tools/td/release.sh <chuhan_gpt_play 克隆目录> "这次上线了什么" [--push]
# 不带 --push 只做到本地提交，方便先看比对结果。
set -euo pipefail
# 2026-10-19 起停用（Ham：旧试玩站下线，改为试玩码访问）。不要再往 chuhan_gpt_play 推：新入口见 source/tools/gate/。
echo "release.sh 已停用：chuhan_gpt_play 已下线（Ham 10-19），新的试玩码入口还没上线。" >&2
exit 1
PLAY=${1:?要给 chuhan_gpt_play 克隆目录}
MSG=${2:?要写上线说明}
PUSH=${3:-}
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

# 1. 只从干净的 main 发
[ -z "$(git status --porcelain)" ] || { echo "工作区不干净，先提交或丢掉改动"; exit 1; }
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || { echo "HEAD 不是 origin/main，只能从 main 发"; exit 1; }
SRC=$(git rev-parse --short HEAD)
! grep -rn '^<<<<<<<' source/src source/build.js || { echo "有冲突标记"; exit 1; }

# 2. 测试 + 构建
cd source
[ -f node_modules/three/build/three.min.js ] || npm install --no-audit --no-fund
for t in rules engine jieqi bingfa beishui r6 game-issue-repo environment ending-shadow; do node test/$t.test.js | tail -1; done
node build.js
cd dist/site
VER=$(node -pe "require('./version.json').v")

# 3. 和线上上一版比对（手补过的线上会在这里露馅）
cd "$PLAY"
git fetch -q origin main && git checkout -q main && git reset -q --hard origin/main
OLD=$(node -pe "require('./version.json').v")
echo "线上 $OLD → 新 $VER（source $SRC）"
for f in index.html version.json voice-real.bin voice-bf.bin voice-orig.bin sfx.bin music-war.mp3; do
  if cmp -s "$ROOT/source/dist/site/$f" "$f"; then echo "  $f 不变"; else echo "  $f 变了"; fi
done
# 去掉版本号再比 index.html：只差版本号说明线上和 main 一致；差得多说明线上被手补过，或 main 有新改动
norm() { sed 's/[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}-[0-9a-f]\{6\}/VER/g' "$1" | fold -w200; }
echo "  index.html 去掉版本号后不同的行：$(diff <(norm "$ROOT/source/dist/site/index.html") <(norm index.html) | grep '^[<>]' | grep -vc 'LD(0\.')（加载进度数不算）"
grep -q "$VER" "$ROOT/source/dist/site/index.html" || { echo "index.html 里没有版本号 $VER"; exit 1; }

# 4. 拷产物、提交
for f in index.html version.json voice-real.bin voice-bf.bin voice-orig.bin sfx.bin music-war.mp3; do cp "$ROOT/source/dist/site/$f" .; done
# G2：技能模式将帅按需读取的静态贴图，必须与对应 HTML 一起发布。
mkdir -p king-stone-r4
cp "$ROOT/source/dist/site/king-stone-r4/"*.png king-stone-r4/
git add -A
git commit -q -m "release: $MSG (source $SRC)"
git log --oneline -1

# 5. 推送并核对（上线前要 Ham 在审批台批到「上线」）
if [ "$PUSH" = "--push" ]; then
  git push origin main
  echo "已推。一两分钟后核对：gh api repos/liukaidipeng-ops/chuhan_gpt_play/pages/builds/latest --jq .status"
  echo "线上 version.json 要是 $VER"
else
  echo "没推（加 --push 才推）"
fi
