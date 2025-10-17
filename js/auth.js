// js/auth.js
// Sederhana untuk hosting static: simpan status di sessionStorage.
// Ganti kredensial sesuai kebutuhan (JANGAN gunakan di produksi nyata).
const Auth = (() => {
  const ADMIN = { email: 'admin@digineer.id', password: 'digineer123' };
  const KEY = 'digineer:isAdmin';

  function login(email, password){
    const ok = (String(email||'').trim() === ADMIN.email) && (String(password||'') === ADMIN.password);
    if(ok) sessionStorage.setItem(KEY, '1');
    return ok;
  }
  function require(){
    if(sessionStorage.getItem(KEY) !== '1'){
      alert('Anda harus login sebagai admin.');
      location.href = 'login.html';
    }
  }
  function logout(){
    sessionStorage.removeItem(KEY);
    location.href = 'login.html';
  }
  return { login, require, logout };
})();
