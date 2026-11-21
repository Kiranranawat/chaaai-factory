/* CHAI FACTORY - backend (no installs needed, only Node.js)
   Run:  node server.js   ->  http://localhost:3000
   Serves the website AND saves orders + contact messages in server/data/*.json */
'use strict';
const https = require('https'), http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'chai123';   // change this!
const SITE = __dirname;
const DATA = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');   // on hosting: point DATA_DIR at a persistent disk
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '', TG_CHAT = process.env.TELEGRAM_CHAT_ID || '';   // optional: orders also arrive on your Telegram
const GST = 0.05, DELIVERY = 30, FREE_DELIVERY = 499;
fs.mkdirSync(DATA, { recursive: true });

/* ---------- tiny JSON "database" ---------- */
const file = n => path.join(DATA, n + '.json');
function read(n) { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch (e) { return []; } }
function write(n, v) { const tmp = file(n) + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(v, null, 2)); fs.renameSync(tmp, file(n)); }

/* ---------- menu: read straight from script.js so prices always match the site ---------- */
function grab(src, name) {
  const start = src.indexOf('const ' + name + ' = [');
  if (start < 0) throw new Error(name + ' not found');
  const end = src.indexOf('\n  ];', start);
  return new Function('return ' + src.slice(src.indexOf('[', start), end + 4))();
}
let MENU = { chai: {}, snack: {}, combo: {} };
function loadMenu() {
  const src = fs.readFileSync(path.join(SITE, 'script.js'), 'utf8');
  const chai = grab(src, 'CHAI'), snacks = grab(src, 'SNACKS'), combos = grab(src, 'COMBOS');
  const m = { chai: {}, snack: {}, combo: {} };
  chai.forEach(c => m.chai[c.id] = { name: c.name, price: c.price });
  snacks.forEach(s => m.snack[s.id] = { name: s.name, price: s.price });
  combos.forEach(c => {
    const a = m.chai[c.chai], b = m.snack[c.snack];
    if (a && b) m.combo[c.id] = { name: a.name + ' + ' + b.name, price: Math.round((a.price + b.price) * (100 - c.off) / 100) };
  });
  MENU = m;
  console.log(`Menu loaded: ${chai.length} chai, ${snacks.length} snacks, ${combos.length} combos`);
}
try { loadMenu(); } catch (e) { console.error('Could not read menu from script.js:', e.message); }

/* ---------- helpers ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
function send(res, code, body, headers) {
  const h = Object.assign({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'X-Content-Type-Options': 'nosniff' }, headers);
  if (body !== null && typeof body === 'object' && !Buffer.isBuffer(body)) { body = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
  res.writeHead(code, h); res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 100e3) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch (e) { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const hits = new Map();   // simple rate limit: 20 posts / 10 min / ip
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 600e3);
  arr.push(now); hits.set(ip, arr); return arr.length > 20;
}
const TOKEN = crypto.createHash('sha256').update('cf:' + ADMIN_PASSWORD).digest('hex');
const isAdmin = req => (req.headers.authorization || '') === 'Bearer ' + TOKEN;

/* ---------- optional Telegram alert (so no order is ever lost, even if the host wipes files) ---------- */
function notify(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  const body = JSON.stringify({ chat_id: TG_CHAT, text });
  const r = https.request({ hostname: 'api.telegram.org', path: '/bot' + TG_TOKEN + '/sendMessage', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, x => x.resume());
  r.on('error', () => {}); r.setTimeout(8000, () => r.destroy()); r.end(body);
}
const orderText = o => `NEW ORDER ${o.id}  Rs.${o.total}\n${o.name}  ${o.phone}\n${o.address}\nPay: ${o.pay}\n` + o.items.map(i => `${i.qty} x ${i.name}${i.meta ? ' (' + i.meta + ')' : ''}`).join('\n');

/* ---------- orders ---------- */
function buildOrder(b) {
  const name = clean(b.name, 80), phone = clean(b.phone, 20), address = clean(b.address, 300);
  const pay = ['cod', 'upi', 'card'].includes(b.pay) ? b.pay : 'cod';
  if (name.length < 2) return { error: 'Please enter your name.' };
  if (phone.replace(/\D/g, '').length < 10) return { error: 'Please enter a valid phone number.' };
  if (address.length < 10) return { error: 'Please enter your full address.' };
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 40) return { error: 'Your cart is empty.' };
  const items = []; let sub = 0;
  for (const it of b.items) {
    const id = clean(it.id, 60), qty = Math.floor(Number(it.qty));
    if (!(qty >= 1 && qty <= 50)) return { error: 'Invalid quantity.' };
    const [kind, key] = id.split(':');
    let price, nm;
    if (MENU[kind] && MENU[kind][key]) { price = MENU[kind][key].price; nm = MENU[kind][key].name; }   // price from the SERVER menu
    else if (kind === 'custom') {                                                                       // "Make your own chai" - price is computed in the studio
      price = Math.round(Number(it.price)); nm = clean(it.name, 80) || 'Custom Chai';
      if (!(price >= 40 && price <= 800)) return { error: 'Invalid price for custom chai.' };
    } else return { error: 'Unknown item: ' + id };
    items.push({ id, name: nm, meta: clean(it.meta, 160), price, qty });
    sub += price * qty;
  }
  const tax = Math.round(sub * GST), delivery = sub >= FREE_DELIVERY ? 0 : DELIVERY;
  return { order: { name, phone, address, pay, items, subtotal: sub, tax, delivery, total: sub + tax + delivery } };
}
function nextId() {
  const orders = read('orders'); let n = 1000;
  orders.forEach(o => { const k = parseInt(String(o.id).replace(/\D/g, ''), 10); if (k >= n) n = k; });
  return 'CF' + (n + 1);
}

/* ---------- routes ---------- */
async function api(req, res, url) {
  const ip = req.socket.remoteAddress || '';
  const p = url.pathname;
  if (req.method === 'GET' && p === '/api/health') return send(res, 200, { ok: true });
  if (req.method === 'GET' && p === '/api/menu') return send(res, 200, MENU);

  if (req.method === 'POST' && p === '/api/orders') {
    if (limited(ip)) return send(res, 429, { error: 'Too many requests, please wait a few minutes.' });
    let b; try { b = await readBody(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
    const r = buildOrder(b); if (r.error) return send(res, 400, { error: r.error });
    const o = Object.assign({ id: nextId(), status: 'new', createdAt: new Date().toISOString() }, r.order);
    const orders = read('orders'); orders.push(o); write('orders', orders);
    const eta = 25 + Math.min(20, o.items.reduce((a, i) => a + i.qty, 0) * 2);
    console.log(`NEW ORDER ${o.id}  Rs.${o.total}  ${o.name}  ${o.phone}`); notify(orderText(o));
    return send(res, 201, { id: o.id, total: o.total, eta });
  }
  if (req.method === 'POST' && p === '/api/contact') {
    if (limited(ip)) return send(res, 429, { error: 'Too many requests, please wait a few minutes.' });
    let b; try { b = await readBody(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
    const m = { name: clean(b.name, 80), email: clean(b.email, 120), phone: clean(b.phone, 20), message: clean(b.message, 2000) };
    if (m.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.email) || m.message.length < 10) return send(res, 400, { error: 'Please fill the form correctly.' });
    const all = read('messages'); all.push(Object.assign({ id: 'M' + (all.length + 1), read: false, createdAt: new Date().toISOString() }, m)); write('messages', all);
    console.log(`NEW MESSAGE from ${m.name}`); notify(`NEW MESSAGE\n${m.name}  ${m.email}  ${m.phone}\n${m.message}`);
    return send(res, 201, { ok: true });
  }

  /* ---- admin ---- */
  if (req.method === 'POST' && p === '/api/admin/login') {
    let b; try { b = await readBody(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
    if (limited(ip)) return send(res, 429, { error: 'Too many attempts.' });
    return String(b.password) === ADMIN_PASSWORD ? send(res, 200, { token: TOKEN }) : send(res, 401, { error: 'Wrong password.' });
  }
  if (p.startsWith('/api/admin/')) {
    if (!isAdmin(req)) return send(res, 401, { error: 'Not allowed.' });
    if (req.method === 'GET' && p === '/api/admin/orders') return send(res, 200, read('orders').reverse());
    if (req.method === 'GET' && p === '/api/admin/messages') return send(res, 200, read('messages').reverse());
    const m = p.match(/^\/api\/admin\/orders\/(CF\d+)$/);
    if (req.method === 'PATCH' && m) {
      let b; try { b = await readBody(req); } catch (e) { return send(res, 400, { error: 'Bad request.' }); }
      if (!['new', 'preparing', 'out', 'delivered', 'cancelled'].includes(b.status)) return send(res, 400, { error: 'Bad status.' });
      const orders = read('orders'), o = orders.find(x => x.id === m[1]);
      if (!o) return send(res, 404, { error: 'Not found.' });
      o.status = b.status; write('orders', orders); return send(res, 200, o);
    }
  }
  return send(res, 404, { error: 'Not found.' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  if (rel === '/admin') rel = '/admin.html';
  const full = path.resolve(SITE, '.' + rel);
  const rp = path.relative(SITE, full);
  const parts = rp.split(path.sep);
  // never serve server code/data or hidden files; stay inside the site folder
  if (rp.startsWith('..') || path.isAbsolute(rp) || parts[0] === 'parts' || parts.some(s => s.startsWith('.')) || ['server.js', 'data', 'package.json', 'render.yaml', 'node_modules'].includes(parts[0])) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  fs.readFile(full, (err, buf) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    send(res, 200, buf, { 'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  });
}

if (process.env.NODE_ENV === 'production' && ADMIN_PASSWORD === 'chai123') console.warn('WARNING: set ADMIN_PASSWORD, the default password is public!');
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (url.pathname.startsWith('/api/')) return api(req, res, url).catch(e => { console.error(e); send(res, 500, { error: 'Server error.' }); });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { 'Content-Type': 'text/plain' });
  serveStatic(req, res, url);
}).listen(PORT, () => {
  console.log(`\n  CHAI FACTORY is running\n  Website : http://localhost:${PORT}\n  Admin   : http://localhost:${PORT}/admin   (password: ${ADMIN_PASSWORD === 'chai123' ? 'chai123 - please change' : '*****'})\n`);
});
