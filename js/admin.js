// js/admin.js
// Auth.require(); // Comment dulu jika auth.js belum ada

const Admin = (() => {
  const LS_KEY = 'digineer-admin-products'; // SAMA dengan yang di index.html

  let products = []; // data aktif di panel

  const q = (id) => document.getElementById(id);
  const IDR = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});

  async function loadInitial(){
    // urutan prioritas: localStorage (kalau ada) → assets/products.json → fallback lengkap
    const local = localStorage.getItem(LS_KEY);
    if(local){
      products = JSON.parse(local);
      render(); 
      setStat(`Produk: ${products.length} item • Sumber: localStorage (hasil edit terakhir).`);
      updateDataStats();
      return;
    }
    try{
      const r = await fetch('assets/products.json',{cache:'no-store'});
      if(!r.ok) throw new Error('no file');
      products = await r.json();
      if(!Array.isArray(products)) throw new Error('bad format');
      render(); 
      setStat(`Produk: ${products.length} item • Sumber: assets/products.json`);
      updateDataStats();
    }catch(e){
      // fallback LENGKAP (sama dengan di index.html)
      products = [
        { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000, image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
        { id:'p2', name:'Website Company Profile', category:'development', price:3500000, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', description:'Website perusahaan modern dengan CMS custom dan responsive design' },
        { id:'p3', name:'Video Company Profile', category:'video', price:5000000, image:'https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=800&q=80', description:'Video profil perusahaan profesional dengan animasi dan editing' },
        { id:'p101', name:'Cetak Spanduk', category:'print', price:250000, image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80', description:'Cetak spanduk berkualitas tinggi berbagai ukuran' }
      ];
      render(); 
      setStat(`Produk: ${products.length} item • Sumber: fallback (tidak ditemukan assets/products.json).`);
      updateDataStats();
    }
  }

  function setStat(text){
    const statEl = q('stat');
    if(statEl) statEl.textContent = text;
  }

  function updateDataStats() {
    // Update statistics in the data card
    const totalProductsEl = document.getElementById('totalProducts');
    const dataSourceEl = document.getElementById('dataSource');
    const dataStatusEl = document.getElementById('dataStatus');
    
    if(totalProductsEl) totalProductsEl.textContent = products.length;
    if(dataSourceEl) dataSourceEl.textContent = localStorage.getItem(LS_KEY) ? 'localStorage' : 'products.json';
    if(dataStatusEl) dataStatusEl.textContent = 'Aktif';
  }

  function render(){
    const rows = products.map(p=>`
      <tr>
        <td><img src="${p.image}" alt="${esc(p.name)}" style="width:96px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #e5e9ec" onerror="this.src='https://via.placeholder.com/96x64?text=Image'"></td>
        <td><strong>${esc(p.name)}</strong><div style="color:#64748b;font-size:.9rem">${p.id}</div></td>
        <td>${getCategoryName(p.category)}</td>
        <td>${IDR.format(p.price||0)}</td>
        <td style="max-width:300px;">${esc(p.description||'')}</td>
        <td>
          <button class="secondary" onclick="Admin.edit('${p.id}')" style="padding:8px 12px;margin:2px;"><i class="fa-solid fa-pen"></i> Edit</button>
          <button onclick="Admin.remove('${p.id}')" style="padding:8px 12px;margin:2px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;"><i class="fa-solid fa-trash"></i> Hapus</button>
        </td>
      </tr>
    `).join('');
    
    const rowsEl = document.getElementById('rows');
    if(rowsEl) {
      rowsEl.innerHTML = rows;
    }
    
    // Simpan ke localStorage dengan key yang SAMA
    localStorage.setItem(LS_KEY, JSON.stringify(products));
    updateDataStats();
  }

  function getCategoryName(category) {
    const categories = {
      'design': 'Desain',
      'development': 'Development',
      'video': 'Video', 
      'print': 'Cetak'
    };
    return categories[category] || category;
  }

  function esc(s){ 
    return String(s||'').replace(/[&<>"']/g, m=>({ 
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#039;'
    }[m])); 
  }

  function resetForm(){
    q('p_id').value=''; 
    q('p_name').value=''; 
    q('p_cat').value='design';
    q('p_price').value=''; 
    q('p_image').value=''; 
    q('p_desc').value='';
    q('p_id').readOnly = false;
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
    
    // Validasi lengkap
    if(!item.id || !item.name || !item.category || !item.price || !item.image || !item.description){ 
      showNotification('Semua field wajib diisi!', 'error');
      return; 
    }

    const idx = products.findIndex(x=>x.id===item.id);
    if(idx > -1) {
      // Edit existing
      products[idx] = item;
      showNotification('Produk berhasil diperbarui!', 'success');
    } else {
      // Add new - check if ID exists
      if(products.find(x => x.id === item.id)) {
        showNotification('ID produk sudah ada!', 'error');
        return;
      }
      products.push(item);
      showNotification('Produk berhasil ditambahkan!', 'success');
    }
    
    render(); 
    resetForm();
  }

  function edit(id){
    const p = products.find(x=>x.id===id); 
    if(!p) return;
    
    q('p_id').value = p.id; 
    q('p_name').value = p.name; 
    q('p_cat').value = p.category;
    q('p_price').value = p.price; 
    q('p_image').value = p.image; 
    q('p_desc').value = p.description;
    q('p_id').readOnly = true;
    
    window.scrollTo({top:0,behavior:'smooth'});
    showNotification(`Edit mode: ${p.name}`, 'success');
  }

  function remove(id){
    if(!confirm('Hapus produk ini?')) return;
    products = products.filter(x=>x.id!==id);
    render();
    showNotification('Produk berhasil dihapus!', 'success');
  }

  // Export & Import
  function exportJSON(){
    const blob = new Blob([JSON.stringify(products,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showNotification('File products.json berhasil dibuat. Upload ke /assets/ di repo.', 'success');
  }

  function attachImport(){
    const picker = document.getElementById('filePicker');
    if(!picker) return;
    
    document.getElementById('btnImport').addEventListener('click', ()=>picker.click());
    picker.addEventListener('change', async ()=>{
      const file = picker.files[0]; 
      if(!file) return;
      
      try{
        const text = await file.text();
        const data = JSON.parse(text);
        if(!Array.isArray(data)) throw new Error('Format tidak valid');
        products = data; 
        render(); 
        setStat(`Produk: ${products.length} item • Sumber: Import file`);
        updateDataStats();
        showNotification('Import sukses! Jangan lupa Export lalu upload ke /assets/products.json', 'success');
      }catch(e){ 
        showNotification('Gagal import: ' + e.message, 'error'); 
      }
      picker.value = '';
    });
  }

  // Notification system
  function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNote = document.querySelector('.admin-notification');
    if (existingNote) {
      existingNote.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
      ${message}
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#admin-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'admin-notification-styles';
      styles.textContent = `
        .admin-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          color: white;
          z-index: 1000;
          transform: translateX(400px);
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: Inter, system-ui;
        }
        .admin-notification.show {
          transform: translateX(0);
        }
        .admin-notification.success {
          background: #0fb985;
        }
        .admin-notification.error {
          background: #ef4444;
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Initialize events when DOM is ready
  function initEvents() {
    document.getElementById('btnExport')?.addEventListener('click', exportJSON);
    document.getElementById('btnLogout')?.addEventListener('click', () => {
      if (confirm('Yakin ingin logout?')) {
        window.location.href = 'login.html';
      }
    });
    
    // Add New button
    document.getElementById('btnAddNew')?.addEventListener('click', resetForm);
    
    attachImport();
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initEvents();
    loadInitial();
  });

  return { save, edit, remove, resetForm };
})();
