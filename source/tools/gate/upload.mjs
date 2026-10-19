#!/usr/bin/env node
// 把构建好的游戏文件（source/dist/site）传进 KV 的 GAME 空间：node upload.mjs [目录]
// index.html 最后传，免得新首页先于新语音包出现；传完删掉 KV 里这次没有的旧文件。
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, extname } from 'node:path';
import { kv } from './cf.mjs';
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.mp3': 'audio/mpeg', '.bin': 'application/octet-stream', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const dir = process.argv[2] || new URL('../../dist/site', import.meta.url).pathname;
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const files = walk(dir).map(f => relative(dir, f).split('\\').join('/')).filter(f => !f.startsWith('.'));
files.sort((a, b) => (a === 'index.html') - (b === 'index.html') || (a === 'version.json') - (b === 'version.json'));
const GAME = kv('GAME');
for (const f of files) {
  const bytes = readFileSync(join(dir, f));
  if (bytes.length > 25 * 1024 * 1024) throw new Error(f + ' 超过 KV 单个值 25MB 上限');
  await GAME.putFile(f, bytes, { ct: TYPES[extname(f)] || 'application/octet-stream', size: bytes.length, etag: createHash('sha1').update(bytes).digest('hex') });
  console.log('传好', f, bytes.length);
}
for (const k of await GAME.keys('')) if (!files.includes(k)) { await GAME.del(k); console.log('删旧', k); }
console.log(`共 ${files.length} 个文件`);
