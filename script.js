// ============================================
// GROW IN 9.5 — script.js
// ============================================

// ── STATE ──
let selectedObjective = 'attirer des prospects';
let history = JSON.parse(localStorage.getItem('growin95_history') || '[]');
let profile = JSON.parse(localStorage.getItem('growin95_profile') || '{}');

// ── ELEMENTS ──
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const objBtns = document.querySelectorAll('.obj-btn');
const postInput = document.getElementById('post-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const formCard = document.getElementById('form-card');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const results = document.getElementById('results');
const errorMsg = document.getElementById('error-msg');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const saveConfirm = document.getElementById('save-confirm');
const histBadge = document.getElementById('hist-badge');
const clearBtn = document.getElementById('clear-btn');

// ── TABS ──
tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function switchTab(id) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  panels.forEach(p => p.classList.toggle('active', p.id === 'tab-' + id));
  if (id === 'history') renderHistory();
}

window.switchTab = switchTab;

// ── OBJECTIVES ──
objBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    objBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedObjective = btn.dataset.value;
  });
});

// ── WORD COUNT ──
postInput.addEventListener('input', () => {
  const words = postInput.value.trim().split(/\s+/).filter(Boolean).length;
  charCount.textContent = `${words} mot${words !== 1 ? 's' : ''}`;
});

// ── PROFILE : charge les valeurs sauvegardées ──
function loadProfile() {
  if (profile.name) document.getElementById('pf-name').value = profile.name || '';
  if (profile.type) document.getElementById('pf-type').value = profile.type || 'coach';
  if (profile.offer) document.getElementById('pf-offer').value = profile.offer || '';
  if (profile.client) document.getElementById('pf-client').value = profile.client || '';
  if (profile.result) document.getElementById('pf-result').value = profile.result || '';
  if (profile.title) document.getElementById('pf-title').value = profile.title || '';
  if (profile.about) document.getElementById('pf-about').value = profile.about || '';
}

loadProfile();

// ── PROFILE : met à jour l'indicateur ──
function updateProfileHint() {
  const hint = document.getElementById('profile-hint');
  if (profile.offer && profile.client) {
    hint.style.background = '#f0fdf4';
    hint.style.borderColor = '#bbf7d0';
    hint.querySelector('svg').style.color = '#16a34a';
    hint.querySelector('span').innerHTML = `Analyse personnalisée pour <strong>${profile.name || 'toi'}</strong> — ${profile.type || 'indépendant'} · ${profile.offer.substring(0, 60)}${profile.offer.length > 60 ? '…' : ''}`;
  }
}

updateProfileHint();

// ── SAVE PROFILE ──
saveBtn.addEventListener('click', () => {
  profile = {
    name: document.getElementById('pf-name').value.trim(),
    type: document.getElementById('pf-type').value,
    offer: document.getElementById('pf-offer').value.trim(),
    client: document.getElementById('pf-client').value.trim(),
    result: document.getElementById('pf-result').value.trim(),
    title: document.getElementById('pf-title').value.trim(),
    about: document.getElementById('pf-about').value.trim()
  };
  localStorage.setItem('growin95_profile', JSON.stringify(profile));
  saveConfirm.classList.remove('hidden');
  updateProfileHint();
  setTimeout(() => saveConfirm.classList.add('hidden'), 3000);
});

// ── LOADING MESSAGES ──
const loadingMessages = [
  'Analyse de ton post…',
  'Évaluation des 4 critères…',
  'Identification des erreurs…',
  'Réécriture en cours…',
  'Finalisation…'
];

let loadingInterval = null;

function startLoading() {
  let i = 0;
  loadingText.textContent = loadingMessages[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    loadingText.textContent = loadingMessages[i];
  }, 1800);
}

function stopLoading() {
  if (loadingInterval) clearInterval(loadingInterval);
}

// ── ANALYZE ──
analyzeBtn.addEventListener('click', async () => {
  const post = postInput.value.trim();
  if (!post || post.length < 30) {
    showError('Colle un post d\'au moins 30 caractères pour une analyse pertinente.');
    return;
  }

  hideError();
  setLoading(true);

  const body = { post, objective: selectedObjective };

  if (profile.offer) {
    body.profile = {
      type: profile.type,
      offer: profile.offer,
      client: profile.client,
      result: profile.result
    };
  }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();
    renderResults(data, post);

  } catch (err) {
    console.error(err);
    showError(`Erreur : ${err.message}. Réessaie dans quelques secondes.`);
  } finally {
    setLoading(false);
  }
});

// ── RENDER RESULTS ──
function renderResults(data, originalPost) {
  const si = parseInt(data.scoreInitial) || 0;
  const so = parseInt(data.scoreOptimized) || 0;

  document.getElementById('score-initial').textContent = si + '/100';
  document.getElementById('score-optimized').textContent = so + '/100';

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.getElementById('bar-initial').style.width = `${si}%`;
      document.getElementById('bar-optimized').style.width = `${so}%`;
    }, 100);
  });

  document.getElementById('diagnostic').textContent = data.diagnostic || '—';
  document.getElementById('errors').textContent = data.errors || '—';
  document.getElementById('fixes').textContent = data.fixes || '—';
  document.getElementById('improved').textContent = data.improved || '—';

  formCard.style.display = 'none';
  results.classList.add('visible');

  saveToHistory({
    post: data.improved,
    original: originalPost,
    scoreInitial: si,
    scoreOptimized: so,
    objective: selectedObjective,
    profile: profile.type || 'indépendant',
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  });

  setTimeout(() => results.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ── COPY ──
copyBtn.addEventListener('click', () => {
  const text = document.getElementById('improved').textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '✓ Copié !';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copier';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});

// ── RESET ──
resetBtn.addEventListener('click', () => {
  results.classList.remove('visible');
  formCard.style.display = 'flex';
  postInput.value = '';
  charCount.textContent = '0 mots';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── HISTORY ──
function saveToHistory(entry) {
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('growin95_history', JSON.stringify(history));
  updateHistBadge();
}

function updateHistBadge() {
  histBadge.textContent = history.length;
}

function renderHistory() {
  const empty = document.getElementById('hist-empty');
  const list = document.getElementById('hist-list');

  if (!history.length) {
    empty.style.display = 'flex';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = history.map((h, i) => `
    <div class="hist-card">
      <div class="hist-meta">
        <span class="hist-tag" style="background:#eff4ff;color:#1a56db">${h.profile || 'coach'}</span>
        <span class="hist-tag" style="background:#f0fdf4;color:#16a34a">${h.scoreInitial}→${h.scoreOptimized}</span>
        <span class="hist-tag" style="background:#fffbeb;color:#d97706">${h.objective || 'prospects'}</span>
        <span class="hist-date">${h.date}</span>
      </div>
      <div class="hist-excerpt">${h.post}</div>
      <div class="hist-actions">
        <button class="hist-btn" onclick="copyHistPost(${i})">Copier</button>
        <button class="hist-btn danger" onclick="deleteHistPost(${i})">Supprimer</button>
      </div>
    </div>
  `).join('');
}

window.copyHistPost = function(i) {
  navigator.clipboard.writeText(history[i].post);
  const btns = document.querySelectorAll('.hist-card')[i].querySelectorAll('.hist-btn');
  const btn = btns[0];
  const orig = btn.textContent;
  btn.textContent = '✓ Copié !';
  setTimeout(() => { btn.textContent = orig; }, 1500);
};

window.deleteHistPost = function(i) {
  history.splice(i, 1);
  localStorage.setItem('growin95_history', JSON.stringify(history));
  updateHistBadge();
  renderHistory();
};

clearBtn.addEventListener('click', () => {
  if (!history.length) return;
  if (confirm('Effacer tout l\'historique ?')) {
    history = [];
    localStorage.setItem('growin95_history', JSON.stringify(history));
    updateHistBadge();
    renderHistory();
  }
});

// ── UI HELPERS ──
function setLoading(active) {
  analyzeBtn.disabled = active;
  if (active) {
    formCard.style.display = 'none';
    loading.classList.add('visible');
    startLoading();
  } else {
    loading.classList.remove('visible');
    stopLoading();
    if (!results.classList.contains('visible')) {
      formCard.style.display = 'flex';
    }
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  formCard.style.display = 'flex';
  setTimeout(() => errorMsg.classList.remove('visible'), 6000);
}

function hideError() {
  errorMsg.classList.remove('visible');
}

// ── INIT ──
updateHistBadge();
