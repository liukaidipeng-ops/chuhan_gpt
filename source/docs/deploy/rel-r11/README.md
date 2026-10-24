# 部署补丁：release-r11（新霸王，供实测）

> 分支：`ai/rel-r11`（基于 **main = 线上 2026.10.22-845ec5 线**，带预想接口）
> 状态：**只供实测，未合并 main**。档位选哪个等用户拍板（每步思考时间会变慢，见下）。

## 0. 线上真实基准（务必先看）
- 线上构建（2026.10.22-845ec5，main 线）：`LEVELS.hard = { budget: 3000, dyn: 2.7, ... }`
  → 平时每步约 **3 秒**；难局最多放宽 2.7 倍 ≈ **8.1 秒**。
- `xhard`（兵仙）= 9000ms。
- 所以任何“再加时间”的方案都要按 **3000 基准**算倍数，而不是 5000。

## 1. 改了什么
1. `source/src/bfai.js`（默认档 = 方案 A，`budget: 6500`）：
   - **保留 main 全部能力**：预想接口（ponderStart/ponderMove/ponderStop/ponderInfo）、MCAP、T6、TTD、BMH、PVS、SPEND、C70/C71/C72 等；
   - **加入 r11 五项修法**：CAPTIE（平局带优先吃子）、SPD（神速营提前量）、PUPD（顺手升兵降权）、UPQ（实9 修法）、DPNT（升兵贴脸防守）；
   - 打开 r4 系开关（ATKUP/CAPUP/UP3L/CAPUP2，main 里代码已在、默认 ENV 关）。
2. 霸王档预算 `LEVELS.hard.budget` 由 3000 改为 **6500**（见下“档位表”）。
3. 备用文件（都在 `source/docs/deploy/rel-r11/`）：
   - `bfai-p4500.js` = 同逻辑、预算 **4500**（线上 **1.5×**，中间档）
   - `bfai-r11s.js` = 同逻辑 + 提速 getter ×1.48、预算 **6500**（有效 ≈ **9620ms**，线上 **3.2×**）

## 2. 档位表（相对线上真实 3000ms）
| 档位 | 文件 | 有效预算 | 相对线上 | 难局最坏（×dyn 2.7） | 备注 |
|---|---|---|---|---|---|
| 线上现状 | live 原版 | 3000 | 1× | ≈8.1s | 基准 |
| 中间档 | `bfai-p4500.js` | 4500 | **1.5×** | ≈12.2s | 较温和 |
| 方案 A（默认） | `bfai.js` | 6500 | **2.17×** | ≈17.6s | 推荐起点（若用户能接受） |
| 方案 B | `bfai-r11s.js` | 6500×1.48≈**9620** | **3.2×** | ≈26s | 实测口径 65.7% 就是这档，明显更慢 |
- 切换档位 = 用对应文件覆盖 `source/src/bfai.js`，然后 `cd source && node build.js`。
  例：
  ```bash
  cp source/docs/deploy/rel-r11/bfai-r11s.js source/src/bfai.js   # 切方案 B
  # 或 cp source/docs/deploy/rel-r11/bfai-p4500.js source/src/bfai.js  # 切中间档
  ```
- **最坏耗时提示**：难局（dyn 触发）可能到 预算×2.7；手机/低端机更慢。若用户嫌慢，选 4500 档或 3000 档(不改预算、只换 AI 逻辑)。

## 3. 怎么拉下来实测
```bash
git fetch origin
git checkout ai/rel-r11
cd source
npm ci
node build.js          # 重新打包 index.html（把 bfai.js 内嵌进去）
npx serve ..           # 或 python -m http.server；打开仓库根 index.html
```
人机对战 → 霸王，重点感受：①是否还被过河升兵贴脸打穿；②大优局面是否还走废着/乱升级；③每步等待是否可接受。
（方案 B 平均会到 ~9.6s/步等效，难局更久；不建议手机用户默认用。）

## 4. 怎么回退
```bash
git checkout main -- source/src/bfai.js
rm -rf source/docs/deploy/rel-r11
cd source && node build.js
```
或直接 `git checkout main`（丢弃本分支）。

## 5. 预想接口：实现在哪、会不会冲突
- **预想在 `source/src/bfai.js` 里**：`ponderStart/ponderMove/ponderStop/ponderInfo` + `think()` 对 `opt.ctl` 的处理（`const ctl = opt && opt.ctl;`、`deadline = ctl.end` 等）。
- `main.js` 只负责 Worker 消息接线（约 1071–1085 行）；AI 没有这些函数时当空操作。
- 本补丁整合检查：
  1. r11 的 SPD/DPNT 只临时改 `L.budget/L.nodes`；**预想期间（ctl）随后会覆盖 deadline/nodeCap，预算放大对预想无效（不会拖长预想）**；
  2. 旧 r7 代码 `min(budget×k, 5000)` 会把大预算砍回 5000 → 已改为 `max(base, min(base×k, cap))`，大档位不会被砍；
  3. 无字段名冲突；唯一人工整合点 `const ctl = opt && opt.ctl;` 已在合并时恢复；
  4. main 的 MCAP/T6/TTD/BMH/PVS/SPEND 全部保留（ENV 默认关，行为与 main 一致）。

## 6. 强度实测口径（诚实版）
- **对外主口径**：新配置（6.5s + 预想 15s + 提速等效）对现线上 5s 口径 = **65.7%（600 局，95% 61.9–69.5%）**。
  - 注意：这是 lab 对打口径（两边都 6500 预算 + 新侧预想/提速）；**不是“对真线上 3000ms”的胜率**。
- 正在跑的生产口径档位表（两边都不带预想、旧侧=真线上 3000ms）：
  - `t5-prod-P45/P65/P65s`（4500 / 6500 / 9620 三档 vs 线上 3000），结果出来后补“用户看得懂的档位-胜率表”。
- 考卷：最终题面 198/198；K19-1 防守题云端正式复核过（10 种子×250k）。

## 7. 注意
- 分支基于 `main`（1bb28bb1，线上 845ec5 线）；只改 `source/src/bfai.js` + 新增 `source/docs/deploy/rel-r11/`，**未动 main**。
- 合并文件已做：语法检查、node 制考卷冒烟（K12-1/实9/实27/K18-2 各 1/1）、ponder API 导出检查。
- 用户确认档位后再走正常审批/发布流程。
