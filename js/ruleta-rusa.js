document.addEventListener('DOMContentLoaded', function() {
    const ruletaInput = document.getElementById('ruleta-input');
    const addBtn = document.getElementById('add-btn');
    const ruletaList = document.getElementById('ruleta-list');
    const spinBtn = document.getElementById('spin-btn');
    const ruletaResult = document.getElementById('ruleta-result');
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const gradeSelect = document.getElementById('gradeSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const loadStudentsBtn = document.getElementById('load-students');
    
    let participants = [];
    let isSpinning = false;
    let currentRotation = 0;

    // Configurar el canvas
    function setupCanvas() {
        canvas.width = 500;
        canvas.height = 500;
    }

    // Dibujar la ruleta
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (participants.length === 0) {
            // Dibujar círculo vacío
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 10, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#f8f9fa';
            ctx.fill();
            return;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        const angleStep = (2 * Math.PI) / participants.length;

        // Calcular el tamaño de fuente basado en el número de participantes
        const fontSize = Math.min(20, Math.max(12, 30 - participants.length));
        
        participants.forEach((participant, index) => {
            const startAngle = index * angleStep;
            const endAngle = (index + 1) * angleStep;
            
            // Dibujar sector
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            // Color aleatorio pero consistente para cada participante
            const hue = (index * 137.508) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Texto ajustado
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + angleStep / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${fontSize}px Arial`;
            
            // Acortar texto si es muy largo
            let displayText = participant;
            if (participant.length > 20) {
                displayText = participant.substring(0, 17) + '...';
            }
            
            ctx.fillText(displayText, radius - 20, 6);
            ctx.restore();
        });

        // Actualizar clase de la lista basada en el número de participantes
        const ruletaList = document.getElementById('ruleta-list');
        ruletaList.classList.toggle('many-items', participants.length > 10);
    }

    // Agregar participante
    addBtn.addEventListener('click', function() {
        const name = ruletaInput.value.trim();
        if (name && !participants.includes(name)) {
            addParticipant(name);
            ruletaInput.value = '';
        }
    });

    // Función para agregar participante
    function addParticipant(name) {
        participants.push(name);
        
        const li = document.createElement('li');
        li.innerHTML = `
            ${name}
            <button class="delete-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Agregar evento de eliminar
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            participants = participants.filter(p => p !== name);
            ruletaList.removeChild(li);
            drawWheel();
        });
        
        ruletaList.appendChild(li);
        ruletaInput.value = '';
        drawWheel();
    }

    // Preview en tiempo real
    ruletaInput.addEventListener('input', function() {
        const previewValue = this.value.trim();
        // Crear una copia temporal de los participantes para el preview
        const previewParticipants = [...participants];
        if (previewValue) {
            previewParticipants.push(previewValue);
        }
        
        // Dibujar preview
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const tempParticipants = participants;
        participants = previewParticipants;
        drawWheel();
        participants = tempParticipants;
    });

    // Girar la ruleta
    spinBtn.addEventListener('click', function() {
        if (isSpinning || participants.length === 0) return;
        
        isSpinning = true;
        spinBtn.disabled = true;
        
        // Número aleatorio de vueltas (entre 5 y 10)
        const spins = 5 + Math.random() * 5;
        const targetRotation = currentRotation + (spins * 360);
        
        // Índice ganador aleatorio
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const finalAngle = 360 - (360 / participants.length * winnerIndex);
        
        const wheel = document.getElementById('ruleta-wheel');
        wheel.style.transform = `rotate(${targetRotation + finalAngle}deg)`;
        
        setTimeout(() => {
            isSpinning = false;
            spinBtn.disabled = false;
            currentRotation = (targetRotation + finalAngle) % 360;
            
            // Mostrar ganador con animación
            ruletaResult.innerHTML = `
                <div class="winner-animation">
                    ¡El ganador es: <span style="color: #ff4757">${participants[winnerIndex]}</span>!
                </div>
            `;
        }, 5000);
    });

    // Función para cargar grados y secciones
    function populateGradeAndSection() {
        const estudiantes = JSON.parse(localStorage.getItem('students')) || [];
        
        if (estudiantes.length === 0) {
            console.log('No hay estudiantes registrados');
            return;
        }

        // Obtener grados y secciones únicos
        const grades = [...new Set(estudiantes.map(e => e.grado))].filter(Boolean).sort();
        const sections = [...new Set(estudiantes.map(e => e.seccion))].filter(Boolean).sort();

        // Limpiar y llenar selector de grados
        gradeSelect.innerHTML = '<option value="">Seleccione grado</option>';
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            gradeSelect.appendChild(option);
        });

        // Limpiar y llenar selector de secciones
        sectionSelect.innerHTML = '<option value="">Seleccione sección</option>';
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }

    // Evento para cargar estudiantes del grupo
    loadStudentsBtn.addEventListener('click', function() {
        const selectedGrade = gradeSelect.value;
        const selectedSection = sectionSelect.value;

        if (!selectedGrade || !selectedSection) {
            alert('Por favor seleccione grado y sección');
            return;
        }

        const estudiantes = JSON.parse(localStorage.getItem('students')) || [];
        const groupStudents = estudiantes.filter(student => 
            student.grado === selectedGrade && 
            student.seccion === selectedSection
        );

        if (groupStudents.length === 0) {
            alert('No hay estudiantes registrados en este grupo');
            return;
        }

        // Limpiar lista actual
        participants = [];
        ruletaList.innerHTML = '';

        // Agregar estudiantes a la ruleta
        groupStudents.forEach(student => {
            const fullName = `${student.apellido}, ${student.nombre}`;
            if (!participants.includes(fullName)) {
                addParticipant(fullName);
            }
        });

        // Actualizar la ruleta
        drawWheel();
    });

    // Inicializar selectores
    populateGradeAndSection();

    // Inicialización
    setupCanvas();
    drawWheel();
});