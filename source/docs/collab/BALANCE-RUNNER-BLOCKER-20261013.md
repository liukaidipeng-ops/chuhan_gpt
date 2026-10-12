# Balance GitHub Actions 执行器阻碍报告（2026-10-13）

记录时间：2026-10-13 03:18–03:20（北京时间）  
范围：A6 顾问返工、H70 600 局缺失 pair 恢复  
最新工作流规则：`source/docs/collab/WORKFLOW.md` blob `405dd1e12a7af5ace06f5e0e1d813306c370e093`  
审批台“楚汉数值部门Balance”未回执意见：无

## 结论

当前证据只证明 GitHub Actions 没有给这些 job 分配 runner。所有失败 job 都是 `runner_id=0`、`runner_name=""`、`steps=[]`；脚本没有开始，因此不是棋局、A6 答题脚本、H70 JSON 校验脚本或参数验收失败。

GitHub API 的 check-run 记录为失败并各有 2 条 annotation，但现有 GitHub 连接器不允许读取 `check-runs/{id}/annotations`，check-run 的 `output.title/summary/text` 均为空。日志下载对所有抽查 job 返回 `404 BlobNotFound: The specified blob does not exist`。因此目前不能从可访问证据确定是计费、额度、账号限制还是平台 runner 服务异常；不得猜原因。

## A6 顾问返工

返工脚本提交：`20561d436f62e77eea0fa2fb43a64d01831a454c`。旧 12/12 已撤回，A6 保持不通过，A3 正式 600 局门禁保持关闭。

### 运行 38280967990

链接：https://github.com/liukaidipeng-ops/chuhan_gpt/actions/runs/38280967990  
head：`20561d436f62e77eea0fa2fb43a64d01831a454c`

| attempt | exam job | runner | steps | artifact | 结果 |
| ---: | ---: | --- | ---: | ---: | --- |
| 1 | 114917871564 | `runner_id=0` | 0 | 0 | failure |
| 2 | 114932760397 | `runner_id=0` | 0 | 0 | failure |
| 3 | 114933417838 | `runner_id=0` | 0 | 0 | failure |

最新 check-run 有 2 条 annotation，正文不可由当前连接器读取；对应日志接口返回 `404 BlobNotFound`。

### 运行 38285761948

链接：https://github.com/liukaidipeng-ops/chuhan_gpt/actions/runs/38285761948  
head：`aa2d2bb589658ea4bba95fa5d13c86d999d16969`

| attempt | exam job | runner | steps | artifact | 结果 |
| ---: | ---: | --- | ---: | ---: | --- |
| 1 | 114933624136 | `runner_id=0` | 0 | 0 | failure |
| 2 | 114959244413 | `runner_id=0` | 0 | 0 | failure |

最新 check-run 有 2 条 annotation，正文不可由当前连接器读取；对应日志接口返回 `404 BlobNotFound`。

## H70 缺失 pair 恢复

恢复运行：https://github.com/liukaidipeng-ops/chuhan_gpt/actions/runs/38295458739  
触发 head：`ff393b4e7798ce5f96b999109b65cf601821db2d`  
原运行：https://github.com/liukaidipeng-ops/chuhan_gpt/actions/runs/38268266763

原运行已结束。GitHub Artifacts API 当前列出 36 份 `h70-chunk-*` artifact，均 `expired=false`；其中 chunk 9 为 artifact `11767218775`，digest `sha256:d3b5b8c4fe1fcb70806298ee3c3b718d22bf4397f7334c12e11dfaed7d121d3b`。这只证明 artifact 在 API 中存在；恢复工作流里的 JSON 内容硬校验和 90 日保全尚未实际执行。

恢复 run 两次尝试的结构相同：

| attempt | 执行 job | runner | steps | collect | artifact |
| ---: | ---: | --- | ---: | --- | ---: |
| 1 | preserve 1 + recover pair 84 | 85 个全部 `runner_id=0` | 全部 0 | skipped | 0 |
| 2 | preserve 1 + recover pair 84 | 85 个全部 `runner_id=0` | 全部 0 | skipped | 0 |

attempt 2 的 86 个 check-run 中，85 个 failure 各有 2 条 annotation，1 个 collect 为 skipped 且无 annotation；所有 check-run 的 `output.title/summary/text` 为空。代表性 preserve job `114965320643`（attempt 1）和 `114966122450`（attempt 2）的日志接口均返回 `404 BlobNotFound`。

因此 H70 尚未完成缺失 14 个 chunk 的 84 个换边 pair，也未达到 `games=600`、`unique=600`、`errors=0`；不得计算或宣称 Elo、z 值及棋力准入结果。

## 恢复条件与下一步

1. 暂不继续盲目重跑或创建新触发提交。
2. 只有新的 GitHub Actions 任务实际出现 `runner_id != 0` 且 `steps` 非空，或 GitHub 页面/API 明确给出可执行的账号、额度、计费或平台处理结果，才视为执行器有实质恢复。
3. 恢复后只重跑现有 A6 exam 和 H70 缺失任务；不改版本、节点、种子、换边、runner 标签或仓库可见性，不购买资源绕过限制。
4. A6 运行后读取原始 JSON并如实判分，再交顾问独立复核；A6 完成前继续保持不通过，A3 门禁关闭。
5. H70 先执行 36 份原 artifact 的 JSON 硬校验与保全，再执行 84 个缺失 pair 和 600 局唯一性/错误数汇总。
6. 若后续仍只能看到 annotation 数量而读不到正文，继续把“具体原因不可访问”列为证据缺口，不推断根因。
