document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simulación de validación (reemplazar con tu sistema de autenticación real)
    if (username === "admin" && password === "admin123") {
        // Generar token y establecer expiración (2 horas)
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiry = Date.now() + (2 * 60 * 60 * 1000);
        
        // Guardar datos de sesión
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('tokenExpiry', expiry.toString());
        sessionStorage.setItem('isAuthenticated', 'true');
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
});

// Verificar si ya hay una sesión activa
window.addEventListener('load', function() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const expiry = sessionStorage.getItem('tokenExpiry');
    
    if (isAuthenticated === 'true' && expiry && Date.now() < parseInt(expiry)) {
        window.location.href = 'dashboard.html';
    }
});