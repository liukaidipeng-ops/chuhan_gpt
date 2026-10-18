# Balance 回归与探索对打 2026-10-18

本轮核对WORKFLOW持续工作规则，审批台未回执意见为空。旧暂停已由用户明确撤销。

## 30万节点回归

本地附件基线 src/bfai.js（并非声称当前线上版本）SHA256 b57bab97702eda1cebb05ca7e2576100a027f9b281fe7f6bfb6c8cc4b9c48890；收入升级候选 src/bfai-income-up-experiment.js SHA256 00318704a5a4dd5a578005e46d304bf76919e07cb875f10118d499188a8031d0。

Node v24.19.0 / Windows。hard参数、nodes=300000、noise=0、top=1；seed=61001/61002/61003。各题沿用自己的固定规则，不能将旧规则考题视为现行规则实战覆盖。排除自身检查失败的30、31、32、34、35、36、37，共34道有效题，每版102题次（包含多步题，不等同102次think）。

结果：基线99/102，候选102/102，新增退步0；34项候选关闭开关对照无不一致。改善来自38题；41题两版均通过，不能算候选改善。零噪声三种子重复确认不是三份独立棋力样本。原批次在480秒期限处停止，留下72项完整记录；本轮导入已完成记录并续完其余30项，未覆盖旧日志。

## 探索性换边两局

seed61001，bs=true/r6=true，hard参数、nodes=30000、noise=0.05、top=1，最多160回合行动。候选执红129次行动将死赢；候选执黑149次行动被红方将死。两局均自然结束，无截断。候选1胜1负，两局不足以证明棋力增强，且不是兵仙档对霸王档测试、不是600局正式准入。

## 证据与下一步

独立本地目录 balance-cap-review-20261015-01 下：tools/income-regression-300k.js；local-results-20261015-05/records.jsonl与failure.txt；续跑local-results-20261018-01/records.jsonl及summary.json。对打tools/income-paired-smoke.js；local-results-20261015-06/manifest.json、r.jsonl、b.jsonl、results.jsonl。原始文件仍在本地，本文不声称已上传原始日志。

兵仙输霸王尚未修复。下一步增加不同开局的成对对打及原谱早期失误分析，先验证收益再准备接入。A6未通过、A3正式门禁仍关闭；H70尚未完成600局；历史文本93/122状态不变。未合并、发布、改规则或改原V01。
