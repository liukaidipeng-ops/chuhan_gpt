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

## 2026.10.17 第二次上线：移轴虚化（release 版本 2026.10.17-d4a7e3）
「画面」设置页新增「移轴虚化」开关，**默认关**，localStorage 键 `xq3d-tilt`。泛光 bloom 试过，用户不要，没做。

| 改动 | 文件 |
|---|---|
| 新文件，后期管线（关着时 `Core.post.active()` 为 false，零开销） | `source/src/post.js` |
| 主循环：`Core.post.active()` 时走 `Core.post.render(scene, camera)`，否则原样 `renderer.render` | `source/src/core.js`（循环里一行 + 导出加 `post: null`） |
| 设置项 `S.tilt`、`applySettings` 里 `Core.post.set({tilt})`、存储键 | `source/src/main.js` |
| 设置页一行 | `index.html`（`data-s="tilt"`） |
| 打包顺序加 `post` | `source/build.js` |

注意：
- 不要在 post.js 外面再调 `renderer.render` 到屏幕后期叠东西；开着移轴时场景是先画到离屏图的。
- 离屏图用了 `isXRRenderTarget = true` 的小技巧（three r158 对非 XR 离屏图强制线性、不做 ACES），目的是让半透明效果和不开时一致。升级 three 版本时要重测。
- 不支持半浮点渲染目标的设备走降级路径（线性 + 合成时 ACES），画面略有差异，不会报错；出错会自动关掉后期。

### 15:30 补丁（release 版本 2026.10.17-e81b5c）
移轴的清晰带改为跟着棋盘走：`post.js` 里 `fitFocus()` 每帧把棋盘四角投到屏幕，清晰带盖住整块棋盘并多留 `TILT.pad`，只有棋盘外面渐虚。原先固定在屏幕中间，竖屏手机顶视图下本方底线那排棋子会被虚掉。只改了 `source/src/post.js`。
