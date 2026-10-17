# GPT → Claude TD 交接

本文件记录 GPT 交付给 Claude TD 的集成、发布与回滚说明。后续记录加在顶部，保留历史。

## G1 · 2026-10-17 · A 方案软阴影 1.15 与昼夜修复

用户已批准发布 A 方案，阴影遮蔽强度固定 **1.15**，半影增长系数固定 **0.085**。模型、棋盘本色、曝光、灯光颜色及机位不变；只增强部分阴影的遮蔽，不再压低已完全遮蔽的区域。

### 版本与提交

- 正式版本：`2026.10.17-b789d2`。`window.APP_VERSION` 与 `version.json` 一致。
- 源码实现：[e4590525fe369824bad32a62e60c28781942e0b9](https://github.com/liukaidipeng-ops/chuhan_gpt/commit/e4590525fe369824bad32a62e60c28781942e0b9)。它包含前置昼夜修复 [71c29b94a2460756219894f90b626843a64960f4](https://github.com/liukaidipeng-ops/chuhan_gpt/commit/71c29b94a2460756219894f90b626843a64960f4)。本交接提交仅增加文档。
- Pages 发布：[aa40c2a6c77377194549dc255970ca1414d1130c](https://github.com/liukaidipeng-ops/chuhan_gpt_play/commit/aa40c2a6c77377194549dc255970ca1414d1130c)。
- 发布页面 SHA256：`e1bf14a259af5aba61e5f39a303a4ccf0bc4c14332a2ba5e052ee9e3546b2549`。
- [Pages 构建与部署记录 39025183167](https://github.com/liukaidipeng-ops/chuhan_gpt_play/actions/runs/39025183167)。推送不等同部署完成，最终验收结果见本节末尾。
- [试玩页](https://liukaidipeng-ops.github.io/chuhan_gpt_play/)。

### 模块、原因和固定参数

| 模块 | 本次内容 |
|---|---|
| `source/src/environment.js` | 昼夜处理跳过明确标记的对局模型；夜景 program key 保留基材质变体 key，避免模型变黑及不同 shader 变体混用。 |
| `source/src/squads.js` | 队伍根节点、独立旗帜加 `environmentExcluded`；升级、重建、演出继续沿用。 |
| `source/src/soft-shadows.js` | 在 Three r158 的 PCFSoft 分支执行真实深度投影过滤：12 点遮挡搜索、16 点双线性 PCF。默认 A，增长系数 `0.085`。 |
| `source/src/shadow-depth.js` | `shadow = clamp(1 - (1-shadow) * 1.15, 0, 1)`；全亮不变，完全遮蔽不继续压黑。 |
| `source/src/ending.js` | 保存、恢复阴影相机 `left/right/top/bottom/near/far/zoom`，更新投影矩阵并请求必要的阴影刷新。 |
| `source/build.js` | `face` 后、`board` 前加载 `soft-shadows` 和 `shadow-depth`。 |
| `source/test/environment.test.js`、`source/test/ending-shadow.test.js` | 昼夜模型排除、材质变体，以及任意相机参数恢复回归。 |

方向光的 PCFSoft 在 r158 中不读取原生 `shadow.radius` 来控制宽度，本实现才赋予该值实际采样意义。高/中画质仍分别使用 2048/1024 阴影图；`bias=-0.0006`、`normalBias=0.02` 没变。

半影换算读取当前阴影相机的实际宽、高（包含 zoom）及 `far-near`，不能重新写死 `18/39`。结局布景会把相机宽度改为 28/32/40，并把 far 改成80；旧 `restoreMood` 漏恢复 far，会造成返回棋盘后的样式漂移。

共享 uniform 使用 `Float32Array`；已验证 r158 的 `cloneUniforms` 保留该引用，使新增材质与夜景变体读取同一个实时值。升级 Three 时须复验该行为、shader chunk 标记和 Claude 后期的色彩空间处理。

模型接收投影在合批后处理，不在 `Models.fuse` 之前全局开启。隐藏骨件、BackSide 描边和透明材质均排除；中画质仅给盘上普通实例化小兵补投影。背景营地及其合批深度 shader 保持原逻辑。低画质仍关闭投影，没有新增 AO、全屏模糊或渲染目标。

### 下次发布不要覆盖 Claude 的既有画面改动

本次以最新 Pages `ff6014635bd032c51e67920f1510a9e9ddbd0284` 为底，只替换 `squads/environment/ending`，增加两个阴影模块并同步正式版本。其余27个现有模块原字节保留；配音、音效、音乐与 `.nojekyll` 均未改。

源码 main 尚未完整收回 Claude 已在 Pages 发布的画面内容。发布前读取 `claude/visual-atmosphere` 上的 `source/docs/collab/claude-to-gpt.md`；本次核对分支 HEAD 为 `3d604a8049739ae80a1985cc795d93620de1f304`。薄雾、地面纹理、`post.js`、移轴设置和清晰带跟随棋盘仍需在源码集成时保留。

**禁止把未整合这些内容的旧 main 构建结果整页覆盖 Pages。** 先按模块比较最新 source、Claude 分支和 Pages，再集成已发布画面改动；遇到新提交重新检查，只做快进推送，不强推。本次 `npm run build` 验证的是源码可构建，生成的 `a21b2e` 是验证产物，没有拿它覆盖正式 `b789d2`。

### 验证和性能边界

- 构建通过；`npm test` 的 rules、jieqi、bingfa、engine、game-issue-repo 全部通过；两个专项测试通过。
- 最终 Pages 文件以正常 `Core.render=true`、ECO开启、移动视口夜景启动验证：32个模型、A/0.085/1.15、无 shader 或 WebGL 错误。
- PC高画质1280×800、移动中画质390×844；昼夜切换、模型开关、升级重建、重开、移轴兼容通过。移动视口是触屏模拟，不是物理手机。
- 相机修补前后常态 A/B 四组，棋盘和模型区域像素一致；河面仅0–11个像素微小差异。
- 三种实际结局布景渲染后走现有跳过/清理路径，返回及重开均恢复18×18×39、far40。没有跑完整长结局。
- 正常 ECO 回归不开 `norender`，不由测试手动 `render/sync/needsUpdate`。走子、落地、静止均自动刷影；静止观察4.403秒、9帧、2次阴影更新。不要据此宣称所有设备都在0.5秒墙钟内更新，低帧率下已有dt封顶会延长实际间隔。
- Chromium154.0.8037.57、Playwright1.62.0、Linux x86_64、ANGLE SwiftShader软件GPU。预热冻结场景14–18ms不能代表首次/动作帧：原始冷启动、动作、升级、首次移轴记录含 **1.05–3.94秒**。这不是实体手机性能结论。
- 中档小兵补投影增加 **154 draw calls，约9.1%**；高档 draw calls 不变。A加深本身没有新增 pass 或 draw call。
- 物理Android/iPhone、硬件GPU、Safari/WebGL1、在线多人和声音再生成未在本轮验证；本次没有修改AI、规则、服务权限或付费资源。

### 回滚

上一个已知 Pages 基线是 [ff6014635bd032c51e67920f1510a9e9ddbd0284](https://github.com/liukaidipeng-ops/chuhan_gpt_play/commit/ff6014635bd032c51e67920f1510a9e9ddbd0284)，版本 `2026.10.17-e81b5c`，包含此前 Claude 画面更新。需要回滚本次发布时，以新的 revert 提交撤回 `aa40c2a6c77377194549dc255970ca1414d1130c`，同时恢复匹配的 `index.html/version.json`，随后重新核验 Pages；不要 reset 后强推。

源码回滚参照发布前 `81b18f1dd569aecce903a4aea63f4fba60e57624`，按逆序 revert `e459052`、`71c29b9` 并复测，保留交接历史。完整回滚同时撤掉本次软阴影和昼夜修复；只需撤阴影时应保留昼夜修复并另行构建验证。

### 部署验收

源码和 Pages 已快进推送。部署运行 `39025183167` 于 **2026-10-17 10:31:20 UTC** 完成，结论为 **success**；build、report-build-status、deploy 三个 job 均成功，`Deploy to GitHub Pages` 步骤成功，运行对应的 head SHA 正是 `aa40c2a6c77377194549dc255970ca1414d1130c`。

独立 CDN 读回尚未完成：验证连接在 CONNECT 阶段返回403，未取得网站本身的 HTTP 响应。这不等同于站点返回403，也不能用源码推送或仓库文件替代 CDN 验收。后续从可访问的网络读取试玩站 `version.json`，应得到 `2026.10.17-b789d2`；页面 APP_VERSION 应一致，HTML SHA256 应与上文相符。
