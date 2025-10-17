/* ====== Sumber data: assets/products.json (fallback ke array di bawah) ====== */
let products = []; // diisi lewat loadProducts()
const FALLBACK_PRODUCTS = [
  { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000, image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
  { id:'p2', name:'Website Company Profile', category:'development', price:3500000, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', description:'Website perusahaan modern dengan CMS custom dan responsive design' },
  { id:'p3', name:'Video Company Profile', category:'video', price:5000000, image:'https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=800&q=80', description:'Video profil perusahaan profesional dengan animasi dan editing' },
  { id:'p4', name:'UI/UX Design', category:'design', price:1500000, image:'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80', description:'Desain UI/UX untuk aplikasi & website' },
  { id:'p5', name:'E-Commerce Website', category:'development', price:7500000, image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', description:'Toko online + payment gateway + admin panel' },
  { id:'p6', name:'Social Media Content', category:'design', price:800000, image:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80', description:'Konten media sosial 1 bulan (desain konsisten)' }
];

/* ====== State & Utils ====== */
let cart = JSON.parse(localStorage.getItem('digineer-cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('digineer-wishlist')) || [];
let currentFilter = 'all';
let currentSearch = '';
const IDR = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
const WHATSAPP_NUMBER = '089507083879';
const toWaIntl = n => { let s=(n||'').replace(/\D/g,''); if(s.startsWith('0')) s='62'+s.slice(1); if(s.startsWith('620')) s='62'+s.slice(2); return s; };
const WAPP = toWaIntl(WHATSAPP_NUMBER);
const debounce = (fn, d=300)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),d); } };
const escapeHTML = s => (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const getCategoryName = c => ({design:'Desain',development:'Development',video:'Video Production'})[c]||c;

function syncStateToURL(){ const url=new URL(window.location); url.searchParams.set('filter', currentFilter); url.searchParams.set('q', currentSearch||''); history.replaceState({},'',url); }
function readStateFromURL(){
  const url=new URL(window.location);
  currentFilter=url.searchParams.get('filter')||'all';
  currentSearch=url.searchParams.get('q')||'';
  const input=document.getElementById('searchInput'); if(input) input.value=currentSearch;
  document.querySelectorAll('.chip').forEach(c=>{c.classList.remove('active');c.setAttribute('aria-selected','false')});
  const idx = {all:0,design:1,development:2,video:3}[currentFilter] ?? 0;
  const chip = document.querySelectorAll('.chip')[idx]; if(chip){chip.classList.add('active');chip.setAttribute('aria-selected','true')}
}

/* ====== Drawer ====== */
const btnMenu = document.getElementById('btnMenu');
const drawer = document.getElementById('drawer');
function closeDrawer(){ drawer.classList.remove('open'); btnMenu.setAttribute('aria-expanded','false'); }
btnMenu?.addEventListener('click', ()=>{ const open = drawer.classList.toggle('open'); btnMenu.setAttribute('aria-expanded', String(open)); });

/* ====== Skeleton ====== */
function showSkeleton(n=6){
  const grid=document.getElementById('productsContainer');
  grid.setAttribute('aria-busy','true');
  grid.innerHTML = Array.from({length:n}).map(()=>`
    <div class="col"><div class="sk-card"><div class="sk sk-img"></div>
      <div class="sk-body"><div class="sk sk-line" style="width:40%"></div>
      <div class="sk sk-line" style="width:80%"></div><div class="sk sk-line" style="width:60%"></div></div>
    </div></div>`).join('');
}

/* ====== Products render ====== */
function renderProducts(){
  const grid=document.getElementById('productsContainer');
  let list=[...products];
  if(currentFilter!=='all'){ list=list.filter(p=>p.category===currentFilter); }
  if(currentSearch){ const q=currentSearch.toLowerCase(); list=list.filter(p=>p.name.toLowerCase().includes(q)||p.description.toLowerCase().includes(q)); }

  if(list.length===0){
    grid.innerHTML = `<div class="col" style="grid-column:1/-1;text-align:center;color:#62707f">
      <p>Tidak ada layanan yang cocok.</p>
      <button class="btn btn-primary" style="margin-top:.75rem" onclick="resetSearch()">Reset Pencarian</button>
    </div>`;
    grid.removeAttribute('aria-busy'); return;
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
    </div>`).join('');

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
function displayProducts(){ renderProducts(); syncStateToURL(); }

/* ====== Filter & Search ====== */
function filterProducts(cat, el){
  currentFilter=cat;
  document.querySelectorAll('.chip').forEach(c=>{c.classList.remove('active');c.setAttribute('aria-selected','false')});
  if(el){ el.classList.add('active'); el.setAttribute('aria-selected','true'); }
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

const onSearch = debounce((q)=>{ currentSearch=(q||'').trim(); displayProducts(); },300);
function resetSearch(){ currentSearch=''; const i=document.getElementById('searchInput'); if(i) i.value=''; displayProducts(); }

/* ====== Cart ====== */
const overlay = document.getElementById('overlay');
const cartEl = document.getElementById('cart');
let lastFocused=null;

function toggleCart(){
  const willOpen = !cartEl.classList.contains('active');
  cartEl.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = willOpen ? 'hidden' : '';
  if(willOpen){
    lastFocused=document.activeElement;
    const f=cartEl.querySelector('button,[href],input'); if(f) f.focus();
    document.addEventListener('keydown',cartKeys);
  }else{
    document.removeEventListener('keydown',cartKeys);
    if(lastFocused) lastFocused.focus();
  }
}
function cartKeys(e){ if(e.key==='Escape') toggleCart(); }

function addToCart(id){
  const p=products.find(x=>x.id===id);
  const ex=cart.find(x=>x.id===id);
  if(ex){ ex.quantity+=1; } else { cart.push({...p,quantity:1}); }
  localStorage.setItem('digineer-cart', JSON.stringify(cart));
  updateCartUI();
  showNotification(`"${p.name}" ditambahkan ke keranjang! 🛒`, 'success
