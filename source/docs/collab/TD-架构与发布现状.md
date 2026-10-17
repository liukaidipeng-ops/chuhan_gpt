# 架构与发布现状 + 整理方案（象棋TD，2026-10-17）

> 只摸底、出方案，没动线上、没推任何分支。要 Ham 定的挂在楚汉审批台 td-001～td-005。

## 一、核实结果

| 流程部门的说法 | 核实 | 证据 |
|---|---|---|
| 源码在 chuhan_gpt，试玩站发 chuhan_gpt_play，最新 2026.10.17-e81b5c | **对** | play `main` ff60146 `version.json` = e81b5c；play 只有 7 个产物、没有源码 |
| chuhan_v01 线上停在 10-11 | **对**（仓库层面） | v01 `main` 最后一次部署 11738bf「2026.10.11-e897b3」；chuhan_gpt 就是从这个提交分出来的，之后又加了 24 个提交。线上 github.io 本会话访问不到，没实测 |
| 今天 3 次 release 是直接补 play/index.html | **对** | play b57da16、afe6cb5、ff60146，作者 Claude，提交说明写了 source 提交号 |
| 改动在 claude/fix-board-transition、claude/visual-atmosphere，没合回 main | **一半对** | 开局线框修复**已经进 main**（b34098e「sync: preserve deployed opening alignment」）；**薄雾、地面、移轴三项没进 main**，只在 visual-atmosphere（和 Balance 的分支 x9kpy8） |
| 本地 npm 拉不到 three | **我这边能拉到** | 本会话 `npm install` 成功装上 three@0.158.0；那边拉不到应是那个会话的网络设置，不是仓库问题 |
| WORKFLOW 分在两个仓库 | **对** | 10-17 版在 v01 `dev`；chuhan_gpt 上没有新版 |
| chuhan_gpt 有不少 codex/* 分支 | **对**，见第三节 | |

## 二、能不能从源码重新构建（关键）

1. **chuhan_gpt `main` 构建 = 10-16 线上**：本会话 `node build.js` 出的 7 个文件，除版本号外和 play 334ac40（10-16 release）**逐字节一致**。说明 main 是 10-16 那版的准源码。
2. **main + visual-atmosphere 合起来构建 ≈ 今天线上**，但差一处：
   - `source/build.js` 合并有冲突（加载顺序那一行，两边各加了文件，留两边即可，好解）；
   - **「移轴虚化」开关那一行只改在了 play 的 index.html，没写进源码 `source/src/template.html`**。照现在的源码重建，设置页会少这个开关（功能还在、默认关，但玩家没法打开）；
   - 其余只差 `main.js` 一行注释和加载进度条数字。
3. 结论：**现在从 main 直接重建发布，会冲掉今天 3 项画面改动**；先合 visual-atmosphere 并补 template.html 这一行，就能完整复现今天的线上。

## 三、没合进 chuhan_gpt main 的分支（会不会丢）

| 分支 | 最后更新 | 游戏代码 | 说明 |
|---|---|---|---|
| claude/visual-atmosphere | 10-17 | 有（薄雾、地面、移轴） | **今天线上就有，必须合**，见 td-003 |
| claude/fix-board-transition | 10-16 | 已在 main | 可以不管 |
| claude/chuhan-xiangqi-chat-x9kpy8 | 10-17 | 合了上面两支 + AI 工具 | 象棋Balance 的分支，TD 不碰 |
| codex/balance-a6-20261012 | 10-12 | 12 个源码文件 | 基于 10-10 的老底子，里面的对打、象等级等大多已以别的方式进了 main，不能整支合 |
| codex/balance-h70-20261012 | 10-13 | bfai.js 一处 | AI 改动，应走 Balance 验收 |
| claude/cg | 10-11 | juma.js、tiger.js | CG组暂停中的工作 |
| 其余 codex/*、claude/advisors、art-director、perf、sound、gallant-planck、td/ai | 10-11～10-15 | 无 | 只有文档、工具、记录 |

chuhan_v01 上 dev 比 main 多 5 个提交，全是文档（WORKFLOW 等），没有游戏代码。

## 四、发布现状

- **准源码**：chuhan_gpt `main`（81b18f1，10-16）。
- **线上**：chuhan_gpt_play `main` 根目录，GitHub Pages（地址应是 liukaidipeng-ops.github.io/chuhan_gpt_play/，本会话访问不到，未实测）。
- **发布方式**：没有成文的脚本。10-13～10-16 是 GPT 那边（作者 lukas peng）从 chuhan_gpt 构建再把产物提交到 play，提交说明写 `release: … (source <提交号>)`；10-13 还用过一次性的 Actions 工作流。今天 3 次是 Claude 手补 index.html。
- chuhan_gpt 自己的 `pages-rebuild.yml` 已改成只手动触发；它根目录的 index.html 是 10-12 的旧产物，不是线上。
- 老 TD 的 `deploy.sh`（推 v01 `dev:main`）已不适用。
- chuhan_gpt README 的「在线游玩」还指向 chuhan_v01 旧站。

## 五、整理方案（TD 建议）

1. **一个源码仓库**：chuhan_gpt `main` 为准；chuhan_v01 冻结只读（td-001）。
2. **旧站**：chuhan_v01 线上换成跳转到试玩站，免得有人玩到 10-11 的老版本（td-002）。
3. **补回今天的改动**：TD 在自己的分支上合 visual-atmosphere、补 template.html 开关行，构建后和线上比对，只差版本号才算过；之后推 main（td-003）。
4. **发布规矩**（td-004）：
   - 只从 chuhan_gpt `main` 构建发布，禁止手补 play 的 index.html；
   - TD 写一个发布脚本（构建 → 测试 → 和上一版比对 → 提交到 play，说明里写 source 提交号 → 核对线上版本号）；
   - 每次上线前在审批台批到「上线」。
5. **分支**：codex/* 和 10-11 前的部门分支一律只读存档、不整支合；里面还要的东西由对应部门重新交补丁（td-005）。
6. **WORKFLOW**：以 v01 `dev` 的 10-17 版为准不变（流程部门维护）；td-001 通过后，TD 在 chuhan_gpt 放一份同步或指针，并把 TD-HANDOFF 的仓库、发布两节改成新路线。

## 六、本会话的限制

- 给 chuhan_gpt、chuhan_v01 接推送权限被拦（add_repo push 被自动审查拒了），现在只能只读克隆。这份文件先放在 `/home/user/td/`，拿到推送权限后提交到 chuhan_gpt 的 `td/arch-20261017` 分支。
- github.io 线上地址本会话打不开，线上版本号只能看仓库里的 version.json。
