// ADMIN PASSWORD
const ADMIN_PASSWORD = "admin123";

// Load products dari localStorage
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('digineer-products');
    if (savedProducts) {
        return JSON.parse(savedProducts);
    } else {
        // Default products jika tidak ada data
        return [
            {
                id: 'p1',
                name: "Jasa Desain Logo Profesional",
                price: 150000,
                category: "Jasa",
                image: "https://picsum.photos/seed/logo/400/300",
                description: "Desain logo custom untuk brand Anda dengan konsep unik dan profesional",
                stock: 5
            },
            {
                id: 'p2', 
                name: "Template Landing Page Premium",
                price: 99000,
                category: "Produk",
                image: "https://picsum.photos/seed/template/400/300",
                description: "Template website responsive siap pakai dengan design modern",
                stock: 20
            }
        ];
    }
}

let products = loadProductsFromStorage();
let orders = JSON.parse(localStorage.getItem('digineer-orders')) || [];

// === FUNGSI LOGIN ===
function login() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        localStorage.setItem('adminLoggedIn', 'true');
        loadAdminData();
        loadProductsList();
    } else {
        alert('Password salah! Coba: ' + ADMIN_PASSWORD);
    }
}

function logout() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    localStorage.removeItem('adminLoggedIn');
}

// === FUNGSI NAVIGASI ===
function showSection(sectionName) {
    // Sembunyikan semua section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Tampilkan section yang dipilih
    document.getElementById(sectionName + 'Section').classList.add('active');
    
    // Update active button
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh data jika perlu
    if (sectionName === 'products') {
        loadProductsList();
    } else if (sectionName === 'orders') {
        loadOrdersList();
    } else if (sectionName === 'dashboard') {
        loadAdminData();
    }
}

// === FUNGSI DASHBOARD ===
function loadAdminData() {
    // Refresh data dari localStorage
    products = loadProductsFromStorage();
    orders = JSON.parse(localStorage.getItem('digineer-orders')) || [];
    
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = 'Rp ' + totalRevenue.toLocaleString();
}

// === FUNGSI KELOLA PRODUK ===
function loadProductsList() {
    // Refresh data terbaru
    products = loadProductsFromStorage();
    
    const container = document.getElementById('adminProductsList');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p>Belum ada produk. Tambah produk baru di section "Tambah Produk".</p>';
        return;
    }

    products.forEach(product => {
        const stockStatus = product.stock === 0 ? 'Stok Habis' : 
                           product.stock <= 3 ? 'Stok Sedikit' : 'Stok Tersedia';
        
        const stockClass = product.stock === 0 ? 'no-stock' : 
                          product.stock <= 3 ? 'low-stock' : 'in-stock';

        const productElement = `
            <div class="admin-product">
                <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>Harga:</strong> Rp ${product.price.toLocaleString()} | 
                       <strong>Kategori:</strong> ${product.category} | 
                       <strong>Stok:</strong> <span class="stock-badge ${stockClass}">${stockStatus} (${product.stock})</span>
                    </p>
                    <p><strong>Deskripsi:</strong> ${product.description}</p>
                    <p><strong>ID:</strong> ${product.id}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-success" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct('${product.id}')">Hapus</button>
                </div>
            </div>
        `;
        container.innerHTML += productElement;
    });
}

function deleteProduct(productId) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        products = products.filter(product => product.id !== productId);
        saveProductsToStorage();
        loadProductsList();
        loadAdminData();
        alert('Produk berhasil dihapus!');
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Produk tidak ditemukan!');
        return;
    }
    
    // Isi form dengan data produk
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    
    // Ganti form menjadi edit mode
    const form = document.querySelector('#addProductSection form');
    const originalOnsubmit = form.onsubmit;
    
    form.onsubmit = function(event) {
        event.preventDefault();
        updateProduct(productId);
    };
    
    // Ganti tombol
    const submitBtn = form.querySelector('button');
    submitBtn.textContent = 'Update Produk';
    submitBtn.onclick = function(event) {
        event.preventDefault();
        updateProduct(productId);
    };
    
    // Tambah tombol cancel edit
    if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.textContent = 'Batal Edit';
        cancelBtn.className = 'btn-danger';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.onclick = function() {
            resetProductForm();
            showSection('products');
        };
        form.appendChild(cancelBtn);
    }
    
    // Tampilkan section tambah produk
    showSection('addProduct');
}

function updateProduct(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        alert('Produk tidak ditemukan!');
        return;
    }
    
    products[productIndex] = {
        ...products[productIndex],
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    saveProductsToStorage();
    loadProductsList();
    resetProductForm();
    alert('Produk berhasil diupdate!');
    showSection('products');
}

// === FUNGSI TAMBAH PRODUK ===
function addNewProduct(event) {
    event.preventDefault();
    
    const newProduct = {
        id: 'p' + Date.now(), // ID unik
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    products.push(newProduct);
    saveProductsToStorage();
    loadProductsList();
    loadAdminData();
    resetProductForm();
    alert('Produk berhasil ditambahkan!');
    showSection('products');
}

function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productStock').value = '1';
    document.getElementById('productImage').value = '';
    document.getElementById('productDescription').value = '';
    
    // Reset form handler
    const form = document.querySelector('#addProductSection form');
    form.onsubmit = addNewProduct;
    
    // Reset tombol
    const submitBtn = form.querySelector('button');
    submitBtn.textContent = 'Tambah Produk';
    submitBtn.onclick = function(event) {
        event.preventDefault();
        addNewProduct(event);
    };
    
    // Hapus tombol cancel edit jika ada
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

// === FUNGSI PESANAN ===
function loadOrdersList() {
    orders = JSON.parse(localStorage.getItem('digineer-orders')) || [];
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>Belum ada pesanan.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    orders.forEach((order, index) => {
        const orderElement = `
            <div class="admin-product">
                <div class="product-info">
                    <h3>Pesanan #${index + 1}</h3>
                    <p><strong>Nama:</strong> ${order.customerName || 'Pelanggan'}</p>
                    <p><strong>WhatsApp:</strong> ${order.customerWhatsApp || '6281234567890'}</p>
                    <p><strong>Produk:</strong> ${order.productName}</p>
                    <p><strong>Total:</strong> Rp ${order.total.toLocaleString()}</p>
                    <p><strong>Tanggal:</strong> ${new Date(order.date).toLocaleString('id-ID')}</p>
                    <p><strong>Status:</strong> ${order.status || 'pending'}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-success" onclick="completeOrder(${index})">Tandai Selesai</button>
                    <button class="btn-danger" onclick="deleteOrder(${index})">Hapus</button>
                </div>
            </div>
        `;
        container.innerHTML += orderElement;
    });
}

function completeOrder(orderIndex) {
    if (confirm('Tandai pesanan ini sebagai selesai?')) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('digineer-orders', JSON.stringify(orders));
        loadOrdersList();
        loadAdminData();
        alert('Pesanan ditandai sebagai selesai!');
    }
}

function deleteOrder(orderIndex) {
    if (confirm('Hapus pesanan ini?')) {
        orders.splice(orderIndex, 1);
        localStorage.setItem('digineer-orders', JSON.stringify(orders));
        loadOrdersList();
        loadAdminData();
        alert('Pesanan dihapus!');
    }
}

// === FUNGSI UTILITY ===
function saveProductsToStorage() {
    localStorage.setItem('digineer-products', JSON.stringify(products));
}

// Auto-check login status
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminData();
        loadProductsList();
    }
    
    // Load data awal
    products = loadProductsFromStorage();
    orders = JSON.parse(localStorage.getItem('digineer-orders')) || [];
});
