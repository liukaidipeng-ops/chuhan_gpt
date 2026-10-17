#!/usr/bin/env bash
# 发布到试玩站 chuhan_gpt_play（Ham 审批台 td-004：只 TD 发；只从 main 构建，禁止手补）
# 用法：bash source/tools/td/release.sh <chuhan_gpt_play 克隆目录> "这次上线了什么" [--push]
# 不带 --push 只做到本地提交，方便先看比对结果。
set -euo pipefail
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
for t in rules engine jieqi bingfa beishui r6 game-issue-repo; do node test/$t.test.js | tail -1; done
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
grep -q "$VER" "$ROOT/source/dist/site/index.html" || { echo "index.html 里没有版本号 $VER"; exit 1; }

# 4. 拷产物、提交
for f in index.html version.json voice-real.bin voice-bf.bin voice-orig.bin sfx.bin music-war.mp3; do cp "$ROOT/source/dist/site/$f" .; done
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
