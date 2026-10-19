# 试玩码入口（Ham 10-19）

线上地址：https://xiangqi-trial.liukaidip.workers.dev （Cloudflare Worker `xiangqi-trial`，账号 Liukaidip）。玩家第一次输入试玩码，同一浏览器记住 180 天。验码在服务端，有效码不在前端。

## 怎么挡的
- Worker 挡在所有游戏文件前面：首页、语音包、贴图、版本文件，没有有效会话一律只给输入页（401）。
- 游戏文件只存在 Cloudflare KV 的 `GAME` 空间（键是路径），只有这个 Worker 读得到，**不在任何 Git 仓库的网页目录里**，没有别的公开地址。预览地址已关（`preview_urls = false`）。
- 码只存哈希（KV 的 `CODES` 空间），明文只在生成那一刻显示一次。会话是服务端签名的 cookie（密钥 `SESSION_KEY` 是 Worker 密钥，仓库里没有）。
- 每次请求都核对这个码的状态：停用后，已经进来的浏览器约 30 秒内也被挡。换掉 `SESSION_KEY` 可以一次作废所有会话。
- 不限设备数；码被转发别人也能用（Ham 接受）。

## 为什么游戏文件放 KV 不用 Workers 静态资源
静态资源上传用的是 Cloudflare 临时发的另一种凭证，会被云环境的代理换成账号令牌，上传不了（401）。KV 单个文件上限 25MB，我们最大 5MB，够用。

## 日常（在云环境里；令牌由代理自动带上，只需要 CLOUDFLARE_ACCOUNT_ID）
```bash
export NODE_USE_ENV_PROXY=1 NODE_NO_WARNINGS=1                  # Node 要这个开关才走代理
cd source/tools/gate
node codes.mjs gen 小王 3      # 生成 3 个码，备注「小王」（明文只显示一次）
node codes.mjs list
node codes.mjs revoke c002     # 停用
node codes.mjs replace c002    # 停用并换一个同备注的新码
```
## 发布新版本（Ham 在审批台批到「上线」之后）
```bash
cd source && node build.js && cd tools/gate
node test.mjs                  # 入口逻辑测试
node upload.mjs                # 把 dist/site 传进 GAME（先传资源，最后传 index.html；删掉旧文件）
npx wrangler deploy            # 只有 worker.js / wrangler.toml 改了才要
```
回滚：回到上一个提交的源码，重新 build + upload.mjs。

## 费用与限制（Cloudflare 免费档）
- 官方文档：Workers 免费档每天 10 万次请求；KV 每天 10 万次读、1000 次写、1GB 存储。超了请求会失败，不会自动扣费。
- 一次进游戏约 20～40 次 KV 读（每个请求读一次码状态加一次文件），所以每天约 3000 次进游戏就到顶；几个人试玩远低于。每次发布约 20 次 KV 写。
- 令牌 2027-01-17 到期；到期前换新令牌。
- 没核实：workers.dev 域名在国内的可达性。要稳可以绑自己的域名（要买域名）。
