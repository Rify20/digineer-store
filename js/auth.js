// ===== Simple Front-End Auth (for static hosting) =====
const AUTH_KEY = 'digineer-auth';

// GANTI kredensial ini sesuai kebutuhanmu (jangan commit ke publik kalau bisa)
const AUTH_USERS = [
  { username: 'admin', password: 'digineer123' }
];

// Buat token dengan expiry (default 12 jam)
function setAuth(username, hours=12){
  const exp = Date.now() + hours*60*60*1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ username, exp }));
}

function getAuth(){
  try {
    const obj = JSON.parse(localStorage.getItem(AUTH_KEY));
    if(!obj) return null;
    if(Date.now() > (obj.exp||0)) { localStorage.removeItem(AUTH_KEY); return null; }
    return obj;
  } catch(e){ return null; }
}

function isAuthed(){ return !!getAuth(); }

function requireAuth(redirect='login.html'){
  if(!isAuthed()){ window.location.href = redirect + '?next=' + encodeURIComponent(location.pathname); }
}

function logout(redirect='login.html'){
  localStorage.removeItem(AUTH_KEY);
  window.location.href = redirect;
}

// Validasi kredensial
function tryLogin(username, password){
  const ok = AUTH_USERS.some(u => u.username===username && u.password===password);
  if(ok){ setAuth(username); }
  return ok;
}

window.DAuth = { isAuthed, requireAuth, logout, tryLogin, getAuth };
