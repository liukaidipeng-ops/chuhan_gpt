// 试玩码的生成和哈希（管理脚本和测试共用）。码只在生成那一刻显示一次，KV 里只存哈希。
import { randomInt, createHash } from 'node:crypto';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 去掉容易看错的 I O 0 1
export const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const hashCode = c => createHash('sha256').update(norm(c)).digest('hex');
export function genCode() {
  let s = ''; for (let i = 0; i < 10; i++) s += ALPHA[randomInt(ALPHA.length)];
  return s.slice(0, 5) + '-' + s.slice(5);
}
// 一个新码要写进 KV 的两条记录：h:<哈希> → id；c:<id> → 状态
export function newRecords(id, label, code) {
  const hash = hashCode(code);
  return [
    ['h:' + hash, id],
    ['c:' + id, JSON.stringify({ id, label, hash, status: 'active', created: new Date().toISOString() })],
  ];
}
