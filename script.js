// ============================================
// POSTDECODER — Frontend Logic
// ============================================

// ---- State ----
let selectedObjective = 'visibilité';

// ---- Elements ----
const objectiveBtns = document.querySelectorAll('.obj-btn');
const postInput = document.getElementById('postInput');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const formCard = document.querySelector('.form-card');
const loadingState = document.getElementById('loadingState');
const results = document.getElementById('results');
const errorMsg = document.getElementById('errorMsg');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');

// ---- Objective selector ----
objectiveBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    objectiveBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedObjective = btn.dataset.value;
  });
});

// ---- Char counter ----
postInput.addEventListener('input', () => {
  const len = postInput.value.length;
  charCount.textContent = `${len} caractère${len > 1 ? 's' : ''}`;
});

// ---- Analyze ----
analyzeBtn.addEventListener('click', async () => {
  const post = postInput.value.trim();

  // Validation
  if (!post || post.length < 30) {
    showError('Colle un post LinkedIn d\'au moins 30 caractères pour une analyse pertinente.');
    return;
  }

  hideError();
  setLoading(true);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post, objective: selectedObjective })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur (${response.status})`);
    }

    const data = await response.json();
    renderResults(data);

  } catch (err) {
    console.error(err);
    showError(`Une erreur s'est produite : ${err.message}. Réessaie dans quelques secondes.`);
  } finally {
    setLoading(false);
  }
});

// ---- Copy improved version ----
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

// ---- Reset ----
resetBtn.addEventListener('click', () => {
  results.classList.remove('visible');
  formCard.style.display = 'flex';
  postInput.value = '';
  charCount.textContent = '0 caractères';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- Render Results ----
function renderResults(data) {
  // Scores
  const si = parseInt(data.scoreInitial) || 0;
  const so = parseInt(data.scoreOptimized) || 0;

  document.getElementById('scoreInitial').textContent = si + '/100';
  document.getElementById('scoreOptimized').textContent = so + '/100';

  // Animate bars after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.getElementById('barInitial').style.width = `${si}%`;
      document.getElementById('barOptimized').style.width = `${so}%`;
    }, 100);
  });

  // Content
  document.getElementById('diagnostic').textContent = data.diagnostic || '—';
  document.getElementById('errors').textContent = data.errors || '—';
  document.getElementById('fixes').textContent = data.fixes || '—';
  document.getElementById('improved').textContent = data.improved || '—';

  // Show results, hide form
  formCard.style.display = 'none';
  results.classList.add('visible');

  // Scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ---- UI Helpers ----
function setLoading(active) {
  analyzeBtn.disabled = active;
  if (active) {
    formCard.style.display = 'none';
    loadingState.classList.add('visible');
  } else {
    loadingState.classList.remove('visible');
    if (results.classList.contains('visible')) return;
    formCard.style.display = 'flex';
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 6000);
}

function hideError() {
  errorMsg.classList.remove('visible');
}
