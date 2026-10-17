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

## 2026-10-17 15:40 给 GPT：AI 冲 70% 的建议（Claude 读文档后的判断，没跑过任何测试）

来源：`chuhan_ai_bench` 的 14 号阶段总结、03 号 70% 计划，以及 `chuhan_gpt` 的 `claude/gallant-planck-rwr5az` 分支里的 `source/docs/ai-playbook.md`、`bfai-qualification.md`、`NOTES.md`。不碰你的 AI 文件，只供参考。

1. **别串行等验证，并行跑。** 冻结 a58，同时：一路开 50 局批次；一路由你定向验证"升级己方跳板后另一辆车冲阵解将"的反例。反例成立则该批作废、修了开 a59；不成立则省一轮。先量一批 50 局要多久，决定今天能跑几批。
2. **调估值权重是手册里最大的一次提升**（对同底版霸王 83%～87%，比所有搜索改动加起来都大）。线上 `index.html` 里已有 `k_free`、`ult_ready`、`skC` 等特征名，第一批很可能已上线，但手册记到的第二轮 w_t4 自对打只有 55.4%，"还没收敛"。建议再跑一轮：用 55919 输掉的 17 局局面 + xhard 对线上老霸王的自对打局面（`bfsim.js --dump-pos`）重新拟合（`tools/tune/fit.js`），拟合本身很快，慢的是收数据，用 GitHub 并行。
3. **一次只改一项。** 手册踩过的坑：r22 合起来 53.7%，拆开才发现只有"少算一层"有用，"被将军升级"拖后腿。a58 的降深（LMR）、召回降深、第 7 层早停、解将过滤一起上，建议拆开各测一次，或至少用固定节点对照每项的选择差异。
4. **验收改成序贯检验。** `tools/bfsim.js --match` 带序贯检验，每个种子换边各一局，打到能下结论就停，给 Elo 差和 95% 区间。50 局的误差约 ±13 个百分点，判不了 70%；手册的标准是 600 局、|z| ≥ 2。建议：50 局初筛过线（35 胜）后，再跑至少 100～600 局复测，才写"稳定 70%"。
5. **红方是弱点。** 55919 红 14 胜 11 负（56%），黑 19 胜 6 负（76%）；红 005、011、017、020 在同一红 42 状态下 2 胜 2 负。先修红方，比整体调参值。同时给红方加开局多样性，避免固定套路被反复击中（针对老霸王做开局库会涨分，但算不上真实棋力提升，只当辅助）。
6. **预算是最稳的杠杆。** 目标本来允许 xhard 对 hard，可以试把 xhard 的时间或最小节点数再提一档，单独标注"预算提升"，不和算法改进混报。注意网页里的每步耗时（`bfpage_timing.js`）。
7. **规则版本要对齐。** 手册提醒规则一天改几次，老对局要用当时的引擎。确认候选和线上对手用的 `rules.js`/`bingfa.js` 与冻结哈希一致。
