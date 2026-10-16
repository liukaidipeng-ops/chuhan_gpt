const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const root = path.resolve(__dirname, '..');
const outDir = path.resolve(root, 'test-results');
fs.mkdirSync(outDir, { recursive: true });
const screenshot = path.join(outDir, 'game-issue-repo-browser.png');
const dom = path.join(outDir, 'game-issue-repo-browser.html');
const run = `${Date.now()}-${process.pid}`;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

function devtoolsUrl(chrome) {
  return new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`Chromium DevTools startup timeout: ${stderr}`)), 10000);
    chrome.stderr.on('data', chunk => {
      stderr += chunk;
      const found = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (found) { clearTimeout(timer); resolve(found[1]); }
    });
    chrome.once('error', reject);
    chrome.once('exit', code => reject(new Error(`Chromium exited before DevTools was ready (${code}): ${stderr}`)));
  });
}

function cdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const waiting = new Map();
    ws.once('error', reject);
    ws.once('open', () => {
      ws.on('message', raw => {
        const msg = JSON.parse(String(raw));
        if (!msg.id || !waiting.has(msg.id)) return;
        const { accept, reject: fail } = waiting.get(msg.id); waiting.delete(msg.id);
        msg.error ? fail(new Error(msg.error.message)) : accept(msg.result);
      });
      resolve({
        ws,
        send(method, params, sessionId) {
          const id = nextId++;
          return new Promise((accept, fail) => {
            waiting.set(id, { accept, reject: fail });
            ws.send(JSON.stringify({ id, method, params: params || {}, ...(sessionId ? { sessionId } : {}) }));
          });
        }
      });
    });
  });
}

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const profile = fs.mkdtempSync('/tmp/chuhan-browser-test-');
  const url = `http://127.0.0.1:${port}/test/game-issue-repo.browser.html?run=${encodeURIComponent(run)}`;
  const chrome = spawn('/usr/bin/chromium', ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let client;
  try {
    client = await cdp(await devtoolsUrl(chrome));
    const { targetId } = await client.send('Target.createTarget', { url });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
    await client.send('Page.enable', {}, sessionId);
    let status = '';
    for (let i = 0; i < 100; i++) {
      await delay(100);
      try {
        const result = await client.send('Runtime.evaluate', { expression: 'document.body && document.body.dataset.testStatus || ""', returnByValue: true }, sessionId);
        status = result.result && result.result.value || '';
      } catch (e) { status = ''; }
      if (status) break;
    }
    if (status !== 'passed') throw new Error(`browser assertions ended with status=${status || 'timeout'}`);
    const html = await client.send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true }, sessionId);
    const png = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
    fs.writeFileSync(dom, html.result.value);
    fs.writeFileSync(screenshot, Buffer.from(png.data, 'base64'));
    if (!/7\/7 passed/.test(html.result.value)) throw new Error('browser result summary was not 7/7');
    console.log(`BROWSER ISSUE REPO OK\nDOM ${dom}\nSCREENSHOT ${screenshot}`);
    await client.send('Browser.close');
  } catch (e) {
    console.error(e.stack || e.message);
    process.exitCode = 1;
    if (client && client.ws.readyState === WebSocket.OPEN) client.ws.close();
    chrome.kill('SIGTERM');
  } finally {
    server.close();
    await delay(200);
    fs.rmSync(profile, { recursive: true, force: true });
  }
});
