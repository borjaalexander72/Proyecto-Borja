document.addEventListener('DOMContentLoaded', function() {
    loadGrades();
    populateGradeFilter();
    populateSectionFilter();
    
    document.getElementById('searchInput').addEventListener('input', filterGrades);
    document.getElementById('gradeFilter').addEventListener('change', filterGrades);
    document.getElementById('sectionFilter').addEventListener('change', filterGrades);

    // Event listeners for export buttons
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
});

function loadGrades() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const gradesTableBody = document.getElementById('gradesTableBody');
    gradesTableBody.innerHTML = '';

    // Sort students by last name in alphabetical order
    students.sort((a, b) => a.apellido.localeCompare(b.apellido));

    students.forEach((student, index) => {
        const nota1 = parseFloat(student.notas.nota1) || 0;
        const nota2 = parseFloat(student.notas.nota2) || 0;
        const nota3 = parseFloat(student.notas.nota3) || 0;

        // Calcular el promedio numérico correctamente
        const promedioNumerico = (nota1 + nota2 + nota3) / 3;
        const promedioLetra = getLetterGrade(promedioNumerico);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.apellido}</td>
            <td>${student.nombre}</td>
            <td>${index + 1}</td> <!-- N° Orden -->
            <td>${student.grado}</td>
            <td>${student.seccion}</td>
            <td>${nota1}</td>
            <td>${getLetterGrade(nota1)}</td>
            <td>${nota2}</td>
            <td>${getLetterGrade(nota2)}</td>
            <td>${nota3}</td>
            <td>${getLetterGrade(nota3)}</td>
            <td>${promedioNumerico.toFixed(2)}</td>
            <td>${promedioLetra}</td>
        `;
        
        gradesTableBody.appendChild(row);
    });
}

function getLetterGrade(nota) {
    if (nota >= 0 && nota <= 10) {
        return 'C';
    } else if (nota >= 11 && nota <= 14) {
        return 'B';
    } else if (nota >= 15 && nota <= 19) {
        return 'A';
    } else if (nota === 20) {
        return 'AD';
    } else {
        return ''; // Para notas fuera de rango
    }
}

function filterGrades() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const selectedGrade = document.getElementById('gradeFilter').value.toLowerCase();
    const selectedSection = document.getElementById('sectionFilter').value.toLowerCase();
    
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Filter students by grade, section, and search value
    students = students.filter(student => {
        const apellido = student.apellido.toLowerCase();
        const nombre = student.nombre.toLowerCase();
        const dni = student.dni.toLowerCase();
        const grado = student.grado.toLowerCase();
        const seccion = student.seccion.toLowerCase();
        
        const matchesSearch = apellido.includes(searchValue) || nombre.includes(searchValue) || dni.includes(searchValue);
        const matchesGrade = selectedGrade === '' || grado === selectedGrade;
        const matchesSection = selectedSection === '' || seccion === selectedSection;
        
        return matchesSearch && matchesGrade && matchesSection;
    });
    
    // Sort filtered students by last name in alphabetical order
    students.sort((a, b) => a.apellido.localeCompare(b.apellido));
    
    // Clear the table body before adding filtered students
    const gradesTableBody = document.getElementById('gradesTableBody');
    gradesTableBody.innerHTML = '';
    
    // Assign order number based on sorted order
    students.forEach((student, index) => {
        const nota1 = parseFloat(student.notas.nota1) || 0;
        const nota2 = parseFloat(student.notas.nota2) || 0;
        const nota3 = parseFloat(student.notas.nota3) || 0;

        // Calcular el promedio numérico correctamente
        const promedioNumerico = (nota1 + nota2 + nota3) / 3;
        const promedioLetra = getLetterGrade(promedioNumerico);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.apellido}</td>
            <td>${student.nombre}</td>
            <td>${index + 1}</td> <!-- N° Orden -->
            <td>${student.grado}</td>
            <td>${student.seccion}</td>
            <td>${nota1}</td>
            <td>${getLetterGrade(nota1)}</td>
            <td>${nota2}</td>
            <td>${getLetterGrade(nota2)}</td>
            <td>${nota3}</td>
            <td>${getLetterGrade(nota3)}</td>
            <td>${promedioNumerico.toFixed(2)}</td>
            <td>${promedioLetra}</td>
        `;
        
        gradesTableBody.appendChild(row);
    });
}

function populateGradeFilter() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const gradeFilter = document.getElementById('gradeFilter');
    const grades = new Set();

    students.forEach(student => {
        grades.add(student.grado);
    });

    // Limpiar opciones existentes
    gradeFilter.innerHTML = '<option value="">Todos los Grados</option>';

    // Agregar opciones de grado
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeFilter.appendChild(option);
    });
}

function populateSectionFilter() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const sectionFilter = document.getElementById('sectionFilter');
    const sections = new Set();

    students.forEach(student => {
        sections.add(student.seccion);
    });

    // Limpiar opciones existentes
    sectionFilter.innerHTML = '<option value="">Todas las Secciones</option>';

    // Agregar opciones de sección
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
    });
}

function exportToExcel() {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Get the table data
    const table = document.querySelector('.grades-table table');
    const ws = XLSX.utils.table_to_sheet(table);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Notas Estudiantes');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'registro_notas.xlsx');
}

function exportToPDF() {
    // Crear nuevo documento PDF en orientación horizontal
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Obtener la tabla
    const gradesTable = document.querySelector('.grades-table table');
    
    // Exportar la tabla a PDF usando autoTable
    doc.autoTable({
        html: gradesTable,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold'
        },
        margin: { top: 10 }
    });

    // Guardar el PDF
    doc.save('registro_notas.pdf');
}
