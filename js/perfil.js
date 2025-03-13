document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupProfileEditing();
    updateStatistics();
});

function loadProfileData() {
    const teacherData = JSON.parse(localStorage.getItem('teacherData')) || {};
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser);

    if (user) {
        document.getElementById('teacherName').textContent = user.fullName || 'No especificado';
        document.getElementById('teacherDNI').textContent = user.dni || 'No especificado';
        document.getElementById('specialty').textContent = user.specialty || 'No especificado';
        document.getElementById('academicDegree').textContent = user.academicDegree;
    }
}

function setupProfileEditing() {
    // Agregar botones de edición
    const infoGroups = document.querySelectorAll('.info-group');
    
    infoGroups.forEach(group => {
        const label = group.querySelector('label').textContent;
        const p = group.querySelector('p');
        const id = p.id;

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.className = 'edit-btn';
        editButton.onclick = () => makeEditable(id);
        
        group.appendChild(editButton);
    });
}

function makeEditable(id) {
    const element = document.getElementById(id);
    const currentValue = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue === 'No especificado' ? '' : currentValue;
    
    input.onblur = () => saveProfileChanges(id, input.value);
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    };

    element.parentNode.replaceChild(input, element);
    input.focus();
}

function saveProfileChanges(field, value) {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser);

    if (user) {
        switch(field) {
            case 'teacherName':
                user.fullName = value;
                break;
            case 'teacherDNI':
                user.dni = value;
                break;
            case 'specialty':
                user.specialty = value;
                break;
        }

        // Actualizar localStorage
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('teacherData', JSON.stringify({
            fullName: user.fullName,
            dni: user.dni,
            specialty: user.specialty,
            academicDegree: user.academicDegree
        }));

        // Recargar los datos
        loadProfileData();
    }
}

function updateStatistics() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    // Actualizar número total de estudiantes
    document.getElementById('totalStudents').textContent = students.length;
    
    // Actualizar número de cursos
    document.getElementById('totalCourses').textContent = courses.length;
    
    // Calcular promedio general
    let totalGrades = 0;
    let totalStudentsWithGrades = 0;

    students.forEach(student => {
        if (student.notas) {
            Object.values(student.notas).forEach(nota => {
                if (nota && !isNaN(nota)) {
                    totalGrades += parseFloat(nota);
                    totalStudentsWithGrades++;
                }
            });
        }
    });

    const averageScore = totalStudentsWithGrades > 0 
        ? (totalGrades / totalStudentsWithGrades).toFixed(1) 
        : '0.0';
    
    document.getElementById('averageScore').textContent = averageScore;
}

// Animación para los números en las estadísticas
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Función para actualizar estadísticas en tiempo real
function setupRealtimeUpdates() {
    // Escuchar cambios en cursos
    window.addEventListener('coursesUpdated', function() {
        updateStatistics();
    });

    // Escuchar cambios en estudiantes
    window.addEventListener('studentsUpdated', function() {
        updateStatistics();
    });
}

// Iniciar escucha de actualizaciones en tiempo real
setupRealtimeUpdates();