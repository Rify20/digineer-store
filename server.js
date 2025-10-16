const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000; // GANTI KE 3000

// ====== File Storage ======
const DATA_DIR = path.join(__dirname, 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const readJSON = (p, fb) => {
  try {
    if (!fs.existsSync(p)) return fb;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || 'null') ?? fb;
  } catch { return fb; }
};

const writeJSON = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

// ====== Bootstrap Data ======
let users = readJSON(USERS_PATH, []);
let products = readJSON(PRODUCTS_PATH, []);

if (!users.find(u => u.username === 'admin')) {
  const hash = bcrypt.hashSync('admin123', 10);
  users.push({ username: 'admin', passwordHash: hash, isAdmin: true });
  writeJSON(USERS_PATH, users);
  console.log('🔐 Admin default: admin / admin123');
}

if (!products.length) {
  products = [
    { id: 'p1', name: 'Jasa Desain Logo', price: 150000, category: 'Jasa', stock: 5, image_url: 'https://picsum.photos/seed/logo/400/300' },
    { id: 'p2', name: 'Template Landing Page', price: 99000, category: 'Produk', stock: 20, image_url: 'https://picsum.photos/seed/template/400/300' },
    { id: 'p3', name: 'Editing Video Kreatif', price: 250000, category: 'Kreatif', stock: 3, image_url: 'https://picsum.photos/seed/video/400/300' },
    { id: 'p4', name: 'Paket Sosmed 1 Bulan', price: 500000, category: 'Jasa', stock: 7, image_url: 'https://picsum.photos/seed/sosmed/400/300' },
    { id: 'p5', name: 'Mockup Produk 3D', price: 199000, category: 'Kreatif', stock: 0, image_url: 'https://picsum.photos/seed/mockup/400/300' }
  ];
  writeJSON(PRODUCTS_PATH, products);
  console.log('📦 Seed products dibuat');
}

// ====== Middleware ======
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== Simple Session Storage ======
const activeSessions = {};

// ====== Auth Middleware ======
const authenticateAdmin = (req, res, next) => {
  const username = req.body.username || req.query.username;
  
  console.log('🔍 Auth check for:', username);
  console.log('📋 Active sessions:', Object.keys(activeSessions));
  
  if (!username || !activeSessions[username] || !activeSessions[username].isAdmin) {
    return res.status(403).json({ 
      error: 'Akses admin diperlukan. Silakan login sebagai admin terlebih dahulu.',
      receivedUsername: username,
      activeUsers: Object.keys(activeSessions)
    });
  }
  next();
};

// ====== API Routes ======

// GET Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username & password wajib' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'Username sudah terdaftar' });
  
  const passwordHash = bcrypt.hashSync(password, 10);
  users.push({ username, passwordHash, isAdmin: false });
  writeJSON(USERS_PATH, users);
  res.json({ message: 'Registrasi berhasil' });
});

// POST Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });
  if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'Password salah' });
  
  // Simpan session
  activeSessions[username] = {
    username: user.username,
    isAdmin: !!user.isAdmin,
    loginTime: new Date().toISOString()
  };
  
  console.log('✅ Login success:', username, 'isAdmin:', user.isAdmin);
  
  res.json({ 
    username: user.username, 
    isAdmin: !!user.isAdmin,
    message: 'Login berhasil' 
  });
});

// GET Check Auth (untuk debug)
app.get('/api/check-auth', (req, res) => {
  res.json({ 
    activeSessions,
    totalUsers: users.length,
    totalProducts: products.length
  });
});

// ====== ADMIN ROUTES ======

// POST Add Product (Admin) - FIXED: Include username in request
app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const { name, price, category, stock, image_url, description, username } = req.body;
  
  console.log('🛒 Adding product by:', username);
  
  if (!name || !price || !category || stock === undefined) {
    return res.status(400).json({ error: 'Data produk tidak lengkap' });
  }
  
  const newProduct = {
    id: 'p' + (Date.now()), // ID unik
    name,
    price: parseInt(price),
    category,
    stock: parseInt(stock),
    image_url: image_url || 'https://picsum.photos/seed/product/400/300',
    description: description || ''
  };
  
  products.push(newProduct);
  writeJSON(PRODUCTS_PATH, products);
  
  console.log('✅ Product added:', newProduct.name);
  res.json({ message: 'Produk berhasil ditambahkan', product: newProduct });
});

// PUT Update Product (Admin)
app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, category, stock, image_url, description, username } = req.body;
  
  console.log('✏️ Updating product by:', username);
  
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price ? parseInt(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
    image_url: image_url || products[productIndex].image_url,
    description: description !== undefined ? description : products[productIndex].description
  };
  
  writeJSON(PRODUCTS_PATH, products);
  res.json({ message: 'Produk berhasil diupdate', product: products[productIndex] });
});

// DELETE Product (Admin)
app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  
  console.log('🗑️ Deleting product by:', username);
  
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  writeJSON(PRODUCTS_PATH, products);
  res.json({ message: 'Produk berhasil dihapus', product: deletedProduct });
});

// Fallback untuk SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${4000}`);
  console.log(`📁 Data disimpan di folder: ${DATA_DIR}`);
  console.log(`🔐 Admin login: admin / admin123`);
  console.log(`🐛 Debug: http://localhost:${4000}/api/check-auth`);
});