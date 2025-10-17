/* ====== Sumber data: assets/products.json (fallback ke array di bawah) ====== */
let products = []; // diisi lewat loadProducts()
const FALLBACK_PRODUCTS = [
  { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000, image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
  { id:'p2', name:'Website Company Profile', category:'development', price:3500000, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', description:'Website perusahaan modern dengan CMS custom dan responsive design' },
  { id:'p3', name:'Video Company Profile', category:'video', price:5000000, image:'https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=800&q=80', description:'Video profil perusahaan profesional dengan animasi dan editing' },
  { id:'p101', name:'Cetak Spanduk', category:'print', price:250000, image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80', description:'Cetak spanduk berkualitas tinggi berbagai ukuran' }
];

/* ====== State & Utils ====== */
let cart = JSON.parse(localStorage.getItem('digineer-cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('digineer-wishlist')) || [];
let currentFilter = 'all';
let currentSearch = '';
const IDR = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
const WHATSAPP_NUMBER = '089507083879';
const toWaIntl = n => { 
  let s=(n||'').replace(/\D/g,''); 
  if(s.startsWith('0')) s='62'+s.slice(1); 
  if(s.startsWith('620')) s='62'+s.slice(2); 
  return s; 
};
const WAPP = toWaIntl(WHATSAPP_NUMBER);
const debounce = (fn, d=300)=>{ 
  let t; 
  return (...a)=>{ 
    clearTimeout(t); 
    t=setTimeout(()=>fn(...a),d); 
  } 
};
const escapeHTML = s => (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const getCategoryName = c => ({
  design:'Desain',
  development:'Development',
  video:'Video Production',
  print:'Cetak'
})[c]||c;

function syncStateToURL(){ 
  const url=new URL(window.location); 
  url.searchParams.set('filter', currentFilter); 
  url.searchParams.set('q', currentSearch||''); 
  history.replaceState({},'',url); 
}

function readStateFromURL(){
  const url=new URL(window.location);
  currentFilter=url.searchParams.get('filter')||'all';
  currentSearch=url.searchParams.get('q')||'';
  const input=document.getElementById('searchInput'); 
  if(input) input.value=currentSearch;
  
  document.querySelectorAll('.chip').forEach(c=>{
    c.classList.remove('active');
    c.setAttribute('aria-selected','false');
  });
  
  const idx = {all:0,design:1,development:2,video:3,print:4}[currentFilter] ?? 0;
  const chip = document.querySelectorAll('.chip')[idx]; 
  if(chip){
    chip.classList.add('active');
    chip.setAttribute('aria-selected','true');
  }
}

/* ====== Drawer ====== */
const btnMenu = document.getElementById('btnMenu');
const drawer = document.getElementById('drawer');
function closeDrawer(){ 
  drawer.classList.remove('open'); 
  btnMenu.setAttribute('aria-expanded','false'); 
}

if (btnMenu) {
  btnMenu.addEventListener('click', ()=>{ 
    const open = drawer.classList.toggle('open'); 
    btnMenu.setAttribute('aria-expanded', String(open)); 
  });
}

/* ====== Skeleton ====== */
function showSkeleton(n=6){
  const grid=document.getElementById('productsContainer');
  if (!grid) return;
  
  grid.setAttribute('aria-busy','true');
  grid.innerHTML = Array.from({length:n}).map(()=>`
    <div class="col">
      <div class="sk-card">
        <div class="sk sk-img"></div>
        <div class="sk-body">
          <div class="sk sk-line" style="width:40%"></div>
          <div class="sk sk-line" style="width:80%"></div>
          <div class="sk sk-line" style="width:60%"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ====== Products render ====== */
function renderProducts(){
  const grid=document.getElementById('productsContainer');
  if (!grid) return;
  
  let list=[...products];
  if(currentFilter!=='all'){ 
    list=list.filter(p=>p.category===currentFilter); 
  }
  if(currentSearch){ 
    const q=currentSearch.toLowerCase(); 
    list=list.filter(p=>
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    ); 
  }

  if(list.length===0){
    grid.innerHTML = `
      <div class="col" style="grid-column:1/-1;text-align:center;color:#62707f">
        <p>Tidak ada layanan yang cocok.</p>
        <button class="btn btn-primary" style="margin-top:.75rem" id="btnResetSearch">
          Reset Pencarian
        </button>
      </div>
    `;
    grid.removeAttribute('aria-busy'); 
    
    // Add event listener to reset button
    const resetBtn = document.getElementById('btnResetSearch');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetSearch);
    }
    return;
  }

  grid.innerHTML = list.map(p=>`
    <div class="col">
      <article class="card">
        <img class="cover" loading="lazy" decoding="async"
             src="${p.image}"
             onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Digineer';"
             alt="${escapeHTML(p.name)}">
        <div class="card-body">
          <div class="cat">${getCategoryName(p.category)}</div>
          <h3 class="title">${escapeHTML(p.name)}</h3>
          <p class="desc">${escapeHTML(p.description)}</p>
          <div class="meta">
            <div class="price">${IDR.format(p.price)}</div>
            <div class="actions">
              <button class="btn-buy" aria-label="Tambah ${escapeHTML(p.name)} ke keranjang" data-id="${p.id}">
                <i class="fas fa-cart-plus"></i> Beli
              </button>
              <button class="round wish ${wishlist.includes(p.id)?'active':''}" aria-label="Wishlist ${escapeHTML(p.name)}" data-id="${p.id}">
                <i class="${wishlist.includes(p.id)?'fas':'far'} fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  `).join('');

  // Add event listeners to dynamically created buttons
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      addToCart(id);
    });
  });
  
  document.querySelectorAll('.round.wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      toggleWishlist(id);
    });
  });

  grid.removeAttribute('aria-busy');
}

function displayProducts(){ 
  renderProducts(); 
  syncStateToURL(); 
}

/* ====== Filter & Search ====== */
function filterProducts(cat, el){
  currentFilter=cat;
  document.querySelectorAll('.chip').forEach(c=>{
    c.classList.remove('active');
    c.setAttribute('aria-selected','false');
  });
  if(el){ 
    el.classList.add('active'); 
    el.setAttribute('aria-selected','true'); 
  }
  displayProducts();
}

function setupFilterListeners() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const filter = e.currentTarget.getAttribute('data-filter');
      filterProducts(filter, e.currentTarget);
    });
  });
}

const onSearch = debounce((q)=>{ 
  currentSearch=(q||'').trim(); 
  displayProducts(); 
},300);

function resetSearch(){ 
  currentSearch=''; 
  const i=document.getElementById('searchInput'); 
  if(i) i.value=''; 
  displayProducts(); 
}

/* ====== Cart ====== */
const overlay = document.getElementById('overlay');
const cartEl = document.getElementById('cart');
let lastFocused=null;

function toggleCart(){
  if (!cartEl) return;
  
  const willOpen = !cartEl.classList.contains('active');
  cartEl.classList.toggle('active');
  
  if (overlay) {
    overlay.classList.toggle('active');
  }
  
  document.body.style.overflow = willOpen ? 'hidden' : '';
  
  if(willOpen){
    lastFocused=document.activeElement;
    const f=cartEl.querySelector('button,[href],input'); 
    if(f) f.focus();
    document.addEventListener('keydown',cartKeys);
  }else{
    document.removeEventListener('keydown',cartKeys);
    if(lastFocused) lastFocused.focus();
  }
}

function cartKeys(e){ 
  if(e.key==='Escape') toggleCart(); 
}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  if (!p) return;
  
  const ex=cart.find(x=>x.id===id);
  if(ex){ 
    ex.quantity+=1; 
  } else { 
    cart.push({...p,quantity:1}); 
  }
  
  localStorage.setItem('digineer-cart', JSON.stringify(cart));
  updateCartUI();
  showNotification(`"${p.name}" ditambahkan ke keranjang! 🛒`, 'success');
}

function updateCartUI(){
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = cart.reduce((s,i)=>s+i.quantity,0);
  }
  
  const box=document.getElementById('cartItems');
  const totalEl=document.getElementById('cartTotal');
  
  if(!box || !totalEl) return;
  
  if(cart.length===0){
    box.innerHTML = `
      <div style="text-align:center;color:#62707f">
        <p>Keranjang kosong</p>
        <button class="btn btn-primary" style="margin-top:.75rem" id="btnViewProducts">
          Lihat Layanan
        </button>
      </div>
    `;
    totalEl.textContent = IDR.format(0); 
    
    const viewBtn = document.getElementById('btnViewProducts');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        toggleCart();
        scrollToProducts();
      });
    }
    return;
  }
  
  box.innerHTML = cart.map(i=>`
    <div class="cart-i">
      <img src="${i.image}" alt="${escapeHTML(i.name)}" 
           onerror="this.src='https://via.placeholder.com/64x64?text=Image'">
      <div style="flex:1">
        <div style="font-weight:800">${escapeHTML(i.name)}</div>
        <div style="color:#0a8f7e;font-weight:900">${IDR.format(i.price)} × ${i.quantity}</div>
        <div style="display:flex;gap:.5rem;margin-top:.5rem;align-items:center">
          <button class="icon-btn" aria-label="Kurangi ${escapeHTML(i.name)}" 
                  data-id="${i.id}" data-action="decrease" ${i.quantity<=1?'disabled':''}>
            <i class="fas fa-minus"></i>
          </button>
          <span aria-live="polite">${i.quantity}</span>
          <button class="icon-btn" aria-label="Tambah ${escapeHTML(i.name)}" 
                  data-id="${i.id}" data-action="increase">
            <i class="fas fa-plus"></i>
          </button>
          <button class="icon-btn" aria-label="Hapus ${escapeHTML(i.name)}" 
                  data-id="${i.id}" data-action="remove" style="margin-left:auto;color:var(--error)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to cart buttons
  document.querySelectorAll('.cart-i .icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const action = e.currentTarget.getAttribute('data-action');
      const item = cart.find(x => x.id === id);
      
      if (!item) return;
      
      if (action === 'increase') {
        updateQty(id, item.quantity + 1);
      } else if (action === 'decrease') {
        updateQty(id, item.quantity - 1);
      } else if (action === 'remove') {
        removeFromCart(id);
      }
    });
  });
  
  const total = cart.reduce((s,i)=>s+(i.price*i.quantity),0);
  totalEl.textContent = IDR.format(total);
}

function updateQty(id,n){ 
  if(n<1){ 
    removeFromCart(id); 
    return; 
  } 
  const it=cart.find(x=>x.id===id); 
  if(it){ 
    it.quantity=n; 
    localStorage.setItem('digineer-cart',JSON.stringify(cart)); 
    updateCartUI(); 
  } 
}

function removeFromCart(id){ 
  cart=cart.filter(x=>x.id!==id); 
  localStorage.setItem('digineer-cart',JSON.stringify(cart)); 
  updateCartUI(); 
  showNotification('Produk dihapus dari keranjang','success'); 
}

function checkout(){
  if(cart.length===0){ 
    showNotification('Keranjang masih kosong!','error'); 
    return; 
  }
  
  const total=cart.reduce((s,i)=>s+(i.price*i.quantity),0);
  const lines=cart.map(i=>`• ${i.name} (${i.quantity}x) - ${IDR.format(i.price*i.quantity)}`).join('%0A');
  const msg=`Halo Digineer Store! 👋%0A%0ASaya mau pesan layanan berikut:%0A%0A${lines}%0A%0A💰 *Total: ${IDR.format(total)}*%0A%0ABisa info lebih lanjut mengenai proses order dan pembayaran?`;
  const url=`https://wa.me/${WAPP}?text=${msg}`;
  
  window.open(url,'_blank');
  showNotification('Mengarahkan ke WhatsApp... 📱','success');
  
  setTimeout(()=>{ 
    cart=[]; 
    localStorage.setItem('digineer-cart',JSON.stringify(cart)); 
    updateCartUI(); 
    toggleCart(); 
  },1800);
}

/* ====== Wishlist & Notes ====== */
function toggleWishlist(id){
  const i=wishlist.indexOf(id);
  if(i>-1){ 
    wishlist.splice(i,1); 
    showNotification('Dihapus dari wishlist','success'); 
  } else { 
    wishlist.push(id); 
    showNotification('Ditambahkan ke wishlist! ❤️','success'); 
  }
  
  localStorage.setItem('digineer-wishlist', JSON.stringify(wishlist));
  
  const wishlistBadge = document.getElementById('wishlistBadge');
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
  }
  
  displayProducts();
}

function showNotification(message, type='success'){
  const live=document.getElementById('liveRegion'); 
  if(live) live.textContent=message;
  
  const exist=document.querySelector('.note'); 
  if(exist) exist.remove();
  
  const n=document.createElement('div'); 
  n.className=`note ${type}`; 
  n.setAttribute('role','status'); 
  n.setAttribute('aria-live','polite');
  n.innerHTML=`<i class="fas fa-${type==='success'?'check':'exclamation'}-circle"></i><span>${message}</span>`;
  
  document.body.appendChild(n);
  setTimeout(()=>n.classList.add('show'),80);
  setTimeout(()=>{
    n.classList.remove('show'); 
    setTimeout(()=>n.remove(),280);
  }, 2800);
}

function scrollToProducts(){ 
  const produkSection = document.getElementById('produk');
  if (produkSection) {
    produkSection.scrollIntoView({behavior:'smooth'});
  }
}

async function loadProducts() {
  try {
    // PRIORITAS: Cek data dari admin panel dulu
    const adminProducts = localStorage.getItem('digineer-admin-products');
    if (adminProducts) {
      products = JSON.parse(adminProducts);
      return;
    }
    
    // JIKA TIDAK ADA: load dari products.json
    const r = await fetch('assets/products.json', {cache:'no-store'});
    if (!r.ok) throw new Error('no products.json');
    const data = await r.json();
    products = Array.isArray(data) ? data : FALLBACK_PRODUCTS;
  } catch (err) {
    products = FALLBACK_PRODUCTS;
  }
}

function setupEventListeners() {
  // Cart buttons
  const btnCart = document.getElementById('btnCart');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const btnCheckout = document.getElementById('btnCheckout');
  
  if (btnCart) btnCart.addEventListener('click', toggleCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', toggleCart);
  if (btnCheckout) btnCheckout.addEventListener('click', checkout);
  
  // Wishlist button
  const btnWishlist = document.getElementById('btnWishlist');
  if (btnWishlist) {
    btnWishlist.addEventListener('click', () => {
      showNotification('Fitur wishlist akan segera hadir!', 'info');
    });
  }
  
  // Hero buttons
  const btnExplore = document.getElementById('btnExplore');
  const btnConsult = document.getElementById('btnConsult');
  
  if (btnExplore) btnExplore.addEventListener('click', scrollToProducts);
  if (btnConsult) {
    btnConsult.addEventListener('click', () => {
      showNotification('Fitur konsultasi akan segera hadir!', 'info');
    });
  }
  
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      onSearch(e.target.value);
    });
  }
  
  // Drawer links
  document.querySelectorAll('.drawer a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
  
  // Overlay
  if (overlay) {
    overlay.addEventListener('click', toggleCart);
  }
}

async function init(){
  readStateFromURL();
  showSkeleton();
  await loadProducts();
  setupEventListeners();
  setupFilterListeners();
  displayProducts();
  updateCartUI();
  
  const wishlistBadge = document.getElementById('wishlistBadge');
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
  }
  
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  setTimeout(() => showNotification('Selamat datang di Digineer Store! 🚀','success'), 800);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
