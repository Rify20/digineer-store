// ===== Storage helpers =====
const KEY = 'digineer-products';
const DEFAULTS = [
  { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000, image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
  { id:'p2', name:'Website Company Profile', category:'development', price:3500000, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', description:'Website perusahaan modern dengan CMS custom dan responsive design' },
];
function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) && v.length ? v : DEFAULTS;
  } catch(e){ return DEFAULTS; }
}
function write(list){
  localStorage.setItem(KEY, JSON.stringify(list));
  // trigger storage event untuk tab lain (Safari tidak memicu di tab yang sama)
  window.dispatchEvent(new StorageEvent('storage', {key: KEY, newValue: JSON.stringify(list)}));
}

// ===== UI refs =====
const form = document.getElementById('form');
const rows = document.getElementById('rows');
const statusEl = document.getElementById('status');

function rupiah(n){ return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0); }
function uid(){ return 'p' + Math.random().toString(36).slice(2,8); }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

// ===== Render table =====
function render(){
  const data = read();
  rows.innerHTML = data.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.name)}</strong><br><span class="badge">${escapeHtml(p.description||'')}</span></td>
      <td>${p.category}</td>
      <td>${rupiah(p.price)}</td>
      <td style="max-width:220px;word-break:break-all;"><a href="${p.image||'#'}" target="_blank">${p.image?'Lihat':'-'}</a></td>
      <td>
        <button onclick="edit('${p.id}')">Edit</button>
        <button onclick="del('${p.id}')" style="margin-left:6px;color:#ef4444">Hapus</button>
      </td>
    </tr>
  `).join('');
}

// ===== CRUD =====
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = document.getElementById('id').value || uid();
  const product = {
    id,
    name: document.getElementById('name').value.trim(),
    category: document.getElementById('category').value,
    price: Number(document.getElementById('price').value||0),
    image: document.getElementById('image').value.trim(),
    description: document.getElementById('description').value.trim()
  };
  let list = read();
  const i = list.findIndex(x=>x.id===id);
  if(i>-1) list[i]=product; else list.push(product);
  write(list);
  render();
  statusEl.textContent = 'Disimpan ✓';
  setTimeout(()=>statusEl.textContent='',1500);
  form.reset();
  document.getElementById('id').value='';
});

document.getElementById('btnReset').addEventListener('click', ()=>{
  form.reset();
  document.getElementById('id').value='';
});

window.edit = function(id){
  const p = read().find(x=>x.id===id);
  if(!p) return;
  document.getElementById('id').value = p.id;
  document.getElementById('name').value = p.name;
  document.getElementById('category').value = p.category;
  document.getElementById('price').value = p.price;
  document.getElementById('image').value = p.image||'';
  document.getElementById('description').value = p.description||'';
  statusEl.textContent = 'Mode edit';
};

window.del = function(id){
  if(!confirm('Hapus produk ini?')) return;
  let list = read().filter(x=>x.id!==id);
  write(list);
  render();
};

// ===== Init =====
render();
