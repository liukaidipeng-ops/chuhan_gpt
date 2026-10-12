# 顾问部advice｜部门接管记忆

记录日期：2026-10-12（Asia/Shanghai）。本次交付为只读接管与证据整理，不是新增 A7、N12 或规则批准。

## 1. 职责与边界

负责玩法策略、技能设计、玩家体验和数据论证；沿用 A 编号，区分假设、模拟结果、用户决定与实施回执。桌游设计、国际象棋、中国象棋是三个分析视角，不是三名真实专家或独立代理。顾问部提出可检验方案，Balance 评估成本和执行测试，Ham 决定规则与开测，TD 实现和整合。

不改游戏源码或数值部工具，不自行定规则，不执行发布，不启动长期训练或模拟。本次未切换共享分支、未修改共享仓库、未接触原仓库写操作、未向其他聊天发消息。旧文档的 Claude 签名、门铃、定时提醒和自动通知仅为历史资料，不迁移为当前授权。

## 2. 已读资料与版本

下面为实际读取的文件；提交是所读快照提交，不表示该文件最后修改提交。只读采用 git ls-tree、git show、git grep、git log；结果压缩文件由 git show 输出到 Python 内存解压。长文明确标出部分阅读，未声称读完整个仓库。

- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/handoff.md`
  - 分支 `origin/claude/advisors`；提交 `a401479c892c7881dcd52f446cdef4c6ae4adad5`；范围：全文。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/advice.md`
  - 分支 `origin/claude/advisors`；提交 `a401479c892c7881dcd52f446cdef4c6ae4adad5`；范围：A1–A6及补充、拍板；首次截断后补读中段。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions-顾问部.md`
  - 分支 `origin/claude/advisors`；提交 `a401479c892c7881dcd52f446cdef4c6ae4adad5`；范围：全文。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/WORKFLOW.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/numbers-to-advisors.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：N1–N11全文。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：部分：10-10、10-11及早期规则、审批相关段；输出曾截断。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/NOTES.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：定向读取暂停、A6、h1、fA–fD、C72/H71相关记录。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/code-to-chat.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：C68–C72相关段。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/chat-to-code.md`
  - 分支 `origin/main`；提交 `11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5`；范围：H65–H71相关段。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/rules.js`
  - 分支 `origin/main`；提交 `11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5`；范围：前160行：基础走法、初始棋盘。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/bingfa.js`
  - 分支 `origin/main`；提交 `11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5`；范围：配置、r6、践踏执行、召回相关定位片段。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/bfsim.js`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：开局参数解析、强制行动与记录相关代码片段。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/bfai-qualification.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：前75行：六道闸门与局限。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/ai-playbook.md`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：部分：工具及标准流程；输出曾截断。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simjobs/h1-t6-hard.json`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文任务配置。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/h1-t6-hard.json.gz`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：解析全部600条，汇总胜负、错误、回合、种子；未逐局棋谱复盘。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simjobs/fA-open.json`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文任务配置。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/fA-open.json.gz`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：解析全部600条，汇总胜负、错误、回合、种子；未逐局棋谱复盘。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simjobs/fB-open.json`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文任务配置。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/fB-open.json.gz`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：解析全部600条，汇总胜负、错误、回合、种子；未逐局棋谱复盘。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simjobs/fC-open.json`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文任务配置。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/fC-open.json.gz`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：解析全部600条，汇总胜负、错误、回合、种子；未逐局棋谱复盘。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simjobs/fD-open.json`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：全文任务配置。
- `C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/simresults/fD-open.json.gz`
  - 分支 `origin/claude/gallant-planck-rwr5az`；提交 `8c2b08c3adab8ac16e3b34b7814815ab79325a8c`；范围：解析全部600条，汇总胜负、错误、回合、种子；未逐局棋谱复盘。

另已全文读取当前迁移约定：
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/AGENTS.md
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/持续推进工作约定.md
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/CODEX-WORKFLOW.md
以上是工作区文件，本次未确认对应已提交版本，不能把总协调摘要当作部门独立测试证据。

## 3. 设计、技术标准及验收方法

每份方案写明：问题和来源、具体改动数字、预期指标、对照设计、成本与风险。先证明 AI 懂机制，再用它测平衡。技能少用可能因为弱、难解锁、AI 不会用，不能只凭使用率删技能。规则修改成批规划，估值需要重调；测试仍需逐项控制变量，组合再验证。

A4/conv2 已记录的到位标准：新版对上一版得分低于55%；同规则、真实同开局两版各600局，逐局差的95%区间包含0且绝对差≤5个百分点；技能使用率接近；考卷不退步。之后仍须顾问意见和 Ham 实战拍板。区间含0是历史业务门槛，不等于统计上证明等效。

N10/N11 的重要修正：同种子不等于同开局。比较权重需固定开局AI；比较搜索强度还需固定 open-nodes，并核对实际开局记录。校尉节点数乘3不代表深度乘3，校尉层数上限可能先触顶。A5提出同版改前后比较、多版核查方向；不能把单版自对打胜率当规则真值。

AI交付历史门槛：换边至少600局、得分>50%且z≥2；小型堵漏允许z>−1且考卷不退步；同时需要网页实际耗时和TD测试。考卷高分不等于棋力强，序贯检验通过也不等于固定局数显著更强。本次未运行这些验证。

A3目标是候选验收指标：齐射用过的局≥10%，践踏每局打中≥0.3次，汉胜率变化约±3个百分点，报告对局长度、相象升级、贴脸将死、守方士象损失；不能称为已经达到。历史用户对长度要求为六成对局60回合内结束。

## 4. 已批准决定及证据等级

这里的“已批准”指仓库保存的历史批准记录；在线答案数据库和ack未取回。已有记录保留，不重复说成未批准。

- a3_content=a（10-10 09:37）：照Plan C测齐射/践踏，四面楚歌和决战不动；前提仍是电脑训练到位。见顾问 decisions 与 A3。
- revive_cond=b：召回/背水开启条件先不讨论，等A1诊断。见顾问 decisions。
- ai_a2=a：①混合标签、③九宫安全用便宜版；②不做刺客，改收实战考题；④参数扫描后置。顾问与Balance两份decisions及N5互证。
- conv2=a：到位第二条改为上述配对区间及5个百分点标准。A4、N8、Balance decisions、WORKFLOW互证。
- A1最初“都跑”后来被明确收窄为只留D0+D1，先练电脑，D2–D5后置。N3与顾问decisions互证，旧批准不能覆盖后来决定。
- 10-11暂停耗额度测试至10-16：顾问decisions、Balance NOTES一致。C72超时修复是特批例外，不是恢复全部训练的许可。
- A6首选1b是条件性建议，没有发现“先手前1–2回合禁升级”已获批准或已实施的证据。
- 未找到Ham最终认定“电脑到位”的可靠已读记录；状态待核实，不能用四条数字过关代替人工拍板。

## 5. 最新交付、历史上线和未结事项

### 已交付

顾问最新方案A6：e37146c，随后a401479只增加暂停记录。A6同意N11四项数值门槛通过，但保留两项：核查h1；增加汉是否选择升中兵炮打中卒、楚如何提前防守两类考题。之后再请Ham实战决定。

A2结果已收到：混合标签w_t5m对w_t4仅40.3%，不用；九宫安全小特征收益很小，不单独开对打；g4–g6的10题已入考卷；搜索优先于继续微调估值。见N7/N8。

### A6之后已有原始结果，不能再写“尚无结果”

本次仅重新汇总已保存数据，没有重新模拟。每组600个不同种子、errors数组均为空。

| 组 | 条件摘要 | 汉胜/楚胜/无胜者 | 汉胜占全部局 | 平均回合 |
|---|---|---|---:|---:|
| h1 | w_t6霸王10万节点、固定开局6万节点 | 399/201/0 | 66.5% | 44.09 |
| fA | 中炮对中炮，汉升中兵炮打中卒 | 429/171/0 | 71.5% | 42.48 |
| fB | 中炮对中炮，汉改走马二进三 | 323/275/2 | 53.83% | 41.44 |
| fC | 汉中炮，楚先马8进7护中卒 | 303/297/0 | 50.5% | 42.92 |
| fD | 汉中炮，楚升中卒再中炮 | 335/265/0 | 55.83% | 43.21 |

fB有2条winner=null，本表保留为无胜者，不擅自把它们归类为规则和棋；若按半分计得分则为54.0%，与胜局占比不同。

h1结果提交b6a0b82873a91d94feac4c060387d40f93f2d859（Actions记录38100890941）；fA–fD结果提交8c2b08c3adab8ac16e3b34b7814815ab79325a8c（Actions记录38101872490）。这是Git记录，未查询当前线上运行状态。

初步解释：先上马的防法值得继续核查，不能直接断言该开局必然迫使修改规则。f组使用校尉、自带强制开局；它们不能证明霸王会主动选择防法。h1开局10步也由独立开局AI挑选，不能凭66.5%总体胜率证明霸王在开局阶段“知道或不知道”正确防守。不同强制开局下后续局面本来不同，同种子不等于同局面对照；这些数字尚未构成完整因果归因或新的正式N12。

### 历史上线记录

TD H67记录C68/C69权重已合并上线；H68记录兵仙上线并有td-031/td-032审批；H69–H71记录看钟、兜底、硬截止等上线。均属旧仓库历史回执，本次没有网页实测或发布。H68还明确真机发热未量，不能转述为真机验收完成。

### 当前源码与旧说明的冲突

origin/main的bingfa.js配置仍为qishe level=4、jianta level=4；trample实际要求res为kill或hit，走空格不踩。文件顶部和函数注释仍有“三级”“空格也踩”的旧表述，不能依注释判定Plan C已实现。A3的三级解锁、空格践踏不可标成现行规则或已上线。r6配置为on:true，车价10/12/20、召回封顶二级、首次升级半价等已在代码配置中出现。这里只核对配置及有关执行片段，没有完整运行验收。

### 待整合与待核实

本部门没有找到已批准、已验收而只差TD合并的规则补丁。A3属已批准方案范围、开测条件未核实，不应归为“直接待整合”。待核实：最终到位批准、两类A6考题是否已增加及通过、N12是否另存在线、现行总表最新评论、审批ack与附件版本。TD困毙想法补丁在H70/C72/NOTES中仍标未测，属于Balance与TD接口，不由顾问部实施。

## 6. 对接部门与交付接口

- 总协调：通过新仓库总表#1组织任务、审批证据和部门依赖；本次未写入或发送消息。
- Balance：顾问写advisors/advice.md（A号），Balance回advisors/numbers-to-advisors.md（N号）；测试设计应带规则提交、AI/权重、种子、真实开局、样本量、统计定义与费用。
- TD：规则最终定义、批准和数据齐备后由TD实现；C/H回执保留原号。顾问负责解释设计意图，不直接写源码。
- 美术总监：技能范围和危险提示等可读性需求；角色、声音、CG各负责自身表现接口。顾问不代做或越权批准。
- 优化部：更长思考时间的真机延迟、发热和操作可用性证据。

## 7. 用户偏好

中文、简洁、手机易读，数据与猜测分开；不迎合，先分析取舍。希望AI真正理解机制，再讨论平衡；目标曾表述为悔棋也难赢。省额度，避免重复训练、全量SPSA与未经授权的多代理；采用总协调加专业部门。需要拍板的集中在可审核材料里，真实意见须有回执；保留已批准记录，不反复让用户审核。实际开工与待办分开，不能虚报后台工作。旧“红先”及技能模式汉先的设计记录保留，楚先仅作诊断候选。

## 8. 下一项可执行任务

收到具体工作授权后，先做A6证据补全单：核对h1/f组引擎与权重快照、完整开局及异常/无胜者原因；查两类开局考题和人工到位批准；再由Balance确认统计解释并形成有编号回执。当前已有结果足以避免重复排相同模拟。若需新测试，仍按暂停约束及当前用户授权处理，10-16日期到来本身不代表本聊天自动启动。

## 9. 缺失记忆和证据边界

恢复的是仓库保存的部门知识，不是Claude聊天全部记忆。在线拍板答案、ack时间、图片/音频附件、门铃实际送达、未提交对话与临时文件不在已读证据内；未恢复旧提醒，也没有启动永久后台进程。GitHub #1/#5当前评论本次未联网核实；远端引用是本地导入快照，未fetch，不声称代表现在GitHub最新状态。

未逐行审阅全部源码、历史decisions全文、Fable材料、每局棋谱或所有43分支；长文截断的阅读范围已列明。统计表是重新读取存量结果的描述性汇总，没有新的对打、规则验收或用户批准。仅报告原始数据存在不等于历史部门已经阅读并回执。

本次成果：已保存本报告；共享代码、原仓库、分支、线上服务均未修改。没有运行中的模拟、训练、发布或自动通知。
