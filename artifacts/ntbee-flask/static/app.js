/* GovBenefits NTBEE — app.js
   Language toggle + multi-step form logic */

/* ── Language toggle ── */

const LANG_KEY = 'ntbee_lang';

function applyLang(lang) {
  document.getElementById('html-root').lang = lang === 'es' ? 'es' : 'en';
  document.querySelectorAll('[data-en]').forEach(function(el) {
    el.textContent = lang === 'es' ? (el.dataset.es || el.dataset.en) : el.dataset.en;
  });
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';
  localStorage.setItem(LANG_KEY, lang);
}

function toggleLang() {
  const current = localStorage.getItem(LANG_KEY) || 'en';
  applyLang(current === 'en' ? 'es' : 'en');
}

// Apply saved language on page load
(function() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && saved !== 'en') applyLang(saved);
})();


/* ── Multi-step form ── */

var currentStep = 1;

function goToStep(n) {
  currentStep = n;
  var s1 = document.getElementById('step1Section');
  var s2 = document.getElementById('step2Section');
  var bar = document.getElementById('progressBar');
  var label = document.getElementById('stepLabel');

  if (!s1 || !s2) return;

  if (n === 1) {
    s1.classList.remove('d-none');
    s2.classList.add('d-none');
    if (bar) bar.style.width = '50%';
    if (label) {
      var lang = localStorage.getItem(LANG_KEY) || 'en';
      label.textContent = lang === 'es' ? 'Paso 1 de 2: Información del hogar' : 'Step 1 of 2: Household Basics';
    }
  } else {
    s1.classList.add('d-none');
    s2.classList.remove('d-none');
    if (bar) bar.style.width = '100%';
    if (label) {
      var lang = localStorage.getItem(LANG_KEY) || 'en';
      label.textContent = lang === 'es' ? 'Paso 2 de 2: Detalles del hogar' : 'Step 2 of 2: Household Details';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function validateStep1() {
  var valid = true;
  var errors = [];

  // Household size
  var hs = document.getElementById('household_size');
  if (hs) {
    var hsVal = parseInt(hs.value, 10);
    if (!hs.value || isNaN(hsVal) || hsVal < 1 || hsVal > 20) {
      markError(hs, 'Please enter a household size between 1 and 20.');
      valid = false;
    } else {
      clearError(hs);
    }
  }

  // Monthly income
  var mi = document.getElementById('monthly_income');
  if (mi) {
    var miVal = parseFloat(mi.value);
    if (mi.value === '' || isNaN(miVal) || miVal < 0) {
      markError(mi, 'Please enter your monthly income (enter 0 if no income).');
      valid = false;
    } else {
      clearError(mi);
    }
  }

  // ZIP code
  var zp = document.getElementById('zip_code');
  if (zp) {
    var zpVal = zp.value.trim();
    if (!zpVal || !/^\d{5}$/.test(zpVal)) {
      markError(zp, 'Please enter a valid 5-digit ZIP code.');
      valid = false;
    } else {
      clearError(zp);
    }
  }

  return valid;
}

function markError(el, msg) {
  el.classList.add('is-invalid');
  var feedback = el.parentElement.querySelector('.client-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'invalid-feedback client-feedback';
    el.parentElement.appendChild(feedback);
  }
  feedback.textContent = msg;
}

function clearError(el) {
  el.classList.remove('is-invalid');
  var feedback = el.parentElement.querySelector('.client-feedback');
  if (feedback) feedback.remove();
}

function nextStep() {
  if (validateStep1()) {
    goToStep(2);
  }
}

function prevStep() {
  goToStep(1);
}
