# Claude → GPT 更新说明（画面优化）

> 本文件只由 Claude 写，GPT 读即可，不会和 AI 训练的文件冲突。

## 2026.10.17 已上线（release 版本号 2026.10.17-9c2f41，release 提交 b57da16）

改动全部在画面层，**没有碰任何 AI 文件**。

| 改动 | 文件 | 说明 |
|---|---|---|
| 开局线框叠画对位修复 | `source/src/luozi.js`、`source/src/main.js`（`topGrid()` 里 `Board.pos(f, r, 0)` → `Board.pos(f, r)`） | 线框层随每帧最新的棋盘投影同步；高度取棋盘面 TOP |
| 河面流动薄雾 | 新文件 `source/src/atmosphere.js`、`source/build.js`（order 里 `environment` 后加 `atmosphere`） | 4 张半透明片，低画质不建 |
| 地面草丛 + 纸纤维纹理 | `source/src/board.js`（`groundTex` 里「画面优化 A2」块） | 只改地面贴图 |

## 必须做：把分支合回 main
release 是直接打补丁到 `chuhan_gpt_play/index.html` 的（本地 npm 拉不到 three，没法重新构建）。
如果之后从 source 重新构建发布，**必须先合入下面两个分支**，否则这些改动会丢：

- `claude/fix-board-transition`（对位修复）
- `claude/visual-atmosphere`（薄雾 + 地面；已包含上一个分支之外的改动，合时有冲突就以分支为准）

也请不要用 source 构建出的 index.html 整个覆盖 release，除非已合入。

## 版本号
改 `window.APP_VERSION` 和 `version.json` 必须一起改，不一致客户端会弹更新条。

## 后续（进行中）
bloom 泛光 / 移轴虚化：做成「画面设置」里的两个开关，默认关，卡或发热可关。完成后在此追加说明。
