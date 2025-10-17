<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Admin - Digineer Store</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <style>
    :root {
      --primary: #10bfa4;
      --primary-dark: #0ea894;
      --secondary: #0b1220;
      --surface: #ffffff;
      --bg: #f7faf9;
      --border: #e5e9ec;
      --error: #ef4444;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--secondary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .login-container {
      background: var(--surface);
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      margin: 1rem;
    }
    
    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .brand h1 {
      color: var(--primary);
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--secondary);
      margin-top: 0.5rem;
    }
    
    .btn-secondary:hover {
      background: var(--bg);
    }
    
    .notification {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: none;
    }
    
    .notification.error {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
      display: block;
    }
    
    .credential-hint {
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      font-size: 0.875rem;
    }
    
    .credential-hint h4 {
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    
    .credential-hint code {
      background: var(--bg);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="brand">
      <h1>
        <i class="fas fa-store"></i>
        Digineer Admin
      </h1>
      <p style="color: #64748b; margin-top: 0.5rem;">Login ke Panel Admin</p>
    </div>

    <div class="notification error" id="errorMessage">
      <i class="fas fa-exclamation-circle"></i>
      <span id="errorText">Email atau password salah</span>
    </div>

    <form id="loginForm">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" class="form-control" placeholder="admin@digineer.id" required>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" class="form-control" placeholder="Masukkan password" required>
      </div>
      
      <button type="submit" class="btn btn-primary">
        <i class="fas fa-sign-in-alt"></i>
        Login
      </button>
    </form>

    <button type="button" class="btn btn-secondary" onclick="location.href='index.html'">
      <i class="fas fa-arrow-left"></i>
      Kembali ke Toko
    </button>

    <div class="credential-hint">
      <h4><i class="fas fa-key"></i> Kredensial Default</h4>
      <p><strong>Email:</strong> <code>admin@digineer.id</code></p>
      <p><strong>Password:</strong> <code>digineer123</code></p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #64748b;">
        <i class="fas fa-info-circle"></i> Ganti kredensial di file auth.js untuk keamanan
      </p>
    </div>
  </div>

  <script src="js/auth.js"></script>
  <script>
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      
      // Clear previous errors
      errorDiv.style.display = 'none';
      
      // Basic validation
      if (!email || !password) {
        errorText.textContent = 'Harap isi email dan password';
        errorDiv.style.display = 'block';
        return;
      }
      
      // Attempt login
      if (Auth.login(email, password)) {
        // Get return URL from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return') || 'admin.html';
        
        // Redirect to admin page or return URL
        window.location.href = returnUrl;
      } else {
        errorText.textContent = 'Email atau password salah';
        errorDiv.style.display = 'block';
        
        // Shake animation for error
        this.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          this.style.animation = '';
        }, 500);
      }
    });

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    // Auto-focus on email field
    document.getElementById('email').focus();
  </script>
</body>
</html>
