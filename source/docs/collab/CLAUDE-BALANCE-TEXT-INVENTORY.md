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
- `source/docs/collab/fable/01-回复-B-总闸和统计.md`
- `source/docs/collab/fable/01-回复-C-代码和上线.md`
- `source/docs/collab/fable/01-核查记录.md`（153,280 字节）
- `source/docs/collab/fable/02-题目-四个缺口的设计说明.md`
- `source/docs/collab/fable/02-回复-设计说明（初稿）.md`
- `source/docs/collab/fable/02-回复-设计说明（定稿）.md`
- `source/docs/collab/fable/02-清单-下棋变化.md`
- `source/docs/collab/fable/02-评审-可行性.md`
- `source/docs/collab/fable/02-评审-策略与意图.md`
- `source/docs/collab/fable/03-题目-原型.md`
- `source/docs/collab/fable/fable-notes.md`
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
