# 部署补丁：release-r11（新霸王，供实测）

> 分支：`ai/rel-r11`（基于 **main**，即当前线上 2026.10.22-845ec5 的 main/release-r2 系——带预想接口）
> 状态：**只供实测，未合并 main**。合不合并、用哪个方案，等用户/产品确认。

## 一、改了什么
1. **`source/src/bfai.js` 换成“main + 本回合 r11 修法”的合并版**：
   - **保留 main 的全部现有能力**：预想接口（ponderStart / ponderMove / ponderStop / ponderInfo）、MCAP、T6、TTD、BMH、PVS、SPEND、C70/C71/C72（兵仙档/看钟/硬截止）等；
   - **加入 r11 的 5 项修法**（考卷 198/198、K19 防守题云端正式复核过）：
     - CAPTIE：平局带优先吃子（修 K12-1 类“先升炮再吃”）
     - SPD：神速营提前量（修“升四级兵贴脸两步杀”；r11 版为“旧档 ×6 + 窄档 ×1.25”，只放大不砍基础预算）
     - PUPD：根上“顺手升兵”降权（修实27 类“吃子前乱升级”）
     - UPQ：实9 修法（大优局面根上“升+静着”候选复核/降权）
     - DPNT：升兵贴脸防守（窄档危险 + threatFace 才枚举对方第 3 层升级 + 根上补升士/相防守候选）
   - 同时打开 r4 系开关（ATKUP / CAPUP / UP3L / CAPUP2：main 里代码已存在但默认 ENV 关，r11 需要它们通过 K12-1/K18 等考卷）。
2. **霸王档预算 `LEVELS.hard.budget` → 6500**（方案 A：现有 main 基础上多给 1.5 秒/步；仓库 main 上原值 3000，线上实测配置按 5 秒口径，所以这里直接落成 6500）。
3. 备用 **`source/docs/deploy/rel-r11/bfai-r11s.js`**：方案 B 用（带“提速 getter”：时间制下霸王预算 ×1.48，等效约 9.6 秒/步）。

## 二、两个可选方案（二选一）
- **方案 A（默认，本分支现状）**：`r11`（无 getter）+ 每步 **6.5 秒**。
  - 特点：比现在多约 1.5 秒/步，等待增加温和；预计强度在“纯 AI 增量 + 1.5 秒红利”之间（诚实对照批次出数后补精确区间）。
- **方案 B**：`r11s`（带提速 getter）+ 每步 **6.5 秒**（getter 等效约 **9.6 秒/步**）。
  - 特点：对现线上 **实测口径 65.7%**（600 局，95% 61.9–69.5%）就是按这个配置测的；但明显更慢。
  - 切换：
    ```bash
    cp source/docs/deploy/rel-r11/bfai-r11s.js source/src/bfai.js
    cd source && node build.js
    ```

## 三、怎么拉下来实测
```bash
git fetch origin
git checkout ai/rel-r11
cd source
npm ci
node build.js          # 重新打包 index.html（把 bfai.js 内嵌进去）
npx serve ..           # 或 python -m http.server，打开仓库根 index.html
```
技能模式 → 人机对战 → 霸王，重点感受：①是否还被过河升兵贴脸打穿；②大优局面是否还走废着/乱升级；③每步等待时间是否可接受（方案 A 约 +1.5 秒/步；方案 B 约 +4～5 秒/步）。

## 四、怎么回退
```bash
git checkout main -- source/src/bfai.js
rm -rf source/docs/deploy/rel-r11
cd source && node build.js
```
或直接 `git checkout main`（丢弃本分支）。

## 五、预想接口：实现在哪、会不会冲突（重要）
- **预想实现在 `source/src/bfai.js` 里**：`ponderStart / ponderMove / ponderStop / ponderInfo` 四个函数 + `think()` 里对 `opt.ctl` 的处理（`const ctl = opt && opt.ctl;`、`deadline = ctl.end` 等）。
- `main.js` 只负责接线：Worker 发 `{ponder:'start'|'move'|'stop'}`（main.js 约 1071–1085 行）；AI 文件没有这些字段时会被当作空操作。
- 本补丁的整合点与冲突检查：
  1. `think()` 里 r11 的 SPD/DPNT 会临时改 `L.budget`/`L.nodes`；**预想期间（ctl 存在）随后会覆盖 `deadline/nodeCap`，所以 SPD 的预算放大对预想无效（安全，不会把预想拖长）**；
  2. 原 r7 代码 `min(budget×k, 5000)` 会在带 getter 时把预算砍回 5000 —— 本补丁已改成 `max(base, min(base×k, cap))`，**方案 B 的 6.5s 不会被砍**；
  3. r11 与预想没有字段名冲突；唯一人工整合点是 `const ctl = opt && opt.ctl;` 这行（合并时已恢复）；
  4. main 的 MCAP/T6/TTD/BMH/PVS/SPEND 逻辑全部保留（它们由 ENV 变量控制，网页里默认不开，行为与 main 一致）。

## 六、实测口径与诚实预期
- **对外主口径**：新霸王对现线上霸王 **65.7%（600 局，95% 61.9–69.5%）**。
  - 测量配置：新侧 = 6.5 秒 + 预想 15 秒 + 提速等效；旧侧 = 5 秒裸配置。→ 是“新配置 vs 旧配置”，**不是纯 AI 文件增量**。
- 纯 AI 文件同条件（对认证版 r1，5 秒）约 48.8%；诚实对照批次（r11 vs 线上文件，同时限、无 getter/预想）出数后补“方案 A 上线预计区间”。
- 考卷：最终题面 **198/198 满分**；K19-1 防守题云端正式复核 **过**（10 种子×250k，9/10 军功、7/10 局面分）。
- 结论：要稳、少等待 → 方案 A（预计低于 65.7%，待实测校准）；要 65.7% 实测口径 → 方案 B（明显更慢）。

## 七、注意
- 基于 `main`（1bb28bb1）做的合并；**只改了 `source/src/bfai.js` + 新增 `source/docs/deploy/rel-r11/`**，未动 main。
- `bfai.js` 在浏览器/Worker 里运行，**不依赖进程环境变量**；合并后已做语法检查、node 制考卷冒烟（K12-1/实9/实27/K18-2 各 1/1）、以及 ponder API 导出检查。
- 用户确认后再走正常审批/发布流程。
