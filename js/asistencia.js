document.addEventListener('DOMContentLoaded', function() {
    populateGradeAndSection(); // Llenar grados y secciones al cargar
    document.getElementById('gradeSelect').addEventListener('change', loadStudents);
    document.getElementById('sectionSelect').addEventListener('change', loadStudents);
    document.getElementById('saveAttendance').addEventListener('click', saveAttendance);
    document.getElementById('viewRegisteredAttendances').addEventListener('click', showAttendanceModal);
    document.getElementById('viewAttendanceSummary').addEventListener('click', showAttendanceSummary);
    document.getElementById('exportAttendanceExcel').addEventListener('click', exportAttendanceToExcel);
    document.getElementById('selectAll').addEventListener('click', selectAllStudents);
    document.getElementById('unselectAll').addEventListener('click', unselectAllStudents);
    document.getElementById('closeSummaryModal').addEventListener('click', closeSummaryModal);
    loadStudents(); // Cargar estudiantes al inicio

    // Remover el evento duplicado del closeSummaryModal
    document.getElementById('closeSummaryModal').removeEventListener('click', closeSummaryModal);

    // Configurar los eventos del modal
    setupModalEvents();
});

function populateGradeAndSection() {
    const estudiantes = JSON.parse(localStorage.getItem('students')) || [];
    
    if (!estudiantes || estudiantes.length === 0) {
        console.log('No hay estudiantes en localStorage');
        return;
    }

    const gradeSelect = document.getElementById('gradeSelect');
    const sectionSelect = document.getElementById('sectionSelect');

    // Crear conjuntos para grados y secciones únicos
    const grades = new Set(estudiantes.map(e => e.grado));
    const sections = new Set(estudiantes.map(e => e.seccion));

    // Limpiar selectores
    gradeSelect.innerHTML = '<option value="">Seleccione grado</option>';
    sectionSelect.innerHTML = '<option value="">Seleccione sección</option>';

    // Llenar grados
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });

    // Llenar secciones
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });
}

function loadStudents() {
    const estudiantes = JSON.parse(localStorage.getItem('students')) || [];
    const selectedGrade = document.getElementById('gradeSelect').value;
    const selectedSection = document.getElementById('sectionSelect').value;
    const attendanceTableBody = document.getElementById('attendanceTableBody');

    // Limpiar tabla
    attendanceTableBody.innerHTML = '';

    // Filtrar estudiantes
    const filteredStudents = estudiantes.filter(student => 
        student.grado === selectedGrade && student.seccion === selectedSection
    );

    // Crear filas para cada estudiante
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.apellido}, ${student.nombre}</td>
            <td>${student.dni}</td>
            <td>
                <input type="checkbox" class="attendance-checkbox" data-dni="${student.dni}">
            </td>
            <td>
                <button class="justify-btn" data-dni="${student.dni}" title="Justificar falta">
                    <i class="fas fa-file-medical"></i>
                </button>
            </td>
        `;
        attendanceTableBody.appendChild(row);

        // Agregar evento para el botón de justificación
        const justifyBtn = row.querySelector('.justify-btn');
        justifyBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            const checkbox = row.querySelector('.attendance-checkbox');
            checkbox.disabled = this.classList.contains('active');
            updateCounters();
        });

        // Agregar evento para el checkbox de asistencia
        const checkbox = row.querySelector('.attendance-checkbox');
        checkbox.addEventListener('change', updateCounters);
    });

    // Actualizar contadores al cargar estudiantes
    updateCounters();
}

function updateCounters() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    let presentCount = 0;
    let absentCount = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            presentCount++;
        } else {
            absentCount++;
        }
    });

    document.getElementById('presentCounter').textContent = presentCount;
    document.getElementById('absentCounter').textContent = absentCount;
}

function saveAttendance() {
    const fecha = document.getElementById('classDate').value;
    if (!fecha) {
        alert('Por favor seleccione una fecha');
        return;
    }

    const estudiantes = [];
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.attendance-checkbox');
        const justifyBtn = row.querySelector('.justify-btn');
        const studentData = {
            nombre: row.cells[0].textContent,
            dni: row.cells[1].textContent,
            estado: justifyBtn.classList.contains('active') ? 'justificado' : 
                   checkbox.checked ? 'presente' : 'ausente'
        };
        
        estudiantes.push(studentData);
    });

    const asistencias = JSON.parse(localStorage.getItem('asistencias')) || {};
    if (!asistencias[fecha]) {
        asistencias[fecha] = [];
    }
    
    asistencias[fecha].push({
        grado: document.getElementById('gradeSelect').value,
        seccion: document.getElementById('sectionSelect').value,
        estudiantes: estudiantes
    });

    localStorage.setItem('asistencias', JSON.stringify(asistencias));
    alert('Asistencia guardada correctamente');
}

function showAttendanceModal() {
    const fecha = document.getElementById('classDate').value;
    if (!fecha) {
        alert('Por favor seleccione una fecha');
        return;
    }

    const asistencias = JSON.parse(localStorage.getItem('asistencias')) || {};
    const asistencia = asistencias[fecha]?.find(a => 
        a.grado === document.getElementById('gradeSelect').value &&
        a.seccion === document.getElementById('sectionSelect').value
    );

    if (!asistencia) {
        alert('No hay registros de asistencia para esta fecha, grado y sección.');
        return;
    }

    // Actualizar fecha y grupo en el modal
    document.getElementById('summaryDate').textContent = new Date(fecha).toLocaleDateString();
    document.getElementById('summaryGradeSection').textContent = `${asistencia.grado} - ${asistencia.seccion}`;
    
    // Calcular estadísticas
    const totalStudents = asistencia.estudiantes.length;
    const presentCount = asistencia.estudiantes.filter(e => e.estado === 'presente').length;
    const justifiedCount = asistencia.estudiantes.filter(e => e.estado === 'justificado').length;
    const absentCount = totalStudents - presentCount - justifiedCount;
    const presentPercentage = ((presentCount / totalStudents) * 100).toFixed(1);

    // Actualizar estadísticas
    document.getElementById('presentPercentage').textContent = `${presentPercentage}%`;
    document.getElementById('totalStudents').textContent = totalStudents;

    // Llenar tablas de presentes, ausentes y justificados
    const presentTableBody = document.getElementById('presentStudentsTableBody');
    const absentTableBody = document.getElementById('absentStudentsTableBody');
    const justifiedTableBody = document.getElementById('justifiedStudentsTableBody');
    presentTableBody.innerHTML = '';
    absentTableBody.innerHTML = '';
    justifiedTableBody.innerHTML = '';

    asistencia.estudiantes.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.dni}</td>
            <td><span style="color: ${student.estado === 'presente' ? 'green' : student.estado === 'justificado' ? 'yellow' : 'red'};">${student.estado.charAt(0).toUpperCase()}</span></td>
        `;
        if (student.estado === 'presente') {
            presentTableBody.appendChild(row);
        } else if (student.estado === 'justificado') {
            justifiedTableBody.appendChild(row);
        } else {
            absentTableBody.appendChild(row);
        }
    });

    // Mostrar el modal
    document.getElementById('attendanceSummaryModal').style.display = 'block';
}

function showAttendanceSummary() {
    const fecha = document.getElementById('classDate').value;
    if (!fecha) {
        alert('Por favor seleccione una fecha');
        return;
    }

    const asistencias = JSON.parse(localStorage.getItem('asistencias')) || {};
    const asistencia = asistencias[fecha]?.find(a => 
        a.grado === document.getElementById('gradeSelect').value &&
        a.seccion === document.getElementById('sectionSelect').value
    );

    if (!asistencia) {
        alert('No hay registros de asistencia para esta fecha, grado y sección.');
        return;
    }

    // Actualizar fecha y grupo en el modal
    document.getElementById('summaryDate').textContent = new Date(fecha).toLocaleDateString();
    document.getElementById('summaryGradeSection').textContent = `${asistencia.grado} - ${asistencia.seccion}`;
    
    // Calcular estadísticas
    const totalStudents = asistencia.estudiantes.length;
    const presentCount = asistencia.estudiantes.filter(e => e.estado === 'presente').length;
    const justifiedCount = asistencia.estudiantes.filter(e => e.estado === 'justificado').length;
    const absentCount = totalStudents - presentCount - justifiedCount;
    const presentPercentage = ((presentCount / totalStudents) * 100).toFixed(1);

    // Actualizar estadísticas
    document.getElementById('presentPercentage').textContent = `${presentPercentage}%`;
    document.getElementById('totalStudents').textContent = totalStudents;

    // Llenar tablas de presentes, ausentes y justificados
    const presentTableBody = document.getElementById('presentStudentsTableBody');
    const absentTableBody = document.getElementById('absentStudentsTableBody');
    const justifiedTableBody = document.getElementById('justifiedStudentsTableBody');
    presentTableBody.innerHTML = '';
    absentTableBody.innerHTML = '';
    justifiedTableBody.innerHTML = '';

    asistencia.estudiantes.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.dni}</td>
            <td><span style="color: ${student.estado === 'presente' ? 'green' : student.estado === 'justificado' ? 'yellow' : 'red'};">${student.estado.charAt(0).toUpperCase()}</span></td>
        `;
        if (student.estado === 'presente') {
            presentTableBody.appendChild(row);
        } else if (student.estado === 'justificado') {
            justifiedTableBody.appendChild(row);
        } else {
            absentTableBody.appendChild(row);
        }
    });

    // Mostrar el modal
    document.getElementById('attendanceSummaryModal').style.display = 'block';
}

function closeSummaryModal() {
    const modal = document.getElementById('attendanceSummaryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupModalEvents() {
    const modal = document.getElementById('attendanceSummaryModal');
    const closeBtn = document.getElementById('closeSummaryModal');

    if (modal && closeBtn) {
        // Evento para el botón X
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        // Evento para cerrar al hacer clic fuera del modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // Evento para cerrar con tecla Escape
        document.onkeydown = function(event) {
            if (event.key === "Escape") {
                modal.style.display = 'none';
            }
        }
    }
}

function selectAllStudents() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateCounters();
}

function unselectAllStudents() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateCounters();
}

function exportAttendanceToExcel() {
    const fecha = document.getElementById('classDate').value;
    if (!fecha) {
        alert('Por favor seleccione una fecha');
        return;
    }

    const grado = document.getElementById('gradeSelect').value;
    const seccion = document.getElementById('sectionSelect').value;
    
    // Obtener los datos de asistencia
    const asistencias = JSON.parse(localStorage.getItem('asistencias')) || {};
    const asistencia = asistencias[fecha]?.find(a => 
        a.grado === grado && a.seccion === seccion
    );

    if (!asistencia) {
        alert('No hay registros de asistencia para esta fecha, grado y sección.');
        return;
    }

    // Preparar los datos para Excel
    const wsData = [
        ['Reporte de Asistencia'],
        [`Fecha: ${new Date(fecha).toLocaleDateString()}`],
        [`Grado: ${grado} - Sección: ${seccion}`],
        [], // Línea en blanco
        ['Estudiante', 'DNI', 'Estado'] // Encabezados
    ];

    // Agregar los datos de los estudiantes
    asistencia.estudiantes.forEach(estudiante => {
        wsData.push([
            estudiante.nombre,
            estudiante.dni,
            estudiante.estado.charAt(0).toUpperCase() + estudiante.estado.slice(1)
        ]);
    });

    // Calcular estadísticas
    const totalEstudiantes = asistencia.estudiantes.length;
    const presentes = asistencia.estudiantes.filter(e => e.estado === 'presente').length;
    const ausentes = asistencia.estudiantes.filter(e => e.estado === 'ausente').length;
    const justificados = asistencia.estudiantes.filter(e => e.estado === 'justificado').length;
    const porcentajeAsistencia = ((presentes / totalEstudiantes) * 100).toFixed(1);

    // Agregar estadísticas al final
    wsData.push(
        [], // Línea en blanco
        ['Estadísticas'],
        ['Total Estudiantes', totalEstudiantes],
        ['Presentes', presentes],
        ['Ausentes', ausentes],
        ['Justificados', justificados],
        ['Porcentaje de Asistencia', `${porcentajeAsistencia}%`]
    );

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Dar formato a las celdas
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = {c: C, r: R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;

            // Dar formato a los encabezados
            if (R === 0 || R === 4) {
                ws[cell_ref].s = {
                    font: { bold: true, color: { rgb: "000000" } },
                    fill: { fgColor: { rgb: "CCCCCC" } }
                };
            }
        }
    }

    // Ajustar el ancho de las columnas
    ws['!cols'] = [
        {wch: 30}, // Estudiante
        {wch: 15}, // DNI
        {wch: 15}  // Estado
    ];

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

    // Generar el archivo
    const fileName = `Asistencia_${grado}_${seccion}_${fecha}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Agregar el evento al botón de exportar
document.getElementById('exportAttendanceExcel').addEventListener('click', exportAttendanceToExcel);
