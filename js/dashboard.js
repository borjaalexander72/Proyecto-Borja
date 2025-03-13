document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es primera vez
    const isFirstLogin = localStorage.getItem('isFirstLogin');
    
    if (isFirstLogin === 'true') {
        document.getElementById('profileModal').style.display = 'block';
    }

    // Manejar el formulario del perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const teacherData = {
            fullName: document.getElementById('fullName').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            specialty: document.getElementById('specialty').value,
            academicDegree: 'Docente'
        };

        // Guardar datos
        localStorage.setItem('teacherData', JSON.stringify(teacherData));
        localStorage.removeItem('isFirstLogin');
        
        // Cerrar modal
        document.getElementById('profileModal').style.display = 'none';
    });

    // Validación del DNI
    document.getElementById('dni').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
    });

    document.querySelector('a[href="#configuracion"]').addEventListener('click', function(e) {
        e.preventDefault();
        alert('El acceso a la configuración está restringido solo para administradores.');
    });
});