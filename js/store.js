<script>
// ===== STORE: data produk bersama untuk index & admin =====
(function () {
  const KEY = 'digineer-products';
  const DEFAULTS = [
    { id:'p1', name:'Paket Branding Professional', category:'design', price:2500000,
      image:'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80',
      description:'Logo, brand guide, stationery design, dan social media kit lengkap' },
    { id:'p2', name:'Website Company Profile', category:'development', price:3500000,
      image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description:'Website perusahaan modern dengan CMS custom dan responsive design' },
    { id:'p3', name:'Video Company Profile', category:'video', price:5000000,
      image:'https://images.unsplash.com/photo-1554260570-9140fd3b7614?auto=format&fit=crop&w=800&q=80',
      description:'Video profil perusahaan profesional dengan animasi dan editing' },
    { id:'p4', name:'UI/UX Design', category:'design', price:1500000,
      image:'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
      description:'Desain user interface dan experience untuk aplikasi dan website' },
    { id:'p5', name:'E-Commerce Website', category:'development', price:7500000,
      image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
      description:'Website toko online lengkap dengan payment gateway dan admin panel' },
    { id:'p6', name:'Social Media Content', category:'design', price:800000,
      image:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      description:'Paket konten media sosial 1 bulan dengan design yang konsisten' }
  ];

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw){ localStorage.setItem(KEY, JSON.stringify(DEFAULTS)); return [...DEFAULTS]; }
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr)) throw 0;
      return arr;
    }catch{
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
      return [...DEFAULTS];
    }
  }
  function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
  function upsert(prod){
    const list = load();
    const i = list.findIndex(x=>x.id===prod.id);
    if(i>-1) list[i]=prod; else list.push(prod);
    save(list); broadcast();
  }
  function remove(id){ save(load().filter(x=>x.id!==id)); broadcast(); }
  function get(id){ return load().find(x=>x.id===id); }
  function newid(){ return 'p'+Math.random().toString(36).slice(2,8); }
  function broadcast(){ localStorage.setItem(KEY+'__ts', Date.now().toString()); }

  window.ProductsStore = { load, save, upsert, remove, get, newid, KEY };
})();
</script>
