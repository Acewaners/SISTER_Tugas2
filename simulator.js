// ---------- KONFIGURASI ----------
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let currentModel = 'req';
let isRunning = false;

// Parameter simulasi
const simSpeed = { value: 1.0 };
const simDelay = { value: 500 };

// Metrik per model
const metrics = {
  req: { sent: 0, throughput: 0, latency: 0 },
  msg: { sent: 0, throughput: 0, latency: 0 }
};

// Pesan aktif (animasi partikel)
let activeMessages = [];

// Posisi node per model
let nodePositions = {};

// Warna dan nama model
const COLORS = { req: '#38bdf8', msg: '#4ade80' };

const NAMES = {
  req: 'Request-Response',
  msg: 'Message Passing'
};

const DESCS = {
  req: {
    title: 'Request-Response',
    text: 'Model sinkron: client mengirim request ke server, lalu menunggu response.',
    flow: '1. Client --REQUEST--> Server<br>2. Server memproses...<br>3. Server --RESPONSE--> Client'
  },
  msg: {
    title: 'Message Passing',
    text: 'Proses berkomunikasi dengan mengirim pesan. Menggunakan topologi ring.',
    flow: '1. Node A kirim -> Node B (hop 1)<br>2. Node B forward -> Node C (hop 2)<br>3. Node C kirim ACK ke A'
  }
};

// ---------- HELPER ----------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms / simSpeed.value));
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Helper warna
function lighten(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0xff) + amt);
  const b = Math.min(255, (num & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amt);
  const g = Math.max(0, ((num >> 8) & 0xff) - amt);
  const b = Math.max(0, (num & 0xff) - amt);
  return `rgb(${r},${g},${b})`;
}

// ---------- INISIALISASI POSISI NODE ----------
function initNodePositions(model) {
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;

  if (model === 'req') {
    nodePositions = {
      client: { x: 150, y: cy, label: 'Client', type: 'client', active: false },
      server: { x: w - 150, y: cy, label: 'Server', type: 'server', active: false }
    };
  } else if (model === 'msg') {
    const r = 150;
    nodePositions = {
      nodeA: { x: cx, y: cy - r, label: 'Node A', type: 'node', active: false },
      nodeB: { x: cx + r, y: cy, label: 'Node B', type: 'node', active: false },
      nodeC: { x: cx, y: cy + r, label: 'Node C', type: 'node', active: false }
    };
  }
}

// ---------- GAMBAR GRID ----------
function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 38) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 38) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.restore();
}

// ---------- GAMBAR GARIS KONEKSI ----------
function getPairs(model) {
  if (model === 'req') return [['client', 'server']];
  if (model === 'msg') return [['nodeA', 'nodeB'], ['nodeB', 'nodeC'], ['nodeC', 'nodeA']];
  return [];
}

function drawConnections(activePairs) {
  const color = COLORS[currentModel];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);

  const pairs = getPairs(currentModel);
  pairs.forEach(([a, b]) => {
    const na = nodePositions[a], nb = nodePositions[b];
    if (!na || !nb) return;
    const active = activePairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    ctx.globalAlpha = active ? 0.6 : 0.15;
    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    ctx.stroke();
  });
  ctx.restore();
}

// ---------- GAMBAR NODE ----------
function drawNodes(activePairs) {
  const color = COLORS[currentModel];
  Object.entries(nodePositions).forEach(([key, node]) => {
    const isActive = activePairs.some(p => p.includes(key)) || node.active;
    ctx.save();

    if (isActive) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
    }

    const r = node.type === 'server' ? 38 : 32;

    const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
    grad.addColorStop(0, lighten(color, 30));
    grad.addColorStop(1, darken(color, 40));

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = isActive ? '#fff' : color;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);

    ctx.restore();
  });
}

// ---------- GAMBAR PESAN BERGERAK ----------
function drawMessages() {
  const color = COLORS[currentModel];
  activeMessages.forEach(m => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 4;
    ctx.fillText(m.label, m.x, m.y - 16);
    ctx.restore();
  });
}

// ---------- RENDER UTAMA ----------
function render(activePairs = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawConnections(activePairs);
  drawMessages();
  drawNodes(activePairs);
}

// ---------- ANIMASI PESAN ----------
function animateMessages(msgs, duration) {
  return new Promise(resolve => {
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const raw = elapsed / (duration / simSpeed.value);
      const t = Math.min(raw, 1);

      msgs.forEach(m => {
        const progress = ease(t);
        m.x = m.sx + (m.ex - m.sx) * progress;
        m.y = m.sy + (m.ey - m.sy) * progress;
      });

      render();
      if (t < 1 && isRunning) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

// Buat objek pesan
function msgObj(sx, sy, ex, ey, label) {
  return { sx, sy, ex, ey, x: sx, y: sy, label };
}

// ---------- LOG ----------
function addLog(text, type = 'info') {
  const container = document.getElementById('logContainer');
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const div = document.createElement('div');
  div.className = 'log-entry';
  div.innerHTML = `<span class="log-time">${time}</span><span class="log-msg ${type}">${text}</span>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ---------- STATUS ----------
function setStatus(type, text) {
  const badge = document.getElementById('statusBadge');
  badge.className = `status-badge status-${type}`;
  badge.textContent = text;
}

// ---------- UPDATE METRIK ----------
function updateMetrics(mdl, m) {
  if (mdl === currentModel) {
    document.getElementById('mSent').textContent = m.sent;
    document.getElementById('mTp').textContent = m.throughput.toFixed(1);
    document.getElementById('mLat').textContent = Math.round(m.latency);
  }
}

// ---------- PILIH MODEL ----------
function selectModel(m) {
  if (isRunning) return;
  currentModel = m;

  document.querySelectorAll('.model-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.m === m);
  });

  const title = document.getElementById('canvasTitle');
  title.textContent = NAMES[m];
  title.dataset.m = m;

  document.getElementById('descTitle').textContent = DESCS[m].title;
  document.getElementById('descTitle').style.color = COLORS[m];
  document.getElementById('descText').textContent = DESCS[m].text;
  document.getElementById('descFlow').innerHTML = DESCS[m].flow;

  initNodePositions(m);
  render();
}

// ---------- SLIDER ----------
function updateSlider(type, val) {
  if (type === 'speed') {
    simSpeed.value = parseFloat(val);
    document.getElementById('speedVal').textContent = val + 'x';
  } else if (type === 'delay') {
    simDelay.value = parseInt(val);
    document.getElementById('delayVal').textContent = val + 'ms';
  }
}

// ---------- TAB ----------
function switchTab(name, btn) {
  if (isRunning) return;
  document.querySelectorAll('.metrics-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tabMetrics').classList.toggle('hidden', name !== 'metrics');
  document.getElementById('tabCompare').classList.toggle('hidden', name !== 'compare');
  document.getElementById('tabLog').classList.toggle('hidden', name !== 'log');
}

// SIMULASI: REQUEST-RESPONSE
async function simReq(count) {
  const nodes = nodePositions;
  const startTime = Date.now();
  const lats = [];
  let done = 0;

  addLog('Memulai Request-Response...', 'send');

  for (let i = 0; i < count; i++) {
    if (!isRunning) break;

    // --- Langkah 1: Client kirim REQUEST ke Server ---
    addLog(`Req ${i + 1}: Client kirim REQUEST ke Server`, 'send');
    nodes.client.active = true;
    activeMessages = [msgObj(nodes.client.x, nodes.client.y, nodes.server.x, nodes.server.y, 'REQUEST')];
    render([['client', 'server']]);
    await animateMessages(activeMessages, 500);
    nodes.client.active = false;
    activeMessages = [];

    // --- Langkah 2: Server proses ---
    addLog(`Req ${i + 1}: Server memproses...`, 'info');
    nodes.server.active = true;
    render([['client', 'server']]);
    await sleep(simDelay.value);
    nodes.server.active = false;

    // --- Langkah 3: Server kirim RESPONSE ke Client ---
    addLog(`Req ${i + 1}: Server kirim RESPONSE ke Client`, 'recv');
    nodes.server.active = true;
    activeMessages = [msgObj(nodes.server.x, nodes.server.y, nodes.client.x, nodes.client.y, 'RESPONSE')];
    render([['client', 'server']]);
    await animateMessages(activeMessages, 500);
    nodes.server.active = false;
    activeMessages = [];

    // Catat metrik
    const lat = simDelay.value + Math.round(Math.random() * 40);
    lats.push(lat);
    done += 2;
    const elapsed = (Date.now() - startTime) / 1000;
    metrics.req = {
      sent: done,
      throughput: done / elapsed,
      latency: lats.reduce((a, b) => a + b) / lats.length
    };
    updateMetrics('req', metrics.req);
    await sleep(150);
  }

  addLog(`Request-Response selesai. ${done} pesan dikirim.`, 'done');
}

// SIMULASI: MESSAGE PASSING
async function simMsg(count) {
  const nodes = nodePositions;
  const nodeKeys = ['nodeA', 'nodeB', 'nodeC'];
  const startTime = Date.now();
  const lats = [];
  let done = 0;

  addLog('Memulai Message Passing...', 'send');

  for (let i = 0; i < count; i++) {
    if (!isRunning) break;
    const senderIdx = i % 3;
    const senderName = nodeKeys[senderIdx].replace('node', 'Node ');

    addLog(`Pesan ${i + 1}: ${senderName} kirim ke ring`, 'send');


    const steps = [
      [senderIdx, (senderIdx + 1) % 3],
      [(senderIdx + 1) % 3, (senderIdx + 2) % 3], 
      [(senderIdx + 2) % 3, senderIdx]             
    ];

    const labels = ['HOP 1', 'HOP 2', 'ACK'];

    for (let h = 0; h < steps.length; h++) {
      const [fromKey, toKey] = [nodeKeys[steps[h][0]], nodeKeys[steps[h][1]]];
      const from = nodes[fromKey], to = nodes[toKey];
      const fromName = fromKey.replace('node', 'Node '), toName = toKey.replace('node', 'Node ');

      addLog(`Pesan ${i + 1}: ${labels[h]} - ${fromName} -> ${toName}`, h === 2 ? 'recv' : 'send');

      nodes[fromKey].active = true;
      nodes[toKey].active = true;
      activeMessages = [msgObj(from.x, from.y, to.x, to.y, labels[h])];
      render([[fromKey, toKey]]);
      await animateMessages(activeMessages, 450);
      nodes[fromKey].active = false;
      nodes[toKey].active = false;
      activeMessages = [];
    }

    // Catat metrik
    const lat = Math.round(simDelay.value * 0.6) + Math.round(Math.random() * 30);
    lats.push(lat);
    done++;
    const elapsed = (Date.now() - startTime) / 1000;
    metrics.msg = {
      sent: done,
      throughput: done / elapsed,
      latency: lats.reduce((a, b) => a + b) / lats.length
    };
    updateMetrics('msg', metrics.msg);
    await sleep(150);
  }

  addLog(`Message Passing selesai. ${done} sesi pesan selesai.`, 'done');
}

// ---------- JALANKAN SIMULASI ----------
async function runSim() {
  if (isRunning) return;
  isRunning = true;

  document.getElementById('btnRun').disabled = true;
  setStatus('running', 'BERJALAN');
  document.getElementById('logContainer').innerHTML = '';

  const count = parseInt(document.getElementById('msgCount').value) || 3;
  initNodePositions(currentModel);

  addLog(`== SIMULASI DIMULAI ==`, 'info');
  addLog(`Model: ${NAMES[currentModel]} | Pesan: ${count} | Delay: ${simDelay.value}ms`, 'info');

  try {
    if (currentModel === 'req') await simReq(count);
    else if (currentModel === 'msg') await simMsg(count);
  } catch (e) {
    addLog(`Error: ${e.message}`, 'error');
  }

  addLog(`== SELESAI ==`, 'done');
  isRunning = false;
  document.getElementById('btnRun').disabled = false;
  setStatus('idle', 'SELESAI');

  // Update tabel perbandingan
  document.getElementById('cmpTotReq').textContent = metrics.req.sent || '-';
  document.getElementById('cmpTotMsg').textContent = metrics.msg.sent || '-';
  document.getElementById('cmpLatReq').textContent = metrics.req.latency ? Math.round(metrics.req.latency) + 'ms' : '-';
  document.getElementById('cmpLatMsg').textContent = metrics.msg.latency ? Math.round(metrics.msg.latency) + 'ms' : '-';
  document.getElementById('cmpReq').textContent = metrics.req.throughput ? metrics.req.throughput.toFixed(1) : '-';
  document.getElementById('cmpMsg').textContent = metrics.msg.throughput ? metrics.msg.throughput.toFixed(1) : '-';

  activeMessages = [];
  render();
}

// ---------- RESET ----------
function resetSim() {
  if (isRunning) return;
  metrics.req = { sent: 0, throughput: 0, latency: 0 };
  metrics.msg = { sent: 0, throughput: 0, latency: 0 };
  document.getElementById('mSent').textContent = '0';
  document.getElementById('mTp').textContent = '0.0';
  document.getElementById('mLat').textContent = '0';
  document.getElementById('logContainer').innerHTML = '';
  document.getElementById('cmpTotReq').textContent = '-';
  document.getElementById('cmpTotMsg').textContent = '-';
  document.getElementById('cmpLatReq').textContent = '-';
  document.getElementById('cmpLatMsg').textContent = '-';
  document.getElementById('cmpReq').textContent = '-';
  document.getElementById('cmpMsg').textContent = '-';
  activeMessages = [];
  initNodePositions(currentModel);
  render();
  addLog('Simulator siap. Pilih model dan klik Jalankan.', 'info');
}

// ---------- SHORTCUT ----------
document.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') runSim();
  else if (e.key === 'Escape') isRunning = false;
});

// ---------- INIT ----------
function init() {
  initNodePositions(currentModel);
  render();
  addLog('DistriCom Simulator siap. Pilih model dan klik Jalankan.', 'info');
  addLog('Tekan R=jalan, Esc=batal.', 'info');
}

init();
