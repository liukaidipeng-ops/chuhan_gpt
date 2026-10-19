# 象棋TD → GPT

> 本文件只由象棋TD 写，GPT 读。新的写在最上面。

## T3 · 2026-10-19 · 旧试玩站下线，暂停发布

Ham 10-19：旧试玩站 chuhan_gpt_play 下线，改成凭试玩码进入的新入口。chuhan_gpt_play 和 chuhan_v01 现在只放「已关闭」说明页，旧内容在各自的 `archive/pre-gate-20261019` 分支。
- **请不要再往 chuhan_gpt_play 或 chuhan_v01 推任何东西**（含你们之前用过的发布流程和 Actions）。
- 新入口上线前不发布；你的改动照旧交分支 + G 号说明，我合进 main，等新入口好了再发。
- 新入口的做法在 `source/tools/gate/README.md`。

## T2 · 2026-10-18 · G2 将帅石材已上线

- 依据：Ham 在象棋TD 会话里说「gpt提交了棋子设计，你看一下，需要发布线上」。
- 已合：`gpt/king-stone-r4-handoff-20261018`（89309c8 + 69f57d5）快进进 `main`，TD 加一行 NEWS → `main` 9cd4e0e。
- 测试 10 套全过（含 king-stone）；构建出 12 张贴图，release.sh 已带上 `king-stone-r4/`（你对 release.sh 的改动保留）。
- 上线：试玩站提交 ad6cd49，版本 2026.10.18-3145e0，Pages 部署 2026-10-18T05:47:44Z success。

## T1 · 2026-10-17 · 收到 G1；以后的发布路线

- **G1（软阴影 1.15 + 昼夜修复）收到**。线上 2026.10.17-b789d2 的 Pages 部署记录是 success。
- **画面改动已收回源码**：`claude/visual-atmosphere`（薄雾、地面、移轴、清晰带跟随棋盘）已合进 `main`，还补上了只改在试玩站里的「移轴虚化」设置行（template.html）。`main` 1cb7c65 构建出来和 b789d2 去掉版本号后只差一行注释和几处空行，测试 11 套全过。**现在从 `main` 构建不会再冲掉线上的东西。**
- **以后的路线**（Ham 审批台 td-001、004、006，正文见 `TD-RELEASE.md`）：
  1. 游戏源码只认 `chuhan_gpt` 的 `main`，`main` 只有象棋TD 推。
  2. 试玩站 `chuhan_gpt_play` 只由象棋TD 用 `source/tools/td/release.sh` 从 `main` 构建发布，**不再直接改试玩站文件**。
  3. GPT 有改动：推自己的分支（如 `codex/<事>`），在 `gpt-to-claude-td.md` 写一条 G 号说明（改了什么、测了什么、Ham 在哪批的）。TD 合进 `main`，等 Ham 在审批台批到「上线」后发布。
  4. 老的 `codex/*` 分支只读存档，不整支合；还要的东西基于现在的 `main` 重新交。
