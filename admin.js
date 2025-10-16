// ADMIN PASSWORD
const ADMIN_PASSWORD = "admin123";

// Data produk (sama dengan di index.html)
let products = JSON.parse(localStorage.getItem('digineer-products')) || [
    {
        id: 1,
        name: "Jasa Desain Logo Profesional",
        price: 150000,
        category: "Jasa",
        image: "https://picsum.photos/seed/logo/400/300",
        description: "Desain logo custom untuk brand Anda",
        stock: 5
    },
    {
        id: 2,
        name: "Template Landing Page Premium",
        price: 99000,
        category: "Produk",
        image: "https://picsum.photos/seed/template/400/300",
        description: "Template website siap pakai",
        stock: 20
    },
    {
        id: 3,
        name: "Editing Video Kreatif",
        price: 250000,
        category: "Kreatif",
        image: "https://picsum.photos/seed/video/400/300",
        description: "Editing video profesional untuk konten",
        stock: 3
    }
];

// Data pesanan
let orders = JSON.parse(localStorage.getItem('digineer-orders')) || [];

// === FUNGSI LOGIN ===
function login() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminData();
    } else {
        alert('Password salah!');
    }
}

function logout() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
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
    }
}

// === FUNGSI DASHBOARD ===
function loadAdminData() {
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = 'Rp ' + totalRevenue.toLocaleString();
}

// === FUNGSI KELOLA PRODUK ===
function loadProductsList() {
    const container = document.getElementById('adminProductsList');
    container.innerHTML = '';

    products.forEach(product => {
        const productElement = `
            <div class="admin-product">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Rp ${product.price.toLocaleString()} • ${product.category} • Stok: ${product.stock}</p>
                    <p>${product.description}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-success" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct(${product.id})">Hapus</button>
                </div>
            </div>
        `;
        container.innerHTML += productElement;
    });
}

function deleteProduct(productId) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        products = products.filter(product => product.id !== productId);
        saveProducts();
        loadProductsList();
        loadAdminData();
        alert('Produk berhasil dihapus!');
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    // Isi form dengan data produk
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    
    // Ganti form menjadi edit mode
    const form = document.querySelector('#addProductSection form');
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
    
    // Tampilkan section tambah produk
    showSection('addProduct');
}

function updateProduct(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    
    products[productIndex] = {
        ...products[productIndex],
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    saveProducts();
    loadProductsList();
    resetProductForm();
    alert('Produk berhasil diupdate!');
    showSection('products');
}

// === FUNGSI TAMBAH PRODUK ===
function addNewProduct(event) {
    event.preventDefault();
    
    const newProduct = {
        id: Date.now(), // ID unik berdasarkan timestamp
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    products.push(newProduct);
    saveProducts();
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
    const submitBtn = form.querySelector('button');
    submitBtn.textContent = 'Tambah Produk';
}

// === FUNGSI PESANAN ===
function loadOrdersList() {
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
                    <p><strong>Nama:</strong> ${order.customerName}</p>
                    <p><strong>WhatsApp:</strong> ${order.customerWhatsApp}</p>
                    <p><strong>Produk:</strong> ${order.productName}</p>
                    <p><strong>Total:</strong> Rp ${order.total.toLocaleString()}</p>
                    <p><strong>Tanggal:</strong> ${new Date(order.date).toLocaleString()}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-success" onclick="completeOrder(${index})">Selesai</button>
                </div>
            </div>
        `;
        container.innerHTML += orderElement;
    });
}

function completeOrder(orderIndex) {
    if (confirm('Tandai pesanan ini sebagai selesai?')) {
        orders.splice(orderIndex, 1);
        localStorage.setItem('digineer-orders', JSON.stringify(orders));
        loadOrdersList();
        loadAdminData();
    }
}

// === FUNGSI UTILITY ===
function saveProducts() {
    localStorage.setItem('digineer-products', JSON.stringify(products));
}

// Auto-save products setiap ada perubahan
setInterval(saveProducts, 5000);

// Load data saat halaman admin dibuka
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminData();
    }
});
