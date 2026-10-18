# 美术部门 → 象棋TD 交付单（R 号，最新的在最上面）

TD 回 `td-to-art.md`。规矩见 `ART-WORKFLOW.md` 第 4 节。

## R2 · 2026-10-18 · 棋子头上的攻击字牌、技能牌和冷却（审批台 art-007 第 5 版，Ham 批到「整合」）

- **批到哪一步**：「整合」——可以合进 `main` 做整合测试，**还不能上线**；上线前我再挂审批台送审（Ham 12:18 批语：「通过，然后在设置里加一个选项，可以设置显示或关闭。」）。
- **补丁分支**：`art/badges`，提交 b93c7bf，基于 `main` 65ba52d。
- **改了什么**
  - 新文件 `src/badges.js`：11 个技能图标、攻击字牌、拒马激活牌（SVG，由 `art-wip/skill-icons/gen_badges.py` 从 `icons.py` 生成，别手改）；冷却中整块半透明、走完的部分从十二点顺时针变实，不写数字。
  - `board.js`：`decorate` 里挂牌（只在技能模式、二级以上、非帅将）。攻 2 挂横长字牌；技能按 `BF.levelInfo(...).skills` 挂正方形牌；`game.jmActive(p)` 时只挂一块大的反色激活牌。冷却比例 = 1 − `game.cdLeft(p, sk)` / 配置冷却（你 10-18 定的规则）。牌子每帧按 `Board.viewSide` 摆正朝屏幕上方，删掉的牌在同一个循环里释放材质。新增 `Board.setBadges(on)`。
  - `main.js`：`S.badges`（默认 1，存 `xq3d-badges`），`applySettings` 里调 `Board.setBadges`。
  - `template.html`：设置里「棋子显示」下面加一行「棋子头上的牌 · 显示 / 关闭」。
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
