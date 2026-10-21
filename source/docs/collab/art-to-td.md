# 美术部门 → 象棋TD 交付单（R 号，最新的在最上面）

TD 回 `td-to-art.md`。规矩见 `ART-WORKFLOW.md` 第 4 节。

## R5 · 2026-10-21 · 兵种模型显示时技能牌挂在头顶（审批台 art-007 第 9 版，Ham 批到「上线」）

- Ham 原话：「模型显示下，这些字牌的技能buff需要在头顶。」
- **补丁分支**：`art/badges-model`，提交 b3a3e8d，基于 `main` 0066641。`squads.js` 的 `Stand` 加 `top(m)`：一队站定（k≥0.99）后量一次「整队 + guard + 背旗 / 自带旗」的包围盒，记相对 `sq.group.position.y` 的高度；没站定、结算让位时返回 null。`board.js` 的 `placeBadges` 有这个高度就挂在它上方 0.05，没有就照旧挂棋面上沿。
- **验**：9 套快测全过；兵种模型下改前 / 改后截图（低角度、默认角度），浏览器模拟。
- **没验**：真机；手机竖屏；走子和演出中牌子从棋面升到头顶的过渡。
- **需要 TD 做的**：合 main 发布，上线后告诉我版本号。

## R4 · 2026-10-21 · 技能牌永远在棋子屏幕正上方、不打转（审批台 art-007 第 8 版，Ham 批到「上线」）

- Ham 原话：「需要让图标永远在上方，攻击力和技能图标也不要自旋转。改完做个gif给我看」。
- **补丁分支**：`art/badges-up`，提交 642dd55，基于 `main` 7b9dff5，只改 `board.js` 摆牌部分：去掉按 viewSide 纠正朝向的 onFrame；每块牌的 sprite 在 `onBeforeRender` 里按当前镜头摆整组——位置在棋面顶上、沿「屏幕上方投到棋盘上的方向」0.47 处，组朝向 = 镜头朝向（所以一排牌横着、正对屏幕）。onFrame 只留释放材质。
- **验**：9 套快测全过；转镜头一圈动图 `docs/collab/art-shots/art-007/up/after.gif`（改前 `before.gif`），浏览器模拟。
- **没验**：真机；手机竖屏；后处理开着时（Core.post）是否同一相机。
- **需要 TD 做的**：合 main 发布，上线后告诉我版本号。

## R3 · 2026-10-18 · 拒马激活牌改成显示「还剩多久」（Ham 聊天原话，审批台 art-007 第 7 版待批「上线」）

- Ham 原话：「拒马激活时的图标逻辑不对，应该上来就是100%全实透明度，慢慢再变半透明」。
- **补丁分支**：`art/badges-jm`，提交 5381515，基于 `main` dda115e，只改 `board.js` 3 行：激活牌的比例从「拒马冷却走了多少」改成「拒马还剩多少」=（p.jm − 对方 cnt）/ `skills.juma.duration`，刚架起 = 1 全实。
- **验**：9 套快测全过；实机截图 `docs/collab/art-shots/art-007/jm/on2_*.png`（刚架起）、`on1_*.png`（还剩 1 回合）。
- **没验**：真机。
- **需要 TD 做的**：等 Ham 在审批台批到「上线」后合 main 发布。
- **已上线**：2026.10.19-3e0b09（main ab4ccd8，10-19 00:52 UTC）。

## R2 · 2026-10-18 · 棋子头上的攻击字牌、技能牌和冷却（审批台 art-007 第 5 版，Ham 批到「整合」）

- **批到哪一步**：「整合」——可以合进 `main` 做整合测试，**还不能上线**；上线前我再挂审批台送审（Ham 12:18 批语：「通过，然后在设置里加一个选项，可以设置显示或关闭。」）。
- **补丁分支**：`art/badges`，提交 b93c7bf + 9bbce64（设置那一行改名「技能牌」，说明排到同一行），基于 `main` 65ba52d。
- **改了什么**
  - 新文件 `src/badges.js`：11 个技能图标、攻击字牌、拒马激活牌（SVG，由 `art-wip/skill-icons/gen_badges.py` 从 `icons.py` 生成，别手改）；冷却中整块半透明、走完的部分从十二点顺时针变实，不写数字。
  - `board.js`：`decorate` 里挂牌（只在技能模式、二级以上、非帅将）。攻 2 挂横长字牌；技能按 `BF.levelInfo(...).skills` 挂正方形牌；`game.jmActive(p)` 时只挂一块大的反色激活牌。冷却比例 = 1 − `game.cdLeft(p, sk)` / 配置冷却（你 10-18 定的规则）。牌子每帧按 `Board.viewSide` 摆正朝屏幕上方，删掉的牌在同一个循环里释放材质。新增 `Board.setBadges(on)`。
  - `main.js`：`S.badges`（默认 1，存 `xq3d-badges`），`applySettings` 里调 `Board.setBadges`。
  - `template.html`：设置里「棋子显示」下面加一行「技能牌 · 显示 / 关闭」（截图 `settings_m.png`、`settings_pc.png`）。
  - `build.js`：`badges` 排在 `board` 前。
- **验**：9 套快测全过；构建正常；实机截图（Chromium，真实对局数据：汉三级兵拒马激活、汉二级兵拒马冷却 3 回合）`docs/collab/art-shots/art-007/patch/on_m.png`（390×844）、`on_pc.png`（1280×720）、`on_land.png`（844×390），关掉以后 `off_m.png`。
- **没验**：真机；执黑视角和转镜头时牌子摆正（代码按 viewSide 处理，没截图）；兵种模型显示时牌子要不要藏（现在照挂）；联机对手那边看到的冷却。
- **需要 TD 做的**：合进 `main` 做整合测试；上线等我再送审。你查的冷却跳变如果改了 `cdLeft`，牌子自动跟着变。

## R1 · 2026-10-18 · 召回良将弹窗：二级按钮看不清（审批台 art-005，Ham 选乙、批到「上线」）

- 补丁分支：`art/revive-lv2`，提交 5c23d16，基于 `main` ca2b49c，只改 `source/src/main.js` 一行（`reviveFlow` 里的 `silver`）：浅银底不变，加 `color:#141311;text-shadow:none;`，字从白改墨。
- 范围（卡上写的）：只改二级按钮配色；一级按钮、取消、「原位被占」按钮、弹窗布局都不动。
- 验：9 套快测（rules、engine、jieqi、bingfa、beishui、r6、game-issue-repo、environment、ending-shadow）全过；构建正常。截图 `docs/collab/art-shots/art-005/b_m.png`（390×844）、`b_pc.png`（1280×720）、`b_land.png`（844×390）。
- 没验：真机；截图是在真游戏页面里按 `pick()` 原样标记填出的弹窗，没打到真的召回局面。
- 需要 TD 做的：合进 `main`，按 TD-RELEASE 发布。上线后请告诉我版本号，我写 `live` 回执。

## R0 · 2026-10-17 · 分工草案请 TD 过目（不是交付）

草案在 `ART-WORKFLOW.md`。请 TD 看第 2 节文件分工：
1. 游戏代码（`source/src/` 全部、`build.js`、`template.html`）全归 TD，美术只交补丁。
2. 美术自己管：`ART-WORKFLOW.md`、`decisions-美术部门.md`、`art-to-td.md`、`art-shots/`、`docs/UI-DESIGN.md`、`docs/UNIT-LOOKS.md`、`source/art-wip/`、`source/tools/art/`（新开），都不进构建。
3. 交付单 R 号；TD 回 `td-to-art.md`（TD 的文件）。

同意或要改，请回 `td-to-art.md` 或直接 send_message。TD 同意后我才把分工挂审批台给 Ham。
