# 楚汉数值部门Balance｜部门接管记忆

保存日期：2026-10-12（Asia/Shanghai）。性质：Codex 只读接管报告，不是旧 Claude 会话恢复，也不是本轮游戏验收。

## 1. 职责与边界

负责规则数值、AI 理解机制、对打与平衡证据、考卷、实战复盘和模拟工具。先让 AI 懂机制，再用它判断规则强弱；不能把电脑不会用技能当成技能弱。

当前只做阅读及本聊天报告。原仓库 C:/Users/PLKD/Documents/GitHub/chuhan_v01 严格只读；新副本 C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt 本轮也不修改、不切分支、不提交推送。未运行测试、长期训练、发布、自动化或跨聊天消息。

历史分工：Balance 交 tools/、docs/、AI 补丁和 C 单；TD 管 source/src 的整合、验证、上线。规则与数值由用户拍板；视觉、声音分属专业部门。以后工作按 CODEX-WORKFLOW、新任务授权及隔离安排实施，不能照旧文档推旧分支或冒充 Claude 签名。旧后台提醒、停止钩子、自动发消息规则不构成本轮授权。

## 2. 已读资料与可追溯版本

以下均从新副本读取；分支是导入的本地 origin 快照，未 fetch，不能代表当前 GitHub 最新状态。

| 代号 | 分支 | 完整提交 |
|---|---|---|
| D | origin/dev | 00a94acd1a3f5395efdf412d06c585e0d28139b4 |
| T | origin/td/analysis | 6e0dde06111147edc95329248f91ec61628327ed |
| B | origin/claude/gallant-planck-rwr5az | 8c2b08c3adab8ac16e3b34b7814815ab79325a8c |
| M | origin/main | 11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5 |
| A | origin/claude/advisors | a401479c892c7881dcd52f446cdef4c6ae4adad5 |

实际阅读清单（完整路径；具体读取范围如实列出）：
- [D] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/WORKFLOW.md — 全篇，末段另行补读。
- [D] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/TD-HANDOFF.md — 职责、代码地图、交接、上线及用户约定；组合输出有截断，不宣称逐字全读。
- [T] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/README.md — 全篇。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions.md — 10-11、10-10、10-05及更早相关决策；分段补读，不能宣称完整无遗漏。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/code-to-chat.md — C72至C64为主，最新交付及对打标准。
- [D] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/chat-to-code.md — H71至H54及相邻记录；H71至H67单独补读。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/handoff-2026-10-08.md — 全篇，明确其已过时条目。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/handoff.md — 全篇。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/numbers-to-advisors.md — N11、N10、N8、N7、N6及N5相关段。
- [A] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/advice.md — A6全节、A5相关段。
- [B/T] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/bfai-qualification.md — 六闸门、统计限制、人工认可、历史基线与平衡方法。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/NOTES.md — 开头当前状态及10-11更新；约前125行，有截断，关键49至74行单独补读。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/bfai_gate.json — 全篇。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/r41-x3-hard-r.txt — 请求及前28行汇总。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/r41-x3-hard-b.txt — 请求及前28行汇总。
- [B] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/bfsim.js — open-nodes、open-ai关联、openSeq、SPRT、fixed等代码匹配段。
- [M] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/td-stalemate-idea.patch — 全篇。
- [M] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/bfai.js — fewPieces/stuck、deadline、hardEnd、maxMs及一步杀保险相关代码。
- [M] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/main.js — aiRescue、Worker看门狗、后台停钟、maxMs传递相关代码。
- [M] C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/bingfa.js — 开头配置与规则说明，r6、背水、被动走法相关段。
另已全文读取（工作区文件，无本轮确认的 Git 提交）：
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/AGENTS.md
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/持续推进工作约定.md
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/CODEX-WORKFLOW.md

通过 ls-tree 定位分支文档和 simjobs/simresults，通过 log 核对 B 最新提交为模拟结果入库，前序 eb0c808 为“C72 已上线（H71）”。未运行源码。本清单不代表读完整个仓库或全部实验日志。先尝试的 source/tools/NOTES.md 不存在，已找到并阅读仓库根目录 NOTES.md。

## 3. 技术标准与验收方法

- AI 交付：历史 WORKFLOW 要求对当时线上换边至少600局，得分>50%且z≥2；堵具体笨棋的小修可接受z>−1且考卷不退步。须明确基线提交、规则开关、档位、节点/时间模式、种子、样本和异常局；补丁可干净应用、TD相应测试通过。单项有效后还须组合对打。
- 六道闸门：考题合法性自检、深搜复核/考卷、漏着率、换边对打、用户人工认可、网页耗时。考卷满分不等于更强；同脑深搜裁判有偏差。SPRT [-30,10]通过只说明不明显退步，不可把提前停止后的名义区间直接包装成强度证明。
- 节点模式用于可复现对打；页面必须另外验证按时间收手。C72只读代码可见节点/固定深度模式不启用maxMs硬截止，不能用节点测试代替限时验证。
- “到位”四项：新对旧<55%；同规则、同开局两版各600局，逐局差95%区间含0且差≤5个百分点；技能使用率稳定；考卷不退步。其后仍需顾问意见及用户试玩拍板。旧≤3点说法已由conv2明确取代。
- 同种子不保证同开局：固定开局选择AI和open-nodes，并核对openSeq。校尉有层数上限，节点乘3不保证搜索量乘3。改规则比较同AI的改前/改后，必要时多版AI交叉核对方向。
- BF.ai接口与BFAI版本须匹配；随机经过Math.random才能固定种子；对局加载沿用game_load.js，注意旧规则年代。观察接口trace/scoreParts应只读、不改变走法。
- 当前代码配置：背水与r6均on:true，r6车价10/12/20；不能照旧TD交接单“r6默认关”推断运行配置。拒马冷却4、期间不能移动、不反伤炮和象相；飞越/踏营为被动走法。旧统计“破釜”字段可能实际统计背水，被动飞越/踏营应查via_*，不能把主动技能计数0误判为不会使用。
- C72“硬截止”是代码中的周期检查和预算控制；本轮没有证明所有内部计算在任何设备都严格限时。真机耗时与发热仍需实测。

## 4. 已批准决定及证据等级

以下是仓库保存的历史用户原话/拍板记录，不是本轮重获批准，也未独立访问旧审批数据库。

| 决定 | 仓库证据 | 当前理解 |
|---|---|---|
| AI优先懂机制，随后量平衡 | B decisions、C68、NOTES：10-10 06:57用户原话 | 延续研发顺序；不是现在恢复训练的授权 |
| 霸王不变，另开更强档 | B decisions ai_time2=a、C70；D H68 td-031/032 | 兵仙已有上线记录，历史600局58.8%支持更长思考；不能推断所有限时房间都胜霸王 |
| 难走时多想 | B C66 ai_time1=a、D H61 | 霸王通常3秒、困难时约8秒的历史方案 |
| 收敛判法改为配对区间+5点 | B decisions conv2=a、WORKFLOW §4 | 替代旧3点阈值 |
| 耗额度测试暂停到10-16 | B NOTES引述“暂停所有需要消耗额度的测试…下周五10月16再跑” | 2026-10-12仍处暂停窗口；未复制旧恢复闹钟 |
| 暂停中先修兵仙超时 | B C72/NOTES引述“先解决一下再休眠”；D H71 | 特批修复已有交付，不扩大成训练或发布授权 |
| 背水可同子两步或两子各一步、结算不能双方将军、最多吃一子 | B decisions及M bingfa配置 | 保留用户更正，不能误恢复“必须两个子”旧解释 |
| 四级车不因性价比低自动加强、终极兵法用于快速结束战局 | B decisions 10-05 | 低使用率不是自动改规则的理由 |

H68明确记录真机发热未量，不能把历史上线写成满足全部性能验收。新Codex签署只写真实身份，保留旧签名为历史，不新增虚假Claude签名。

## 5. 最新交付、上线记录与未结事项

| 项目 | 已掌握证据 | 状态 |
|---|---|---|
| C68/C69权重 | H67上线回执；C68 r36霸王86.3%、校尉90.6%；C69组合校尉200局88% | 已有历史上线记录，本轮未重测 |
| r39云端补充 | H67曾索要结果，但B NOTES后续明确GitHub版已停，本机确认已过 | 不能继续写“排队中”或杜撰600局完成 |
| C70兵仙 | H68；r41-x3两份结果各300局，候选执汉193胜，执楚159胜，1局cap | 历史上线；约58.8%为对应节点实验，不是真机房间实测 |
| C71看钟/观战发对局 | H69；M main.js/bfai.js相关实现 | 已有上线记录 |
| C72/H71 | 硬截止补丁、看门狗maxMs+3000/45000、隐藏AI钟暂停；M代码存在 | 历史上线+导入代码静态印证；本轮未运行验证 |
| H70兜底 | H70说明上线022275；M aiRescue及导出rescue记录相关实现 | 已有上线记录；它确保尝试合法行动，不等于解掉搜索根因 |
| H70困毙搜索 | td-stalemate-idea.patch；M仍是fewPieces(S)&&stuck(S) | 补丁未整合、未验证强度/耗时；不是待直接发布 |
| AI到位 | N11四项数字满足；A6同意数字但附前置条件 | 顾问意见已保存；最终用户认可待核实，gate humanSignoff仍null |
| 开局攻防 | A6要求核h1并补汉进攻/楚防守两类题；NOTES已排h1/o1/fA–fD | 结果文件已有入库记录；本轮未分析其完整结果，不宣称结论 |
| 升级盲区 | NOTES g7、r42全看升级仅43.7%、考卷139对141 | 全看升级方案不交付；待更有选择的搜索修法 |
| 后续权重 | NOTES r40 w_t6对w_t3p 50.6%，混合标签40.3% | 不把w_t6/混合标签当新版上线成果 |
| 平衡诊断 | N6 D0 64.7%、D1 25.7%，当时规则且AI未到位；N11发现开局混杂 | 仅历史方向证据，不能直接判当前规则应补楚 |

C72报告慢手机模拟0.3秒上限由33/78次超时降为0，39局面不限时走法/分数一致、八组测试过；这是原部门报告，本轮没有重跑。H71只称规则/技能/背水/r6过，明确未再跑bfai，不能写成TD本次八组全过。

## 6. 对接关系与交付接口

- 总协调：需求优先级、跨部门授权、总表#1；流程PR#2、历史审核迁移#5作为索引。本轮未读线上最新评论，未来实施前核对。
- TD：Balance写C号code-to-chat.md，TD回H号chat-to-code.md；交付须含基线、补丁范围、规则版本、测试数据、复现与回滚信息。编号沿用，实际新编号先核最新记录，不能直接抢号。
- 顾问：A号advice.md提出方案，Balance以N号numbers-to-advisors.md回数据。A6意见已读取，提议屏风马/楚先升中卒属于待验证候选，不是规则批准。
- 优化：Worker响应、真实手机耗时/发热与资源成本；不能用桌面节点结果替代真机。
- UI/美术/声音/角色/CG：如影响呈现由总协调安排对应部门；Balance提供档位、状态及事件数据，不接管画面和声音。
- 实战接口：保存/发对局，版本、规则、entries、think、branches、flags、rescue都要保留；rescue.at按行动序号解释，先定位空返回还是非法行动再查搜索。旧仓库对局工单#1/#2/#3与新仓库总表#1等编号不同，不能混为同一事项。

## 7. 用户偏好

中文简洁，结论要有证据；需要决策时准备具体可查看材料，保留原话、版本和回执。已有批准不重复请审；未知审批标待核实。不能把随口问进度或顾问猜测当成改规则命令。目标是“AI强到我悔棋也赢不了，至少很难赢”，不是只刷考卷分数。额度有意义、模拟不急、不擅开多代理；不虚报后台工作。当前明确行动完成后可结束，不继承旧Claude自动巡逻机制。

## 8. 下一项可执行任务

建议在收到具体实施任务后，先做H70静态验证准备：固定新副本基线，从已有导出找rescue/困毙局，整理>4子困毙、升级解将、freeUsed、四面楚歌pass、决战等复现矩阵，对照BF.evaluate与搜索判断；先形成可审阅的验证清单。此建议尚未实施。

耗时验证继续遵守暂停要求；即使日期到10-16也不把旧闹钟当成已启用自动任务。明确恢复授权后再进行强度/速度对照、相关回归和网页测试，达到门槛才交TD。并行的后续阅读应先核h1/o1/fA–fD已保存结果及开局考题，再准备最终到位审核材料，不能跳过用户试玩。

## 9. 缺失记忆与限制

仓库保留文本、代码、部分结果及审批转述；未恢复Claude完整聊天、Artifact数据库answers/items/ack、百分比进度面板、旧提醒运行状态、未提交scratchpad、远端Actions日志、线上当前页面或新GitHub最新评论。不能说已经完整恢复原部门全部记忆。

旧NOTES同一节混有不同时点状态：旧TD编号、C66截止、3点阈值、排队中等需要用具体C/H/N/A回执和批准更正，不能只看文件时间。TD-HANDOFF的r6默认关与当前代码on:true不一致；以代码说明导入实现，以decisions说明批准，分别保留证据。

本报告完成了核心流程、批准链、最新交付和相关实现的接管阅读；未全文审阅所有历史C/H/A单、全部实验明细或全部代码。未做独立统计复算、性能测试或当前线上验收。没有运行中的后台任务。
