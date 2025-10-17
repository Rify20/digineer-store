// ===== Storage helpers =====
const KEY = 'digineer-admin-products'; // Changed to match the new key
const DEFAULTS = [
  { 
    id:'p1', 
    name:'Paket Branding Professional', 
    category:'design', 
    price:2500000, 
    image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', 
    description:'Logo, brand guide, stationery design, dan social media kit lengkap' 
  },
  { 
    id:'p2', 
    name:'Website Company Profile', 
    category:'development', 
    price:3500000, 
    image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 
    description:'Website perusahaan modern dengan CMS custom dan responsive design' 
  },
  { 
    id:'p3', 
    name:'Video Company Profile', 
    category:'video', 
    price:5000000, 
    image:'https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=800&q=80', 
    description:'Video profil perusahaan profesional dengan animasi dan editing' 
  },
  { 
    id:'p101', 
    name:'Cetak Spanduk', 
    category:'print', 
    price:250000, 
    image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80', 
    description:'Cetak spanduk berkualitas tinggi berbagai ukuran' 
  }
];

function read() {
  try {
    // Try to load from localStorage first
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const v = JSON.parse(saved);
      return Array.isArray(v) && v.length ? v : DEFAULTS;
    }
    
    // If not in localStorage, try to load from products.json
    return loadFromProductsJson();
  } catch(e){ 
    console.error('Error reading products:', e);
    return DEFAULTS; 
  }
}

async function loadFromProductsJson() {
  try {
    const response = await fetch('assets/products.json');
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : DEFAULTS;
    }
  } catch (error) {
    console.log('Failed to load products.json, using defaults:', error);
  }
  return DEFAULTS;
}

function write(list){
  localStorage.setItem(KEY, JSON.stringify(list));
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', { 
    key: KEY, 
    newValue: JSON.stringify(list) 
  }));
  updateStats();
}

// ===== UI refs =====
const form = document.getElementById('form');
const rows = document.getElementById('rows');
const statusEl = document.getElementById('status');
const totalProductsEl = document.getElementById('totalProducts');
const dataSourceEl = document.getElementById('dataSource');

function rupiah(n){ 
  return new Intl.NumberFormat('id-ID',{
    style:'currency',
    currency:'IDR',
    maximumFractionDigits:0
  }).format(n||0); 
}

function uid(){ 
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); 
}

function escapeHtml(s){ 
  return (s||'').replace(/[&<>"']/g, m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[m])); 
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

// ===== Render table =====
function render(){
  const data = read();
  rows.innerHTML = data.map(p => `
    <tr>
      <td>
        <img src="${p.image}" alt="${p.name}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;"
             onerror="this.src='https://via.placeholder.com/60x45?text=Image'">
      </td>
      <td>
        <strong>${escapeHtml(p.name)}</strong><br>
        <small style="color:#666;">${p.id}</small>
      </td>
      <td>${getCategoryName(p.category)}</td>
      <td>${rupiah(p.price)}</td>
      <td style="max-width:200px;">${escapeHtml(p.description)}</td>
      <td>
        <button onclick="edit('${p.id}')" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">
          <i class="fa-solid fa-edit"></i> Edit
        </button>
        <button onclick="del('${p.id}')" style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;margin-left:6px;">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
      </td>
    </tr>
  `).join('');
  
  updateStats();
}

// ===== Update Statistics =====
function updateStats() {
  const data = read();
  if (totalProductsEl) {
    totalProductsEl.textContent = data.length;
  }
  if (dataSourceEl) {
    dataSourceEl.textContent = localStorage.getItem(KEY) ? 'localStorage' : 'products.json';
  }
}

// ===== CRUD Operations =====
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
  
  // Validation
  if (!product.name || !product.category || !product.price || !product.image || !product.description) {
    showNotification('Harap isi semua field!', 'error');
    return;
  }
  
  let list = read();
  const existingIndex = list.findIndex(x => x.id === id);
  
  if (existingIndex > -1) {
    // Update existing product
    list[existingIndex] = product;
    showNotification('Produk berhasil diperbarui!', 'success');
  } else {
    // Check if ID already exists (for new products)
    if (list.find(x => x.id === id)) {
      showNotification('ID produk sudah ada!', 'error');
      return;
    }
    // Add new product
    list.push(product);
    showNotification('Produk berhasil ditambahkan!', 'success');
  }
  
  write(list);
  render();
  form.reset();
  document.getElementById('id').value = '';
});

document.getElementById('btnReset')?.addEventListener('click', ()=>{
  form.reset();
  document.getElementById('id').value = '';
});

// Import/Export functionality
document.getElementById('btnImport')?.addEventListener('click', () => {
  document.getElementById('filePicker').click();
});

document.getElementById('btnExport')?.addEventListener('click', () => {
  exportProducts();
});

document.getElementById('filePicker')?.addEventListener('change', (e) => {
  importProducts(e);
});

function exportProducts() {
  const data = read();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'products.json';
  link.click();
  
  showNotification('File products.json berhasil diunduh!', 'success');
}

function importProducts(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        write(importedData);
        render();
        showNotification('Produk berhasil diimport!', 'success');
      } else {
        showNotification('Format file tidak valid!', 'error');
      }
    } catch (error) {
      showNotification('Error membaca file: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

window.edit = function(id){
  const p = read().find(x => x.id === id);
  if(!p) return;
  
  document.getElementById('id').value = p.id;
  document.getElementById('name').value = p.name;
  document.getElementById('category').value = p.category;
  document.getElementById('price').value = p.price;
  document.getElementById('image').value = p.image || '';
  document.getElementById('description').value = p.description || '';
  
  showNotification('Mode edit - ' + p.name, 'success');
};

window.del = function(id){
  if(!confirm('Hapus produk ini?')) return;
  
  let list = read().filter(x => x.id !== id);
  write(list);
  render();
  showNotification('Produk berhasil dihapus!', 'success');
};

// ===== Notification System =====
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existingNote = document.querySelector('.notification');
  if (existingNote) {
    existingNote.remove();
  }
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fa-solid fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    ${message}
  `;
  
  // Add styles if not exists
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
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
      }
      .notification.show {
        transform: translateX(0);
      }
      .notification.success {
        background: #0fb985;
      }
      .notification.error {
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

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
  render();
  showNotification('Admin panel dimuat!', 'success');
});

// Listen for storage changes (from other tabs)
window.addEventListener('storage', function(e) {
  if (e.key === KEY) {
    render();
  }
});
