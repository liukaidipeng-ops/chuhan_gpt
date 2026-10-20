# 有限补查候选验证 2026-10-20

实验src/bfai-deep-recheck-wide-diagnostic.js SHA256 3caec981b50ce483968b58ba772099aba45da1480d3472d2624627b2d051e87a。此前收入候选、附件基线均保留，不是线上版本替换。

完整10万节点回归已完成：Node v24.22.0/win32（此前部分试验为v24.19.0，墙钟性能不直接比较），34有效题×3种子，noise0/top1；基线96/102，新实验99/102，无新增退步，34项关闭futureIncomeUp对照无差异。7道自检失败题仍排除，41题10万预算仍失败，不能混同原收入候选30万预算102/102。证据local-results-20261019-12/summary.json及records.jsonl。

本轮12项现行规则升级触发边界全部通过（红黑各6项；收入前、阶段2/3入口、折扣、已买得起、收入仍不足）。正例实际ply2升级访问红15次黑14次，负例0次。使用记录副本src/bfai-recheck-boundary-audit.js，不覆盖候选；脚本tools/income-recheck-boundaries.js、结果local-results-20261020-01/boundaries.json。测试固定3层，验证升级边界，不是补查深层行为的充分覆盖。

已启动4局同开局验证：tools/income-recheck-opening-pairs.js，输出local-results-20261020-02，horses seed61003 / cannons seed61004，各候选执红黑。规则bs/r6=true、hard、nodes30000、noise.05/top1、最多160搜索行动；与旧试验相同开局及种子，仅换候选文件。未完成前不能报告棋力结果。下一次接续先查results.jsonl、failure.txt，重放合法性并对照旧horses2胜/cannons2负。

WORKFLOW与审批台已核对，无待回执。A6未过、A3正式门禁关闭、H70未完成600局，兵仙输霸王仍未修复，历史93/122不变。未合并、部署或改原V01。
