# TD（技术总监）部门接管记忆

保存日期：2026-10-12（北京时间）。本轮交付：只读恢复部门记忆并形成证据清单。没有修改共享游戏文件、切换共享分支、操作原仓库、启动长期训练、发布或向其他聊天发消息。

## 1. 职责与禁止越界事项

TD 负责规则引擎、游戏流程、技术整合、构建、测试与经授权的发布。规则相关入口是 rules.js、bingfa.js、engine.js、jq.js；流程及联机为 main.js、net.js；场景整合为 core.js、board.js、squads.js、bfx.js、ending.js；构建与验证为 build.js、test/、TD 工具和工作流。

Balance 负责 AI 调参与数值证据，角色部负责模型绑定和局内动画，美术总监负责 UI、棋盘和技能视觉，声音部负责声音素材及音频引擎，优化部负责测量和补丁，顾问部提供方案，CG 组负责过场。TD 负责把已交付内容接进游戏，不能以整合职责代替设计批准。

当前用户约束优先：原 C:/Users/PLKD/Documents/GitHub/chuhan_v01 严格只读；所有未来开发仅在 chuhan_gpt 新副本，按 CODEX-WORKFLOW 使用 codex/<事项> 分支与 PR。旧文档的 dev:main 直推、Claude 签名、门铃、自动唤醒均是历史机制，不是当前授权。此次只允许本聊天输出目录保存报告。

## 2. 证据来源与已读资料

读取基线：本地 main = 11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5，根 version.json 为 2026.10.11-e897b3。origin/* 是导入的本地远端跟踪快照；本轮未 fetch，不宣称逐一核实远端当前分支 SHA。共享目录原有两个未跟踪文件 CODEX-WORKFLOW.md、source/pnpm-lock.yaml，未改动。

已读当前约定：
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/AGENTS.md（工作区文件，无提交标识）。
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/持续推进工作约定.md（工作区文件，无提交标识）。
- C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/CODEX-WORKFLOW.md（共享检出未跟踪文件；不能据此声称 PR 已合并）。

下方附录逐文件给出完整路径、读取分支、提交和阅读范围。WORKFLOW 与 TD-HANDOFF 已分段覆盖核心全文；往来长文主要读最新条目和相关历史条目，未逐行通读所有旧 C/H 记录。首次大批读取被输出截断，后续按章节补读；没有把截断内容算成全部读完。相关代码采用关键段静态阅读，不是全代码审计。

2026-10-12 通过 GitHub 连接器只读查看总表 #1 及其全部评论（返回 1 条）：https://github.com/liukaidipeng-ops/chuhan_gpt/issues/1 。评论 6106675074 记录六组测试通过、构建 c254eb、P6 尚未整合、PR #2 与任务 #3/#4/#5。该评论是总协调的验证报告，不是本轮独立复测。

## 3. 技术标准与验收方法

- 构建：source/ 下 node build.js，产物在 source/dist/site/。根目录七项发布产物由构建复制，不能手改。大音频资源分包，避免塞进首屏。源码换行会影响摘要与按字节加载比例。
- 测试矩阵：rules、engine、jieqi、bingfa、beishui、r6、bfai、bfai.policy。package.json 的 npm test 只跑 rules，不能将它等同完整验收。本轮未运行构建或测试；总表的新副本基线只报告前六组。
- AI 交付：指定补丁和基线，检查能干净应用；历史标准为换边至少 600 局，得分 >50% 且 z≥2。只堵明显笨棋的小修可按不明显变弱（z>−1）和考卷不退步评估。不可整合整个数值分支，把实验带入主线。
- AI 到位标准含新版对上一版得分 <55%、配对自对打汉胜率差的95%区间含0且差≤5个百分点、技能使用率接近、考卷不退步，再由顾问意见和用户试玩确认；不能只看胜率宣布到位。
- 规则改动须区分线上规则、模拟变体、用户已批准试验与批准上线；构建成功不证明平衡成立。
- 视觉整合：追溯批准编号与材料版本；手机390×844、电脑1280×720或1440×900核图。镜头和渲染改动同时看绘制次数、三角形、帧率。无头测量不等于真机温度、电量或微信表现。
- 房间、开局、联机改动需要双端/观众流程回归（nettest2.py、bfnet.py 是历史入口，其硬编码路径需先在新副本适配）。取消、悔棋、后台恢复、观战与规则选项一致性必须覆盖。
- 声音按动画真实事件触发，倍速不靠写死秒数补偿；S6 要避免盾挡重复播放。保留音频来源和署名，不触碰密钥。
- 正式发布还需明确授权、批准材料、测试、NEWS、回滚方案、目标仓库与 Pages 实际成功证据。旧脚本会提交并推送，不可拿来当只读检查工具。

## 4. 已批准决定及证据强度

这里的“已批准”指仓库保存的批准记录，未重新读 Claude 在线 answers/items；不伪造新的人工批准。

| 决定 | 可追溯证据 | 当前解释 |
|---|---|---|
| 背水可同一枚走两步或两枚各一步；最多吃一子；结算不将军、不被将军 | Balance decisions.md 10-04；当前 CFG.beishui.twoPieces=false/maxKills=1 | 不再采用早期“必须两枚不同棋子”的误读 |
| 背水与召回均限己方车马炮≤3且少于对方 | decisions.md 用户更正；bingfa.js 配置及注释 | 同一弱势条件，旧破釜实验不可恢复为现行规则 |
| r6 默认启用、召回按兵种选空起始位置、最高二级、首次升级半价 | dev chat-to-code.md H42用户原话、H43“Ham确认”；07bc0dd部署；当前 CFG.r6.on=true | TD-HANDOFF 的“默认关”已经失效，代码中的旧注释也未同步 |
| 兵仙另开档，霸王不变 | Balance ai_time2=a、C70；TD H68记td-031/032批准 | 当前参数约三倍思考；真机发热当时未测，不补写通过 |
| 省电动画最多60帧 | perf-to-main.md P6：10-11 02:42 p-07甲；补丁 | 已批准、已交付，尚未整合，无需把它重新说成待用户选方案 |
| M34+S6 全屏兵卒对打上线 | 439ef10合并、819eda0部署bf7fd0；角色 decisions 12:25记录td-035直接批上线 | 比旧“等录像批准”记录更完整；仍缺3/4级录像 |
| 对打改为棋盘内演，cine/std均显示，low不演 | dev main-to-model H38；model-lab 9fe6264决策回执 | 新需求已确认，但新样片尚未批准、新接口未交M35 |
| V19俯瞰棋子反光修正 | V19记录ad-041；a7d328b实现、11738bf部署；dev T20 | 已有历史上线记录，未实机复验 |
| 观战只给局势条，不给推荐走法 | T17用户原话，V17 ad-039甲 | 局势条不是场外指导界面 |
| 飞越/踏营改被动、象相不受拒马反伤 | H58/H59、H60/H63；当前skills配置 | 保持旧棋谱主动接口兼容，不把历史主动形式当新局行为 |

## 5. 最新交付、上线与待办对账

| 事项 | 核对结果 | 仍未完成或未核实 |
|---|---|---|
| C72硬截止+H71保险 | bfai.js有75%/90%硬截止；main.js有Worker看门狗、后台AI停钟和aiRescue；有H71上线回执 | 用户实际故障对局、慢手机复现未取得；不能保证所有超时已根治 |
| H70困毙搜索想法 | td-stalemate-idea.patch是交给Balance的候选，C72仍记未测 | 强度、速度与合法性验证，不能直接上线 |
| P1–P5 | main-to-perf H2–H6记已接上线 | 不是“优化部还没有交付”；P6另列 |
| P6 | 当前core.js只有静止64ms节流，缺nextDraw；与P6补丁逐段对照一致 | 待任务#3整合、刷新率测量及回归；本轮不应用补丁 |
| M34/S6与H38 | 当前squads.js仍cine限定、Duel.play未传scene；新需求未落地 | 角色部先出主场景版本及可审录像；TD后续整合、处理+1功遮挡 |
| M31–M33火象 | 有模型交付及H35–H37回执；后续4bbf193把旗杆根插入塔顶0.28格，1fa2b92部署 | 不再按H36旧的+0.15高度复原；动作逐帧/真机限制保留 |
| V17观战局势条 | 当前main.js包含lbHostOut；01b8f91和57ac5d7已加技能独立线程及显示延迟结果 | T18和交接中“房主暂没有”过时；走子更新、长局、真机仍需验证 |
| V18/V19 | T19/T20及合并部署可对应，根版本e897b3 | 只读核对，无新仓库线上验证 |
| S7长考自言自语 | main-to-sound H7记上线；六句，前句未完不出后句；想满3秒后每5秒三成机会 | 不按H6早期“2秒内”去裁已选3.6–6.3秒配音 |
| 房主小人td-034 | td/hostspec快照d393aa9；交接记用户选乙并往后放 | 没有确证功能完成；与局势条房主支持分开记录 |
| CG G1/H1与拍板记录 | decisions-CG组.md记录cg-002于10-10 20:57选甲“预渲染视频”，cg-003同刻选乙“最后一战＋拔剑”；G1/H1的待定描述已过时 | cg-009关键样帧、cg-010粗剪于10-11 09:09均“要改”；在线数据库与附图未直接读取，不能把方向批准等同成片通过 |
| 顾问A6 | 已定位最新建议：先诊断开局陷阱，不能把AI缺陷直接认成规则失衡 | 后续N号结果本轮未完整复核，不能代Balance宣布收敛 |

新发现的迁移风险：main.js 的 GH_REPO 仍为 liukaidipeng-ops/chuhan_v01，调用路径包含创建对局Issue、追加评论及标签PATCH。开发启用“发给数值部”前必须在新副本核对并隔离这些写入目标。此项比只改部署提示更重要。pages-rebuild.yml 使用 github.repository，没有硬编码原仓库；deploy.sh 最后提示查询旧仓库，但实际 push 使用 origin。必须分别判断，不能混称Pages仍调用V01。

## 6. 对接部门与交付接口

| 对接 | 输入 → TD回执 | 接口重点 |
|---|---|---|
| 总协调 | 总表#1、具体任务及批准 → 交付证据/PR | 原编号保留，新任务和状态可追溯；本轮未写评论或发消息 |
| Balance | code-to-chat C号 → chat-to-code H号 | BFAI apiVersion=1、obsVersion=1；think(...,opt.maxMs)、trace/scoreParts、导出rescue；不要全分支合并 |
| 角色部 | model-to-main M号 → main-to-model H号 | make返回模型组/update等；朝+X、脚底y=0、缩放由小队处理；H38 scene/at/yaw/scale只是建议接口，待正式交付 |
| 美术总监 | ad-to-td V号 → td-to-ad T号 | 样式和画面由美术定，id/data-*及运行逻辑由TD接；素材版本与批准对应 |
| 声音部 | sound-to-main S号 → main-to-sound H号 | audio/endtunes与素材由声音部；触发由TD；Duel onEvent接Sfx.B.duel，不重复挡盾 |
| 优化部 | perf-to-main P号 → main-to-perf H号 | 补丁基线、改前后相同场景数据、真机/模拟边界、视觉批准 |
| 顾问部 | advice A号，经Balance numbers-to-advisors N号 | 建议先转成可检验方案，不能直接改规则 |
| CG组 | cg-to-main G号 → main-to-cg H号 | ending.js由TD；cg-002已选预渲染视频；历史H1提供按需加载、可跳过/失败回退接口建议，尚不代表实现完成 |

## 7. 用户偏好

中文简短、适合手机阅读；每一项问题都答到，做错先承认；给用户看前自行检查。看的给图/视频，听的给试听，设计决定提供明确选项和代价，批过的内容不要反复请求审批。记真实收到时间与处理结果，保存成功不等于通知送达。

用户重视分工、手机发热、加载和动画节奏：省电默认开、保留抗锯齿；提示固定在棋子头上；弹框居中；兵卒对打在棋盘里发生。历史暂停耗额度工作至10-16是约束记录，本聊天没有据此创建自动化或承诺到时自动运行。当前工作先恢复记忆，明确任务之后再实施。

## 8. 下一项可执行任务

建议先由总协调明确分派“新副本外部写入目标核对”：列出GH_REPO、发布提示、测试路径、联机命名空间和新仓库设置依赖，形成可审清单，再在独立开发副本做必要迁移修复。验收必须证明所有写入不会落到原仓库；不需要先公开发布。

随后可处理已有明确批准的P6（任务#3）：取指定补丁、核对基线、限于core主循环，验证60/90/120/144Hz动画、静止、ECO关闭及切换场景，再交PR；不在本轮实施。H38依赖角色部的新样片与交付。困毙搜索改法依赖Balance验证，不能排在资料接管时偷偷运行。

## 9. 缺失记忆与证据限制

- 没有原聊天完整内容、Claude在线审批answers/items、附件实时版本、通知运行状态和提醒权限；仓库底稿不等于在线数据库。未核实的条目标待核实，不等于未批准。
- 未将他人的摘要当独立实验证据：六组新副本测试/构建与五个音频包一致来自总表评论；本轮只完成文件、Git历史与源码检查。
- 未逐一读取43分支全部文件；相关工作流和交接深入阅读，长历史往来按当前职责选读。未播放全部录像、试听声音或实测游戏；未复跑AI与联机。
- 未核实新仓库Pages是否启用、Secrets、Actions权限、PR#2现状及所有相关任务新评论；#1和返回的全部评论已直接读取，其余链接仅作入口。
- 已保存历史批准原意与出处，不冒充Claude签署，不把旧部门负责人设定当自己的真实资历，不宣称恢复了不存在的在线记忆。

本轮完成时没有后台任务。收到具体实施任务后，先核对总表和相关任务最新评论，再按本报告追溯对应证据。

## 附录：逐文件读取定位

- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/WORKFLOW.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文；dev末节交叉核对
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/TD-HANDOFF.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：分段阅读职责、构建、代码地图、交付、暂停、审批、偏好、交接
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/README.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文；早期机制仅历史参考
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/chat-to-code.md
  - 分支：origin/dev；读取快照提交：00a94acd1a3f5395efdf412d06c585e0d28139b4
  - 范围：H71至H58及H42/H43等相关历史条目
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/code-to-chat.md
  - 分支：origin/claude/gallant-planck-rwr5az；读取快照提交：8c2b08c3adab8ac16e3b34b7814815ab79325a8c
  - 范围：C72至C68；main早期副本部分条目
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions.md
  - 分支：origin/claude/gallant-planck-rwr5az；读取快照提交：8c2b08c3adab8ac16e3b34b7814815ab79325a8c
  - 范围：最新10-11/10-10决定及10-05、背水/召回相关历史
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：旧副本10-04/10-03决定；与部门分支交叉核对
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/main-to-model.md
  - 分支：origin/dev；读取快照提交：00a94acd1a3f5395efdf412d06c585e0d28139b4
  - 范围：H38至H31相关条目
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/model-to-main.md
  - 分支：origin/model-lab；读取快照提交：9fe626457b78b3d9132141055a7199c052cf3da1
  - 范围：M34至M31
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions-角色部.md
  - 分支：origin/model-lab；读取快照提交：9fe626457b78b3d9132141055a7199c052cf3da1
  - 范围：9fe6264增量及相邻12:25/12:38回执
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/HANDOVER-美术.md
  - 分支：origin/model-lab；读取快照提交：9fe626457b78b3d9132141055a7199c052cf3da1
  - 范围：前42行：职责、批准、交付、文件归属
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/MODEL-WORKFLOW.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：前75行：接口、坐标、动作标准
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/ad-to-td.md
  - 分支：origin/claude/art-director；读取快照提交：d24fff0212beae1056a7b7c0f99bc8da0e6737e5
  - 范围：V19至V17及相邻交付
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/td-to-ad.md
  - 分支：origin/dev；读取快照提交：00a94acd1a3f5395efdf412d06c585e0d28139b4
  - 范围：T20/T19；main T18至T4等回执
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/perf-to-main.md
  - 分支：origin/claude/perf；读取快照提交：2deb10e7049a0ea0b133be81df5ad13ae61bf69c
  - 范围：P6、兵仙性能核对、P5/P4
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/perf/P6-eco-60fps.patch
  - 分支：origin/claude/perf；读取快照提交：2deb10e7049a0ea0b133be81df5ad13ae61bf69c
  - 范围：全文对照主循环，未应用
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/main-to-perf.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：H1至H6全文
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/sound-to-main.md
  - 分支：origin/claude/sound；读取快照提交：54ea485432df4b560c73c067cd250b5141e8b16b
  - 范围：S1/S2/S3与S6/S7
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/main-to-sound.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：H7至H2相关回执
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/SOUND-WORKFLOW.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：前40行：职责、素材与触发边界
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/cg-to-main.md
  - 分支：origin/claude/cg；读取快照提交：103ff621b515caf1d69903fec5ea35ba395ad143
  - 范围：G1全文
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/main-to-cg.md
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：H1全文
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/advisors/advice.md
  - 分支：origin/claude/advisors；读取快照提交：a401479c892c7881dcd52f446cdef4c6ae4adad5
  - 范围：最新A6及A5开头，未完整核对后续N号
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/build.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：前75行打包加载顺序、分包、版本、输出
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/package.json
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/tools/td/deploy.sh
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文，未执行
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/.github/workflows/pages-rebuild.yml
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文，未触发
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/bingfa.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：配置前85行，r6/beishui与技能
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/core.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：主循环270行起及P6符号检索
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/squads.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：1350行起对打集成和S6事件
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/main.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：AI保险、局势条、GH_REPO写入路径等关键段
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/src/bfai.js
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：maxMs硬截止、apiVersion/obsVersion相关段
- 完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/version.json
  - 分支：origin/main；读取快照提交：11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5
  - 范围：全文

## 补充核验：CG 拍板记录纠正（2026-10-12）

本次亲自使用 git show 103ff621b515caf1d69903fec5ea35ba395ad143:source/docs/collab/decisions-CG组.md 读取全文，而非据总协调转述直接认定。完整路径：C:/Users/PLKD/Documents/Codex/2026-10-11/w/outputs/chuhan_gpt/source/docs/collab/decisions-CG组.md；分支 origin/claude/cg；快照提交 103ff621b515caf1d69903fec5ea35ba395ad143。已读资料清单增至34项仓库文件。

- cg-002：10-10 20:57，选甲“预渲染视频”。技术形式已有仓库保存的批准记录，不再列为待拍板。
- cg-003：同刻，选乙“最后一战 + 拔剑”。制作顺序已有批准记录；随后cg-004另批乌江全面返工，不能把顺序选择解释为禁止乌江返工。
- cg-006造型、cg-007亭长、cg-008分镜分别有通过记录；批准范围只限对应材料。
- cg-009：10-11 09:09关键样帧“要改”，记录含8张反馈截图的说明。需处理头盔内部、老人特写和帽子、箭插入、构图、接缰绳重复、下马镜头与剪辑、回头镜头及节奏等问题；用户要求消化反馈、自审、整理文档后暂停。
- cg-010：同刻75秒粗剪“要改”，同cg-009并强调“剪辑节奏整体偏慢”。不能当已批准影片交TD上线。
- 用户在反馈中明确镜头与表演节奏优先于音效，必要时允许临时配音占位；这不替代最终声音素材审核。

证据边界：上述结论来自部门拍板记录原文，在线数据库、8张标注图及视频本轮未读取。旧G1/H1的“等Ham定”被具体编号、时间与选项纠正，并非仅因为文件较新。报告中 main.js GH_REPO 指向原仓库的写入风险继续保留为优先迁移检查项；本轮只修正文档，未改代码。
