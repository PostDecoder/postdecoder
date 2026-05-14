// ============================================
// GROW IN 9.5 v2 — script.js
// Modes: generate + analyze | Bilingual | Health & Wellness
// ============================================

// ── STATE ──
let profile = JSON.parse(localStorage.getItem('growin95_profile') || '{}');
let history = JSON.parse(localStorage.getItem('growin95_history') || '[]');
let genObjective = 'attract qualified prospects';
let anaObjective = 'attract qualified prospects';
let genFormat = 'Tips / List';
let lastGenPost = '';

// ── INIT ──
initTabs();
initChips();
initObjectives();
initProfile();
updateHistBadge();
renderHistory();

// ── TABS ──
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
      if (tab.dataset.tab === 'history') renderHistory();
    });
  });
}

// ── OBJECTIVES ──
function initObjectives() {
  document.querySelectorAll('#gen-obj-grid .obj-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#gen-obj-grid .obj-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      genObjective = btn.dataset.value;
    });
  });

  document.querySelectorAll('#ana-obj-grid .obj-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ana-obj-grid .obj-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      anaObjective = btn.dataset.value;
    });
  });
}

// ── CHIPS (format) ──
function initChips() {
  document.querySelectorAll('#gen-format .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#gen-format .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      genFormat = chip.textContent.trim();
    });
  });
}

// ── WORD COUNT ──
const anaInput = document.getElementById('ana-input');
const anaCount = document.getElementById('ana-count');
anaInput.addEventListener('input', () => {
  const w = anaInput.value.trim().split(/\s+/).filter(Boolean).length;
  anaCount.textContent = `${w} word${w !== 1 ? 's' : ''}`;
});

// ── LOADING MESSAGES ──
const genLoadingMsgs = [
  'Analyzing your topic…', 'Crafting the hook…',
  'Structuring the content…', 'Calibrating the tone…', 'Finalizing…'
];
const anaLoadingMsgs = [
  'Reading your post…', 'Scoring the 4 criteria…',
  'Identifying errors…', 'Rewriting…', 'Finalizing…'
];

function startLoading(elId, msgs) {
  let i = 0;
  const el = document.getElementById(elId);
  if (el) el.textContent = msgs[0];
  return setInterval(() => {
    i = (i + 1) % msgs.length;
    const e = document.getElementById(elId);
    if (e) e.textContent = msgs[i];
  }, 1800);
}

// ── API CALL ──
async function callAPI(mode, input, objective) {
  const body = { mode, input, objective };
  if (profile.profession) {
    body.profile = {
      profession: profile.profession,
      specialty: profile.specialty,
      client: profile.client,
      offer: profile.offer,
      result: profile.result
    };
  }

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error (${res.status})`);
  }

  return res.json();
}

// ══ GENERATE ══
document.getElementById('gen-btn').addEventListener('click', doGenerate);

async function doGenerate() {
  const input = document.getElementById('gen-input').value.trim();
  if (!input || input.length < 5) {
    showError('gen-error', 'Enter at least a few keywords or a topic.');
    return;
  }

  hideError('gen-error');
  document.getElementById('gen-results').classList.add('hidden');
  document.getElementById('gen-loading').classList.remove('hidden');
  const interval = startLoading('gen-loading-text', genLoadingMsgs);

  try {
    const fullInput = `Topic: ${input}\nFormat: ${genFormat}`;
    const data = await callAPI('generate', fullInput, genObjective);

    clearInterval(interval);
    document.getElementById('gen-loading').classList.add('hidden');

    document.getElementById('gen-score-pill').textContent = `Score: ${data.scoreGenerated}/100`;
    document.getElementById('gen-time-pill').textContent = `⏰ ${data.best_day} · ${data.best_time}`;
    document.getElementById('gen-hook-pill').textContent = `Hook: ${data.hook_type}`;
    document.getElementById('gen-post').textContent = data.post;

    lastGenPost = data.post;
    document.getElementById('gen-results').classList.remove('hidden');

    saveToHistory({
      type: 'generate',
      post: data.post,
      topic: input,
      score: data.scoreGenerated,
      language: data.language || 'auto',
      date: now()
    });

  } catch (err) {
    clearInterval(interval);
    document.getElementById('gen-loading').classList.add('hidden');
    showError('gen-error', err.message);
  }
}

document.getElementById('gen-copy-btn').addEventListener('click', () => {
  copyText(document.getElementById('gen-post').textContent, document.getElementById('gen-copy-btn'));
});

document.getElementById('gen-regen-btn').addEventListener('click', () => {
  document.getElementById('gen-results').classList.add('hidden');
  doGenerate();
});

document.getElementById('gen-reset-btn').addEventListener('click', () => {
  document.getElementById('gen-results').classList.add('hidden');
  document.getElementById('gen-input').value = '';
});

// ══ ANALYZE ══
document.getElementById('ana-btn').addEventListener('click', doAnalyze);

async function doAnalyze() {
  const input = anaInput.value.trim();
  if (!input || input.length < 30) {
    showError('ana-error', 'Paste a post of at least 30 characters.');
    return;
  }

  hideError('ana-error');
  document.getElementById('analyze-form').style.display = 'none';
  document.getElementById('ana-results').classList.add('hidden');
  document.getElementById('ana-loading').classList.remove('hidden');
  const interval = startLoading('ana-loading-text', anaLoadingMsgs);

  try {
    const data = await callAPI('analyze', input, anaObjective);

    clearInterval(interval);
    document.getElementById('ana-loading').classList.add('hidden');

    const si = data.scoreInitial;
    const so = data.scoreOptimized;

    document.getElementById('ana-score-initial').textContent = si + '/100';
    document.getElementById('ana-score-optimized').textContent = so + '/100';

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById('ana-bar-initial').style.width = si + '%';
        document.getElementById('ana-bar-optimized').style.width = so + '%';
      }, 100);
    });

    document.getElementById('ana-diagnostic').textContent = data.diagnostic || '—';
    document.getElementById('ana-errors').textContent = data.errors || '—';
    document.getElementById('ana-fixes').textContent = data.fixes || '—';
    document.getElementById('ana-improved').textContent = data.improved || '—';

    document.getElementById('ana-results').classList.remove('hidden');
    setTimeout(() => document.getElementById('ana-results').scrollIntoView({ behavior: 'smooth' }), 100);

    saveToHistory({
      type: 'analyze',
      post: data.improved,
      scoreInitial: si,
      scoreOptimized: so,
      language: data.language || 'auto',
      date: now()
    });

  } catch (err) {
    clearInterval(interval);
    document.getElementById('ana-loading').classList.add('hidden');
    document.getElementById('analyze-form').style.display = 'flex';
    showError('ana-error', err.message);
  }
}

document.getElementById('ana-copy-btn').addEventListener('click', () => {
  copyText(document.getElementById('ana-improved').textContent, document.getElementById('ana-copy-btn'));
});

document.getElementById('ana-reset-btn').addEventListener('click', () => {
  document.getElementById('ana-results').classList.add('hidden');
  document.getElementById('analyze-form').style.display = 'flex';
  anaInput.value = '';
  anaCount.textContent = '0 words';
});

// ══ PROFILE ══
function initProfile() {
  if (profile.name) document.getElementById('pf-name').value = profile.name;
  if (profile.profession) document.getElementById('pf-profession').value = profile.profession;
  if (profile.specialty) document.getElementById('pf-specialty').value = profile.specialty;
  if (profile.client) document.getElementById('pf-client').value = profile.client;
  if (profile.offer) document.getElementById('pf-offer').value = profile.offer;
  if (profile.result) document.getElementById('pf-result').value = profile.result;
}

document.getElementById('save-btn').addEventListener('click', () => {
  profile = {
    name: document.getElementById('pf-name').value.trim(),
    profession: document.getElementById('pf-profession').value,
    specialty: document.getElementById('pf-specialty').value.trim(),
    client: document.getElementById('pf-client').value.trim(),
    offer: document.getElementById('pf-offer').value.trim(),
    result: document.getElementById('pf-result').value.trim()
  };
  localStorage.setItem('growin95_profile', JSON.stringify(profile));
  const confirm = document.getElementById('save-confirm');
  confirm.classList.remove('hidden');
  setTimeout(() => confirm.classList.add('hidden'), 3000);
});

// ══ HISTORY ══
function saveToHistory(entry) {
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('growin95_history', JSON.stringify(history));
  updateHistBadge();
}

function updateHistBadge() {
  document.getElementById('hist-badge').textContent = history.length;
}

function renderHistory() {
  const empty = document.getElementById('hist-empty');
  const list = document.getElementById('hist-list');

  if (!history.length) {
    empty.classList.remove('hidden');
    list.innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = history.map((h, i) => `
    <div class="hist-card">
      <div class="hist-meta">
        <span class="hist-tag" style="background:#eff4ff;color:#1a56db">${h.type === 'generate' ? 'Generated' : 'Rewritten'}</span>
        ${h.score ? `<span class="hist-tag" style="background:#f0fdf4;color:#16a34a">Score: ${h.score}</span>` : ''}
        ${h.scoreOptimized ? `<span class="hist-tag" style="background:#f0fdf4;color:#16a34a">${h.scoreInitial}→${h.scoreOptimized}</span>` : ''}
        <span class="hist-tag" style="background:#fafaf9;color:#6b7280">${h.language || 'auto'}</span>
        <span class="hist-date">${h.date}</span>
      </div>
      <div class="hist-excerpt">${h.post}</div>
      <div class="hist-actions">
        <button class="hist-btn" onclick="copyHistPost(${i})">Copy</button>
        <button class="hist-btn danger" onclick="deleteHistPost(${i})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.copyHistPost = function(i) {
  navigator.clipboard.writeText(history[i].post);
};

window.deleteHistPost = function(i) {
  history.splice(i, 1);
  localStorage.setItem('growin95_history', JSON.stringify(history));
  updateHistBadge();
  renderHistory();
};

document.getElementById('clear-btn').addEventListener('click', () => {
  if (!history.length) return;
  if (confirm('Clear all history?')) {
    history = [];
    localStorage.setItem('growin95_history', JSON.stringify(history));
    updateHistBadge();
    renderHistory();
  }
});

// ── UTILS ──
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 6000);
}

function hideError(id) {
  document.getElementById(id).classList.add('hidden');
}

function now() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
