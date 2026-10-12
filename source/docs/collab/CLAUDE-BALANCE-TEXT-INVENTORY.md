# Claude 数值部历史文本清单与补读状态

> 建档时间：2026-10-13（Asia/Shanghai）
> 源快照：`claude/gallant-planck-rwr5az@8c2b08c3adab8ac16e3b34b7814815ab79325a8c`
> 用途：接管 Balance 工作时核对旧结论、批准状态、实验依据和遗留风险。本清单不修改原 V01，也不改变既有编号或批准状态。

## 范围

本次先按“仓库中的文本材料”建档：根目录 `NOTES.md`、`README.md`，以及 `source/docs/` 下的 Markdown、文本、JSON、YAML、Shell 和 JavaScript 证据文件。该口径共 122 个文件。它不等于 Claude 会话平台里的全部聊天记录；未入库的聊天内容无法从 GitHub 快照证明已经完整读取。

## 当前状态

| 状态 | 含义 |
|---|---|
| 已用于当前工作 | 已作为 H70、A6、历史上传对局或持续工作规则的直接依据 |
| 已定位，待逐页复核 | 文件已纳入清单，但尚未逐字读完并交叉核对 |
| 原始证据，按结论回查 | 运行输出、脚本和逐种子数据；先由上层结论定位，再回查对应原始证据 |

目前不能声称“全部读过”。已用于当前工作的核心材料包括：

- `source/docs/collab/WORKFLOW.md`
- `source/docs/ai-playbook.md`
- `source/docs/bfai-qualification.md`
- `source/docs/collab/decisions.md`
- `source/docs/collab/handoff-2026-10-08.md`
- `source/docs/collab/advisors/handoff.md`
- `source/docs/collab/advisors/numbers-to-advisors.md`

其中批准记录仍以原编号和原状态为准；“读过”不代表重新批准。

## 分组清单

### A. 必须优先复核的 Balance 主文档

| 文件 | 字节 | 状态 | 复核目标 |
|---|---:|---|---|
| `source/docs/collab/decisions.md` | 37,171 | **已完整复核** | 批准项、否决项、原编号 |
| `source/docs/collab/code-to-chat.md` | 121,620 | 已定位，待逐页复核 | Claude 数值部对用户的交付与承诺 |
| `source/docs/collab/chat-to-code.md` | 115,767 | 已定位，待逐页复核 | 用户原话、约束和任务来源 |
| `source/docs/ai-playbook.md` | 15,659 | **已完整复核** | AI训练、评测与版本纪律 |
| `source/docs/bfai-qualification.md` | 7,424 | **已完整复核** | 600局换边准入、统计口径 |
| `source/docs/collab/WORKFLOW.md` | 19,248 | **已完整复核** | 持续工作、审批和交接规则 |
| `source/docs/collab/handoff-2026-10-08.md` | 4,444 | **已完整复核** | 历史交接点和未完成项 |
| `source/docs/collab/advisors/handoff.md` | 11,203 | **已完整复核** | 顾问交接与数值依赖 |
| `source/docs/collab/advisors/numbers-to-advisors.md` | 18,285 | **已完整复核** | 数值部给顾问部的结论 |
| `NOTES.md` | 141,402 | 已定位，待逐页复核 | 仓库早期总记录 |
| `README.md` | 10,387 | **已完整复核** | 仓库入口和版本说明 |

### B. Fable 审查与设计主文档

这些文件属于旧数值部的重要独立审查材料，优先级仅次于批准记录和双向交接：

- `source/docs/collab/fable/01-题目-审查考卷与总闸.md`
- `source/docs/collab/fable/01-回复-A-考卷.md`
- `source/docs/collab/fable/01-回复-B-总闸和统计.md` — **已完整复核**
- `source/docs/collab/fable/01-回复-C-代码和上线.md` — **已完整复核**
- `source/docs/collab/fable/01-核查记录.md`（153,280 字节）
- `source/docs/collab/fable/02-题目-四个缺口的设计说明.md`
- `source/docs/collab/fable/02-回复-设计说明（初稿）.md` — **已完整复核**
- `source/docs/collab/fable/02-回复-设计说明（定稿）.md` — **已完整复核**
- `source/docs/collab/fable/02-清单-下棋变化.md`
- `source/docs/collab/fable/02-评审-可行性.md`
- `source/docs/collab/fable/02-评审-策略与意图.md`
- `source/docs/collab/fable/03-题目-原型.md`
- `source/docs/collab/fable/fable-notes.md` — **已完整复核**
- `source/docs/collab/fable/README.md`

状态：已定位，待按“题目 → 回复 → 核查记录 → 原始材料”的顺序逐页复核。

### C. Fable 原始实验材料

`source/docs/collab/fable/01-材料/` 下包含考卷输出、性能时间、镜像/多样性检查、holdout 原型、SPRT 模拟和 skeptic 复核脚本。它们属于“原始证据，按结论回查”，主要包括：

- `exam_*.txt`、`mirror_*.txt`、`page_timing/*.txt`
- `holdout_proto*.js/.txt`
- `skeptic_a5/`、`skeptic_a7/`、`skeptic_b8/`、`skeptic_b11/`、`skeptic_c7/`、`skeptic_c8/`、`skeptic_c20/`
- `sprt_sim.js`、`q3q4_calc.js`、`worst_rev.js`

这些文件不能用“工作流成功”代替结论；复核时必须把文件、参数、种子和对应上层结论连起来。

### D. 相关但非 Balance 主责文本

`source/docs/collab/` 中还有 TD、模型、声音、美术和优化交接文件，例如 `TD-HANDOFF.md`、`MODEL-WORKFLOW.md`、`model-to-main.md`、`main-to-model.md`、`SOUND-WORKFLOW.md`。仅在它们与数值批准、AI版本或上线依赖有关时纳入复核，不把其他部门材料误称为 Claude 数值部自己的结论。

## 补读顺序与验收

1. 逐条复核 `decisions.md`，形成“编号—状态—对应实现/证据”的映射。
2. 对读 `chat-to-code.md` 与 `code-to-chat.md`，列出仍有效承诺、已完成项、取消项和未闭环项。
3. 复核 AI playbook、准入文档和交接材料，校正 H70/A6 的验收口径。
4. 阅读 Fable 主文档；对争议或关键结论回查 `01-材料/` 原始证据。
5. 最终只有在 122 个文件均被归类、主文档逐页复核、关键结论能追到原始证据后，才可报告“GitHub 快照内的历史文本已全部核对”。仍不能据此声称读过未入库的 Claude 会话。

## 当前工作连接

- H70：困毙漏判修复、性能再验证、600局换边棋力准入。
- A6：正式考卷与生产交付证据。
- 历史上传对局：25个压力点的复现与主线/候选对照。

后续发现旧文本与当前结论冲突时，保留旧编号和批准状态，单列冲突、证据与影响，不静默改写历史记录。


## 补读进度日志

### 2026-10-13 · 第1批

已完整复核 5 个主文档：

- `source/docs/collab/decisions.md`
- `source/docs/bfai-qualification.md`
- `source/docs/collab/handoff-2026-10-08.md`
- `source/docs/collab/advisors/handoff.md`
- `source/docs/collab/advisors/numbers-to-advisors.md`

已确认的关键约束：

1. 600局换边对打、固定节点和同一批开局是棋力/平衡结论的核心口径；考卷是回归标尺，不能单独给版本排序。
2. 历史批准项必须保留原编号和状态；Plan C、未定规则、已否决变体不能因重新阅读而恢复为有效任务。
3. 用户目标是先把电脑练到充分理解机制，再用强电脑判断平衡；历史数据显示开局策略与先手会让汉胜率波动十几个到几十个百分点。
4. `N11` 记录的“到位四条满足”仍带开局强着保留意见，不能改写成“完美AI已完成”。
5. 历史交接列出的升级盲区、一步杀、搜索深度和网页耗时问题，必须按后续 C/H 交付及当前 H70 证据判断是否已关闭。

`chat-to-code.md` 已开始分段读取，但由于单次返回截断，本批不把它标成完整复核；后续改用更小行段逐段确认。


### 2026-10-13 · 第2批

已完整复核 7 个文件：

- `source/docs/ai-playbook.md`
- `source/docs/collab/WORKFLOW.md`
- `README.md`
- `source/docs/TODO-v3.md`
- `source/docs/TODO-v4.md`
- `source/docs/TODO-v5.md`
- `source/docs/TODO-v6.md`

累计完整复核：12 / 122。

新增确认：

- 旧项目不是神经网络训练，而是搜索、估值权重拟合、考卷、复盘和对打组成的持续工程；不能用“训练百分比”描述总完成度。
- 多数历史 TODO 已完成，但 v6 曾留过模型细化和最终部署占位；是否实际关闭必须以其后的 TD H/C 记录和部署提交为准。
- 旧手册把“同种子换边至少600局、考卷不作排名、页面耗时必须实测”写成固定验收纪律，H70继续沿用。


### 2026-10-13 · 第3批

已完整复核 6 个 Fable 流程文件：

- `source/docs/collab/fable/README.md`
- `source/docs/collab/fable/00-题目-首次调用（已停）.md`
- `source/docs/collab/fable/00-回复-首次调用（已停）.md`
- `source/docs/collab/fable/01-题目-审查考卷与总闸.md`
- `source/docs/collab/fable/02-清单-下棋变化.md`
- `source/docs/collab/fable/03-题目-原型.md`

累计完整复核：18 / 122。

新增确认：首次 Fable 调用被明确停止且没有产出；正式审查要求把“已验证”和“推断”分开。四缺口原型的每项必须有独立开关、关掉后与16aacba逐步一致、旧十类考卷不退步，并受网页耗时上限约束。Fable 产物从未被授权绕过对打、总闸或 TD 上线流程。


### 2026-10-13 · 第4批

已完整复核 4 个 Fable 文件：

- `source/docs/collab/fable/01-回复-A-考卷.md`
- `source/docs/collab/fable/02-题目-四个缺口的设计说明.md`
- `source/docs/collab/fable/02-评审-可行性.md`
- `source/docs/collab/fable/02-评审-策略与意图.md`

累计完整复核：22 / 122。

新增确认与冲突：

1. 旧考卷只适合作为回归约束，不能用总分给 AI 排名；历史上 9ff 考分高于 25eb911，但对打反而更弱。考卷、固定裁判损失、保留题和换边对打必须分开陈述。
2. 当时不存在真正未见保留题；Fable 提出的“文件哈希承诺种子、定稿后生成、固定外部裁判、事后公开”是诊断方案，不能替代对打准入。
3. 四战略缺口的原始设计不能直接实现：G1 的 alpha-beta 窗口、封锁探针和加深成本均有硬伤；G2 触发门会误开并放大尾部耗时；G3 只应覆盖立即生效的被动能力；G4 不能假定会由 G1 自动产生。
4. 两份独立评审共同支持的低风险顺序是先修正 G3，再评估楚方 G4、G2，最后重做 G1；但这些是历史评审结论，不恢复任何未批准开关，也不越过当前 AI、性能和 600 局门禁。
5. 历史材料再次确认：节点平均值不足以判断网页可用性，必须报告触发局面的 P90、最大值和未算满深度的数量；对称自对弈胜率变化也不能自动解释为单方 AI 变强。


### 2026-10-13 · 第5批

已完整复核 2 个 Fable 文件：

- `source/docs/collab/fable/01-回复-B-总闸和统计.md`
- `source/docs/collab/fable/01-回复-C-代码和上线.md`

累计完整复核：24 / 122。

新增确认与历史限制：

1. 旧 `[-30,10]` SPRT 的“通过”只能解释为不比旧版明显弱，不能证明更强；相同棋力版本也约有一半机会通过。提前停后的 Elo 点估计和固定样本 95% 区间存在选择偏差。
2. 历史总闸重复使用默认种子 1，跨轮证据并不独立；同种子换边仍能抵消颜色，但开发期反复复用会形成应试风险。正式结论应记录新种子、按完整 pair 汇总，并把换边总分与执汉/执楚拆分同时报告。
3. 颜色差主要来自规则本身的楚方优势；旧数据不足以证明新版只会执楚。H15 的 60.7% 可作换边总分，但不能把提前停的 +76 Elo 当成无偏强度估计。
4. b18c278 的节点模式棋力证据当时较扎实，网页时间模式却暴露两个独立风险：霸王档最慢 9 秒和汉方提防破釜的 `pofuPairs` 枚举不受时限。节点数相同不代表网页耗时相同，手机/Worker 实测是独立门禁。
5. 路线 C 当时结论是“改完再上”，还要求换种子固定局数、漏着率、真实页面与人工授权证据；这些历史待办是否关闭必须由后续提交和运行证明，不能按旧报告文字自动视为完成。


### 2026-10-13 · 第6批

已完整复核 3 个 Fable 文件：

- `source/docs/collab/fable/02-回复-设计说明（初稿）.md`
- `source/docs/collab/fable/02-回复-设计说明（定稿）.md`
- `source/docs/collab/fable/fable-notes.md`

累计完整复核：27 / 122。

新增确认、修订关系与当前影响：

1. 四缺口设计初稿包含四处被后续独立评审证实的硬伤：G1(a) 搜索窗口可能倒置、G1(c) 探针会因走子方错误而误报封升级、G2 将军奖励条件使触发门形同虚设、G3 绝对差把升级本身的分数当成即时收益。初稿只能作为历史过程，不能作为实现规格；以定稿修订为准。
2. 定稿把 G3 收窄为“守子升级后当回合新增被动技能且立即产生相对收益”，明确主动技能有解锁冷却；G4 改为楚方根上破釜核对多两层并受原 40% 预算约束；G2 只在进账前窗口给己方第 2 层一个升级分支；G1 拆为对称门槛、汉方根上陷阱复核和按引擎探出的封锁估值三项。历史顺序改为 G3→G4→G2→G1，且每项均要求独立开关与全关同 dev。
3. 这些设计的共同门禁不是平均节点，而是分边报告第 3 层节点 P90、最大值、未算满深度数量和真实页面耗时。G3/G2 的实战改变率很低，定稿明确要求按触发计数，不为测不出的单项盲跑 SPRT；G1/G4 的额外搜索必须受预算上限并用最坏局面复核。
4. `fable-notes.md` 再次确认：旧考卷是机制回归，不是强弱排序；旧 [-30,10] SPRT 通过只表示“不明显弱于上一版”；`humanSignoff` 当时必须保持空；网页时间模式是独立门禁。它记录的是 b18c278/73eb7d4 时点的历史状态，后续是否关闭必须以更新提交、运行和当前 H70/A6 证据判断。
5. 历史悬而未决项包括最坏破釜枚举耗时、漏着率容差、颜色基线、是否另跑“证明更强”的固定局数、保留题裁判和战略题门槛。当前不能把这些旧建议恢复成已批准任务，也不能用旧版 60/107 局结果代替 H70 的 600 局换边准入。


### 2026-10-13 · 第7批

已完整复核 31 个 Fable 原始证据文件：

- `source/docs/collab/fable/01-材料/README.md`
- `source/docs/collab/fable/01-材料/rerun_seed7001.txt`
- `source/docs/collab/fable/01-材料/rerun_seed7001_fixed60.txt`
- `source/docs/collab/fable/01-材料/mirror_b18c278.txt`
- `source/docs/collab/fable/01-材料/c_timing_live.txt`
- `source/docs/collab/fable/01-材料/c_timing_dev.txt`
- `source/docs/collab/fable/01-材料/c_pofu_cost.txt`
- `source/docs/collab/fable/01-材料/exam_multiplicity.txt`
- `source/docs/collab/fable/01-材料/page_timing/` 下全部 23 个文本：
- `source/docs/collab/fable/01-材料/page_timing/page2_git_25eb911_hard_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_25eb911_hard_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_25eb911_mid_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_25eb911_mid_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_73eb7d4_hard_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_73eb7d4_hard_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_73eb7d4_mid_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_73eb7d4_mid_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page2_git_73eb7d4_mid_r.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_16aacba_hard_b.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_16aacba_mid_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_16aacba_mid_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_16aacba_mid_b_3.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_16aacba_mid_r.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_25eb911_hard_b.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_25eb911_mid_b_1.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_25eb911_mid_b_2.txt`
- `source/docs/collab/fable/01-材料/page_timing/page4_git_25eb911_mid_b_3.txt`
- `source/docs/collab/fable/01-材料/page_timing/page_bfai_b18c278_hard_b.txt`
- `source/docs/collab/fable/01-材料/page_timing/page_bfai_b18c278_mid_b.txt`
- `source/docs/collab/fable/01-材料/page_timing/page_git_25eb911_hard_b.txt`
- `source/docs/collab/fable/01-材料/page_timing/page_git_25eb911_mid_b.txt`

累计完整复核：58 / 122。

新增原始证据核对：

1. seed 7001 的固定 60 局结果是 39/60、65.0%、Elo +108（名义区间 +20～+211），执汉 16/30、执楚 23/30；LLR 2.49 未越过 ±2.94，因此只能作为方向一致证据，不能写成序贯检验已经给出更强结论。17 局文件曾在第 16 局越界，属于提前停证据。
2. 旧镜像考卷的 21 题原题 3/3、镜像 0/3；全卷 108/108 对 105/108。它直接支持“阵亡名单子 ID 未镜像”的历史问题，不能把旧镜像分差解释为新增区分度。
3. `c_timing_live/dev` 与 23 份页面输出共同证明节点模式相同不代表页面耗时相同。b18c278 的校尉页面样本出现 P90 7028 ms、最长 7701 ms，霸王样本最长 6587 ms；73eb7d4 把霸王样本压到最长 5179 ms，但校尉仍出现 P90 4491 ms、最长 6346 ms。单局数据受机器负载和棋局组成影响，只能与固定局面、分边 P90/最大及未算满深度数量一起解释。
4. 破釜组合枚举在“汉走且楚破釜在手”的 29 个固定局面中占总 CPU 40%；seed 21 ply 16 单步总 CPU 4768 ms，其中 `pofuPairs` 3272 ms、组合数 79426。将军延伸 CX=2 相对 CX=0 节点 +33%，而新候选每节点 CPU 也比旧版贵 62%；性能问题不是单一节点上限能说明。
5. `exam_multiplicity.txt` 显示多道“别走某步”的题拥有极多可判对着法：20 题 440/450、实2 435/450、26 题 50/51；它们适合作回归约束，不适合作强弱区分。相反，机制唯一解题和战略题的候选空间、判定器与反题必须单独核查。
6. 这些材料属于 b18c278/25eb911/73eb7d4/16aacba 的历史证据，不能替代当前 H70 的性能样本、有效考题结果或 600 局换边准入。


### 2026-10-13 · 第8批

已完整复核 20 个 Fable 原始脚本：

- `source/docs/collab/fable/01-材料/skeptic_a7/check2.js`
- `source/docs/collab/fable/01-材料/skeptic_a7/check.js`
- `source/docs/collab/fable/01-材料/skeptic_a5.js`
- `source/docs/collab/fable/01-材料/exam_chain.sh`
- `source/docs/collab/fable/01-材料/c_worst.js`
- `source/docs/collab/fable/01-材料/skeptic_b8/cov.js`
- `source/docs/collab/fable/01-材料/skeptic_b11/sim.js`
- `source/docs/collab/fable/01-材料/c_worst2.js`
- `source/docs/collab/fable/01-材料/exam_multiplicity.js`
- `source/docs/collab/fable/01-材料/skeptic_c20/layers.js`
- `source/docs/collab/fable/01-材料/skeptic_a7/q21swap.js`
- `source/docs/collab/fable/01-材料/sprt_sim.js`
- `source/docs/collab/fable/01-材料/same_moves.js`
- `source/docs/collab/fable/01-材料/skeptic_c7/worst16_loose.js`
- `source/docs/collab/fable/01-材料/skeptic_c7/worst16.js`
- `source/docs/collab/fable/01-材料/skeptic_c20/layers40.js`
- `source/docs/collab/fable/01-材料/pento.js`
- `source/docs/collab/fable/01-材料/exam_mirror.js`
- `source/docs/collab/fable/01-材料/worst_rev.js`
- `source/docs/collab/fable/01-材料/skeptic_c8/decomp.js`

累计完整复核：78 / 122。

新增脚本层核对：

1. 镜像核查脚本证明仅翻转棋盘坐标不够：阵亡名单中的棋子 ID 和召回行动 ID 也必须按开局左右对称位互换；`q21swap.js` 正是对旧 `exam_mirror.js` 缺口的修复性复核。
2. `sprt_sim.js`、`skeptic_b8/cov.js` 和 `skeptic_b11/sim.js` 都按实际工具的偶数局检查、经验方差和 ±ln(19) 边界建模；它们用于说明提前停偏差、朴素区间覆盖和“通过只是不明显弱”。`pento.js` 进一步按完整 seed pair 比较配对与单局方差，但脚本本身不等于项目已切换到配对检验。
3. `c_worst*.js`、`skeptic_c7/worst16*.js`、`skeptic_c20/layers*.js` 通过固定种子重建最坏局面，分离破釜枚举、前两层、第三层、CPU、墙钟和节点。它们支持“第三层兜底治不了前两层已耗时的最坏局面”，并说明缓存命中必须按完整状态内容核对。
4. `skeptic_c8/decomp.js` 将根节点升级分支、破釜搜索和将军延伸逐项剥离；`same_moves.js` 同时比较着法与节点数。历史性能结论来自受控消融，不应只看总节点或单局墙钟。
5. `exam_multiplicity.js` 枚举先升级加主行动的全候选并逐个交给原判题器；`skeptic_a5.js`、`skeptic_a7/*` 则检查宽判题、题目走子方、阵亡 ID 与镜像召回。这些脚本说明考卷质量问题来自题目/判题结构，不应归咎于候选 AI。
6. 这些脚本含旧容器绝对路径和历史提交副本，只能作为快照证据；没有本轮云端运行结果时，不把“读过脚本”写成“已复跑”或“当前版本验证通过”。


### 2026-10-13 · 第9批

已完整复核 10 个协作与原始证据文件：

- `source/docs/collab/main-to-perf.md`
- `source/docs/collab/README.md`
- `source/docs/collab/main-to-sound.md`
- `source/docs/collab/decisions-美术总监.md`
- `source/docs/collab/sound-to-main.md`
- `source/docs/collab/fable/01-材料/c_pofu_cost.js`
- `source/docs/collab/decisions-sound.md`
- `source/docs/collab/td-handoff-checklist.md`
- `source/docs/collab/fable/01-材料/skeptic_c8/decomp.txt`
- `source/docs/collab/ad-to-td.md`

累计完整复核：88 / 122。

新增确认：

1. 协作总说明和性能交接继续确认单写入者、TD 统一上线、规则/数值/发布需用户批准及提交可移植性要求；这些历史路由记录不扩大当前权限。
2. 声音与美术文件是相关部门的批准和交接记录，不是 Claude 数值部的数值结论；保留其原编号和状态，不吸收到 Balance 决策。
3. TD 交接检查表继续要求精确记录未结编号、云端证据、触发条件、完整测试、人工批准和回滚，不允许用模糊“已经好了”代替可验证交付。
4. `c_pofu_cost.js` 与已复核输出的方法一致：固定种子 21/22，拆分 `pofuPairs` CPU、CX=2/0 和每节点 CPU；本次只核对快照脚本，不冒充当前重跑。
5. `skeptic_c8/decomp.txt` 的 40 个历史局面显示：旧版平均 10,774 节点/260 ms，完整版 18,528/484 ms，去根升级 10,886/315 ms，去破釜 17,762/427 ms，去升级和破釜 10,379/273 ms，CX=0 为 15,327/405 ms；25/40 局进入根升级候选，完整/去升级根分支比平均 2.63。根升级分支是当时节点增长的主因，破釜与将军延伸也有成本。
6. 本批材料不改变 A6 未通过、A3 正式 600 局门禁关闭或 H70 尚未完成的状态，也未授权部署。
