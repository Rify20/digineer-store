// js/admin.js
Auth.require();

const Admin = (() => {
  const LS_KEY = 'digineer:products';

  let products = []; // data aktif di panel

  const q = (id) => document.getElementById(id);
  const IDR = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});

  async function loadInitial(){
    // urutan prioritas: localStorage (kalau ada) → assets/products.json → fallback index bawaan
    const local = localStorage.getItem(LS_KEY);
    if(local){
      products = JSON.parse(local);
      render(); setStat('Sumber: localStorage (hasil edit terakhir).');
      return;
    }
    try{
      const r = await fetch('assets/products.json',{cache:'no-store'});
      if(!r.ok) throw new Error('no file');
      products = await r.json();
      if(!Array.isArray(products)) throw new Error('bad format');
      render(); setStat('Sumber: assets/products.json');
    }catch(e){
      // fallback kecil (sama seperti di index, minimal)
      products = [
        { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000, image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
        { id:'p2', name:'Website Company Profile', category:'development', price:3500000, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', description:'Website perusahaan modern dengan CMS custom dan responsive design' }
      ];
      render(); setStat('Sumber: fallback (tidak ditemukan assets/products.json).');
    }
  }

  function setStat(text){
    q('stat').textContent = `Produk: ${products.length} item • ${text}`;
  }

  function render(){
    const rows = products.map(p=>`
      <tr>
        <td><img src="${p.image}" alt="" style="width:96px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #e5e9ec"></td>
        <td><strong>${esc(p.name)}</strong><div style="color:#64748b;font-size:.9rem">${p.id}</div></td>
        <td>${p.category}</td>
        <td>${IDR.format(p.price||0)}</td>
        <td>${esc(p.description||'')}</td>
        <td>
          <button class="secondary" onclick="Admin.edit('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button onclick="Admin.remove('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
    document.getElementById('rows').innerHTML = rows;
    localStorage.setItem(LS_KEY, JSON.stringify(products));
  }

  function esc(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#039;'}[m])); }

  function resetForm(){
    q('p_id').value=''; q('p_name').value=''; q('p_cat').value='design';
    q('p_price').value=''; q('p_image').value=''; q('p_desc').value='';
  }

  function save(){
    const item = {
      id: q('p_id').value.trim(),
      name: q('p_name').value.trim(),
      category: q('p_cat').value,
      price: Number(q('p_price').value||0),
      image: q('p_image').value.trim(),
      description: q('p_desc').value.trim()
    };
    if(!item.id || !item.name){ alert('ID dan Nama wajib diisi'); return; }
    const idx = products.findIndex(x=>x.id===item.id);
    if(idx>-1) products[idx] = item; else products.push(item);
    render(); resetForm();
  }

  function edit(id){
    const p = products.find(x=>x.id===id); if(!p) return;
    q('p_id').value=p.id; q('p_name').value=p.name; q('p_cat').value=p.category;
    q('p_price').value=p.price; q('p_image').value=p.image; q('p_desc').value=p.description;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function remove(id){
    if(!confirm('Hapus produk ini?')) return;
    products = products.filter(x=>x.id!==id);
    render();
  }

  // Export & Import
  function exportJSON(){
    const blob = new Blob([JSON.stringify(products,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(a.href);
    alert('File products.json berhasil dibuat. Upload ke /assets/ di repo kamu.');
  }
  function attachImport(){
    const picker = document.getElementById('filePicker');
    document.getElementById('btnImport').addEventListener('click', ()=>picker.click());
    picker.addEventListener('change', async ()=>{
      const file = picker.files[0]; if(!file) return;
      try{
        const text = await file.text();
        const data = JSON.parse(text);
        if(!Array.isArray(data)) throw new Error('Format tidak valid');
        products = data; render(); setStat('Sumber: Import file (belum diupload ke assets).');
        alert('Import sukses. Jangan lupa klik Export lalu upload ke /assets/products.json di repo.');
      }catch(e){ alert('Gagal import: '+e.message); }
      picker.value = '';
    });
  }

  // events
  document.getElementById('btnExport').addEventListener('click', exportJSON);
  document.getElementById('btnLogout').addEventListener('click', Auth.logout);
  attachImport();
  loadInitial();

  return { save, edit, remove, resetForm };
})();
