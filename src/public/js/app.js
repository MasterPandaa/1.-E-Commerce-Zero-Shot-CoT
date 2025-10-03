const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...options, headers });
  const ct = res.headers.get('content-type') || '';
  let body = null;
  if (ct.includes('application/json')) body = await res.json();
  if (!res.ok) {
    const msg = (body && (body.message || JSON.stringify(body))) || res.statusText;
    throw new Error(msg);
  }
  return body;
}

function setAuthUI() {
  const token = getToken();
  const logoutBtn = document.getElementById('logoutBtn');
  const adminLink = document.getElementById('adminLink');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  if (!logoutBtn) return;
  if (token) {
    loginLink && (loginLink.classList.add('hidden'));
    registerLink && (registerLink.classList.add('hidden'));
    logoutBtn && (logoutBtn.classList.remove('hidden'));
    api('/auth/me').then((me) => {
      if (me.role === 'admin') adminLink && adminLink.classList.remove('hidden');
    }).catch(() => {});
  } else {
    logoutBtn && (logoutBtn.classList.add('hidden'));
    adminLink && (adminLink.classList.add('hidden'));
    loginLink && (loginLink.classList.remove('hidden'));
    registerLink && (registerLink.classList.remove('hidden'));
  }
  logoutBtn && logoutBtn.addEventListener('click', () => {
    setToken(null);
    window.location.href = '/';
  });
}

document.addEventListener('DOMContentLoaded', setAuthUI);
