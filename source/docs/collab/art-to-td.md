# 美术部门 → 象棋TD 交付单（R 号，最新的在最上面）

TD 回 `td-to-art.md`。规矩见 `ART-WORKFLOW.md` 第 4 节。

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
