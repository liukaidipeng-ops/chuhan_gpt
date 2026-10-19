# 试玩码入口（Ham 10-19）

旧试玩站 chuhan_gpt_play 下线后的新入口：玩家第一次输入试玩码，同一浏览器记住 180 天。验码在服务端，有效码不在前端。

## 怎么挡的
- 一个 Cloudflare Worker 挡在所有游戏文件前面（`wrangler.toml` 里 `run_worker_first = true`）：首页、语音包、贴图、版本文件，没有有效会话一律只给输入页（401）。
- 游戏文件只放进这个 Worker 的资源里，**不进任何 Git 仓库的网页目录**，没有别的公开地址。
- 码只存哈希（Cloudflare KV），明文只在生成那一刻显示一次。会话是服务端签名的 cookie，防改。
- 每次请求都核对这个码的状态：停用后，已经进来的浏览器约 30 秒内也被挡（实例里缓存 30 秒）。换掉 `SESSION_KEY` 密钥可以一次作废所有会话。
- 不限设备数；码被转发别人也能用（Ham 接受）。

## 管码（需要 CF_API_TOKEN、CF_ACCOUNT_ID、CF_KV_NAMESPACE_ID）
```bash
node source/tools/gate/codes.mjs gen 小王 3     # 生成 3 个码，备注「小王」
node source/tools/gate/codes.mjs list
node source/tools/gate/codes.mjs revoke c002    # 停用
node source/tools/gate/codes.mjs replace c002   # 停用并换一个同备注的新码
```

## 上线步骤（拿到 Cloudflare 账号和令牌后，TD 做）
1. `npx wrangler kv namespace create CODES`，把 id 填进 `wrangler.toml`。
2. `npx wrangler secret put SESSION_KEY`（随机长串）。
3. `cd source && node build.js`，再在本目录 `npx wrangler deploy`。
4. `codes.mjs gen` 出码，发给 Ham。

## 测试
`node source/tools/gate/test.mjs`：逻辑测试（无码拿不到任何游戏内容、错码、伪造、过期、停用、替换、换密钥）。另用 wrangler 本地运行环境实测过 `run_worker_first`。

## 费用与限制（Cloudflare 免费档）
- 官方文档：Workers 免费档每天 10 万次请求；KV 每天 10 万次读、1000 次写。超了请求会失败，不会自动扣费。静态资源是否另外免费，官方页面没查到，没核实。
- 一次进游戏约 8～25 个请求，几个人试玩远低于上限。
- 没核实：workers.dev 域名在国内的可达性（有的地区慢或打不开）。要稳可以绑自己的域名（要买域名）。
