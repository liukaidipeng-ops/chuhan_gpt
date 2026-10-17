# 楚汉审批台（统一版）

一个页面装下所有部门要 Ham 定的事：看的（图、录屏）、听的（配音、音乐、音效）、文字拍板（选方案）。Ham 只开这一页，按部门筛选，点选后「全部提交」一次交齐，只发一条通知。

- 页面：https://claude.ai/artifact/54kSdoofarWafayd9DUjou ；源码 `source/tools/shenpi-hub/index.html`（分支 `claude/shenpi-hub`）。
- 发布能力：`{"db":{"rules":[{"path":"","read":"view","write":"admin"}]},"user":{},"comments":{},"assets":{}}`。改源码后用 Artifact 工具按原地址重新发布。
- 照 `WORKFLOW.md` 第 3 节的审核页面规范做：一件一张卡、要改必须写备注、截图标注、全部提交、只通知一次、回执、撤回。

## 部门怎么用（Claude 会话里）

### 1. 收通知：盯住这个页面
用 `ArtifactComments` 工具 watch 本页地址。Ham 提交后，页面替他发一条评论给 Claude，所有在看的会话都会收到；按评论里的「▸ 部门名」找自己的件，别的部门的件不用管。
评论发不出去时，页面会如实写「没通知到」，并请 Ham 在聊天里说一声；所以**回复 Ham 前先读一遍 `decisions`**，按实际状态说。

### 2. 送审：往 `items/<编号>` 写一张卡
用 `ArtifactData` 的 `set`，文档 id 就用卡片编号（如 `char-031`），方便对上通知。字段：

| 字段 | 必填 | 说明 |
|---|---|---|
| `dept` | 是 | 部门名，和 WORKFLOW 部门总表一致：TD、角色部、美术总监、声音部、CG组、优化部、数值部、顾问部 |
| `code` | 是 | 卡片编号，同文档 id |
| `title` | 是 | 一句话标题 |
| `ask` | 是 | 要 Ham 定什么，一句话 |
| `points` | | 要点数组：背景、数据、Ham 原话 |
| `kind` | 是 | `approve`（通过 / 要改 / 暂缓）或 `choice`（选方案 + 都不合适 + 暂缓） |
| `options` | choice 必填 | `[{key, label, desc, pass}]`，2～4 个，desc 写代价 |
| `pass` | 建议 | 「通过」允许做到哪一步：`方向`（只认方向，正式版再送审）、`整合`（可接进游戏测，不等于上线）、`上线`（可交 TD 上线，只限本卡的候选和范围）。没写按「方向」理解。choice 的每个选项也可以单写 `pass` |
| `rec`, `recWhy` | 建议 | 推荐哪个（approve 卡写 `approve`），为什么 |
| `candidate`, `baseline` | 建议 | 候选版本、对比的基线版本 |
| `scope` | 建议 | `{in: [...], out: [...]}` 这次包含 / 不包含什么 |
| `checked`, `unchecked` | 建议 | 已测的、没测的（没测的会标红，比如「真机」） |
| `media` | | `[{type: image\|video\|audio, id 或 url, cap, src}]`；`src` 写材料来历：`实机`、`录屏`、`真机`、`浏览器模拟`、`效果图`、`样片`、`小样`（模拟类会标黄） |
| `rev` | | 版本号，从 1 起 |
| `state` | | `open`（默认）、`closed`（部门关掉）、`superseded`（被新卡替代） |
| `createdAt` | 是 | ISO 时间 |

**素材**：用 Artifact 工具 `asset: true` 把图、视频、音频传进本页素材库，结果里的 `url` 填进 `media`；也可以填别的公开 https 地址。图上传前确认是真的那一版的截图。

**改了再送审**：别改已经被批过的卡的内容。在同一张卡上把 `rev` 加 1、换上新材料（`set` 整张写），页面会把它放回待批，标「第 N 版」，并显示上一版 Ham 选了什么。上一版的决定不带到新版。

### 3. 读答案：`decisions/<编号>`
`{rev, status, choice, label, pass, note, images, at, batch, snap, history}`
- `status`：`approved` 通过、`chosen` 选了 `choice`、`changes` 要改 / 都不合适、`hold` 暂缓；空串表示 Ham 撤回了（看 `withdrawnAt`）。
- `rev` 小于卡片当前 `rev`，说明这是旧版的答案，不算数。
- `pass` 是 Ham 实际批到哪一步。**只有 `pass` 是 `上线` 才能交 TD 上线**，而且只限 `snap` 里记的候选和范围。
- `snap` 是提交那一刻 Ham 看到的编号、候选、范围、材料；`history` 留着之前的决定和撤回。
- 照 Ham 原话记进本部门的拍板记录（WORKFLOW 第 1 节）。

### 4. 写回执和进度：`receipts/<编号>`
收到后**每件都要写回执**（WORKFLOW 第 3 节第 6 条），页面才亮「✓ 已收到」：
```json
{ "ack": { "at": "2026-10-17T10:05:00+08:00", "text": "收到，下午出第 2 版" },
  "log": [ { "at": "…", "stage": "doing", "text": "在改金甲配色" } ] }
```
- `ack.at` 必须晚于决定的 `at`，不然页面当作还没收到（Ham 再改再交，要重新写）。
- `log` 只追加，不删不改：`accepted` 已接手、`doing` 在做、`blocked` 受阻（写原因和下一步）、`review` 等复审、`done` 做完、`live` 已上线、`cancelled` 取消。
- 写 `live` 要有证据（上线版本号、线上地址）；构建成功、合并、排队都不算上线。
- 回执只写实际做了的事，没做的别写成做了。

### 5. 可选：`depts/<部门名>`
`{note}` 一句话显示在「部门」页（比如「等 TD 回 M30」）。部门页的数字都是从卡、决定、回执算出来的，不用另外维护。

## 页面里各块对应的数据
- 待批：`state` 是 open，且没有当前版本的决定。
- 已批：有当前版本的决定，或部门关掉的卡。显示通知结果（`notices/<批次>`）、回执和最近 6 条进度。
- 撤回：决定放进 `history`，卡片回到待批；按 Ham 定的规矩不发通知。
