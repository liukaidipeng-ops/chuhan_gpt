# 仓库与发布规矩（象棋TD，正式版：Ham 10-17 审批台 td-006 通过）

> 依据：Ham 10-17 楚汉审批台 td-001、td-004、td-005 都选甲（只认方向）。本文取代 `TD-HANDOFF.md` 第 2、3 节里的老路线（chuhan_v01、`deploy.sh`）。

> **2026-10-19 起发布改走试玩码入口**（Ham 要求）：旧试玩站 chuhan_gpt_play、chuhan_v01 已下线，只放「已关闭」说明页，旧内容在各自的 `archive/pre-gate-20261019` 分支；`release.sh` 已停用。新入口 https://xiangqi-trial.liukaidip.workers.dev ，做法、管码、发布步骤见 `source/tools/gate/README.md`。下面第 2 节里 release.sh、chuhan_gpt_play 的部分作废，规矩不变：只 TD 发、只从 main 构建、Ham 在审批台批到「上线」再发。

## 1. 仓库（td-001）

| 仓库 | 用途 | 谁能推 |
|---|---|---|
| `chuhan_gpt` | **唯一的游戏源码**。`main` 是准 | `main` 只有 TD 推，只做快进，不强推；各部门推自己的分支 |
| `chuhan_gpt_play` | 试玩站（GitHub Pages，根目录 7 个产物） | 只有 TD，只用 `release.sh` |
| `chuhan_v01` | **冻结只读**。首页是跳转页（td-002），去试玩站 | 不再推；WORKFLOW 等协作文档暂留它的 `dev`，由流程部门维护 |
| `chuhan_ai_bench` | Balance、战术部门的 AI 实验和对打 | 各自分支，不进游戏 |

- 试玩站：https://liukaidipeng-ops.github.io/chuhan_gpt_play/
- 老网址 https://liukaidipeng-ops.github.io/chuhan_v01/ 自动跳过去（房间码等参数照带）。
- `chuhan_gpt` 根目录的 `index.html` 等是 10-12 的旧产物，不是线上，不用管。

## 2. 发布（td-004）

**规矩**
1. 只有象棋TD 发。别的部门（含 GPT 那边）交补丁或分支，TD 合进 `main` 再发。
2. 只从 `chuhan_gpt` 的 `main` 构建。**禁止直接改 `chuhan_gpt_play` 里的文件**（今天 4 次手补，造成源码和线上对不上）。
3. 每次上线前，在楚汉审批台批到「上线」，只发卡上写的候选和范围。
4. 推送不等于上线：Pages 部署成功、线上版本号对上，才写 `live` 回执。

**步骤**
```bash
# chuhan_gpt 干净地停在 origin/main；chuhan_gpt_play 另有一个克隆
bash source/tools/td/release.sh <chuhan_gpt_play 目录> "这次上线了什么"          # 先不推，看比对
bash source/tools/td/release.sh <chuhan_gpt_play 目录> "这次上线了什么" --push   # 确认后再推
```
脚本做的事：检查在 `main` 上、没有冲突标记 → 9 套快测 → 构建 → 和线上逐个文件比、`index.html` 去掉版本号后比 → 拷产物、提交「release: …（source 提交号）」→ 加 `--push` 才推。

**比对怎么看**：`index.html` 去掉版本号后不同的行，只有零星几行（注释、空行）就是线上和 `main` 一致；差很多说明线上被手补过，或者 `main` 有这次要上的新改动，要说得清是哪些。

**上线前另外跑**：`bfai`、`bfai.policy` 两套 AI 测试（几分钟）；动了画面的截手机 390×844、电脑 1280×720 各一张。

**核对**：
```bash
gh api 'repos/liukaidipeng-ops/chuhan_gpt_play/actions/runs?per_page=3' --jq '.workflow_runs[] | [.name,.head_sha[0:7],.status,.conclusion] | @tsv'
```
最新提交的 `pages build and deployment` 要是 `success`；会话里打不开 github.io 的，请 Ham 刷新看设置里的版本号。

**回滚**：在 `chuhan_gpt_play` 上 `git revert` 出问题的 release 提交，推上去再核对；不 reset、不强推。源码要不要跟着退另说。

## 3. 分支（td-005）

- `codex/*`、10-11 以前各部门的老分支：**只读存档，不整支合**。里面还要的东西，由对应部门（或 GPT 那边）基于现在的 `main` 重新交补丁或新分支。
- TD 的临时分支用 `td/*`，一件事一个，合进 `main` 后留着不删。
- 别的部门的分支合之前先看 `git diff --stat origin/main...<分支>`；电脑 AI 改动照 WORKFLOW 第 4 节门槛验收。

## 4. 版本号
`build.js` 生成「日期-摘要」，同时写进 `index.html` 的 `window.APP_VERSION` 和 `version.json`，两处必须一致，否则玩家会一直看到「有新版本」。
