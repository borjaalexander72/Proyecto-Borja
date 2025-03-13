document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    populateSectionFilter();
    // Agregar evento a los botones "+"
    document.querySelectorAll('.add-point').forEach(button => {
        button.addEventListener('click', function() {
            addPointToNota(this);
            updateProgressBar(this); // Actualizar la barra de progreso
        });
    });
});

document.getElementById('addStudentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const apellido = document.getElementById('apellido').value;
    const nombre = document.getElementById('nombre').value;
    const dni = document.getElementById('dni').value;
    const grado = document.getElementById('grado').value;
    const seccion = document.getElementById('seccion').value;
    
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Check for duplicate students
    if (students.some(student => student.dni === dni || (student.apellido === apellido && student.nombre === nombre && student.grado === grado && student.seccion === seccion))) {
        alert("El estudiante ya existe.");
        return;
    }
    
    const student = {
        apellido,
        nombre,
        dni,
        grado,
        seccion,
        notas: {
            nota1: '',
            nota2: '',
            nota3: ''
        },
        practicaCalificadaProgress: 0
    };
    
    saveStudent(student);
    loadStudents(); // Reload students to update the order and N° Orden
    
    // Limpiar el formulario
    document.getElementById('addStudentForm').reset();
});

function saveStudent(student) {
    let students = JSON.parse(localStorage.getItem('students')) || [];
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    // Disparar evento de actualización
    window.dispatchEvent(new Event('studentsUpdated'));
}

function loadStudents() {
    const studentTableBody = document.getElementById('studentTableBody');
    studentTableBody.innerHTML = ''; // Clear the table body before loading students
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Sort students by last name in alphabetical order
    students.sort((a, b) => a.apellido.localeCompare(b.apellido));
    
    // Assign order number based on sorted order
    students.forEach((student, index) => {
        addStudentToTable(student, index + 1);
    });
}

function addStudentToTable(student, orderNumber) {
    const studentTableBody = document.getElementById('studentTableBody');
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.apellido}</td>
        <td>${student.nombre}</td>
        <td>${orderNumber}</td> <!-- N° Orden -->
        <td>${student.grado}</td>
        <td>${student.seccion}</td>
        <td class="actions">
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        </td>
    `;
    
    studentTableBody.appendChild(row);
    
    // Añadir funcionalidad de eliminar
    row.querySelector('.delete-btn').addEventListener('click', function() {
        row.remove();
        deleteStudent(student.dni);
    });

    // Añadir funcionalidad de editar
    row.querySelector('.edit-btn').addEventListener('click', function() {
        openEditModal(student);
    });
}

function deleteStudent(dni) {
    let students = JSON.parse(localStorage.getItem('students')) || [];
    students = students.filter(student => student.dni !== dni);
    localStorage.setItem('students', JSON.stringify(students));
    loadStudents(); // Reload students to update the order and N° Orden
    
    // Disparar evento de actualización
    window.dispatchEvent(new Event('studentsUpdated'));
}

// Funcionalidad de búsqueda
document.getElementById('searchInput').addEventListener('input', function() {
    filterStudents();
});

// Funcionalidad de filtro por sección
document.getElementById('sectionFilter').addEventListener('change', function() {
    filterStudents();
});

// Función para filtrar estudiantes
function filterStudents() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const selectedSection = document.getElementById('sectionFilter').value.toLowerCase();
    const rows = document.querySelectorAll('#studentTableBody tr');
    
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Filter students by section and search value
    students = students.filter(student => {
        const apellido = student.apellido.toLowerCase();
        const nombre = student.nombre.toLowerCase();
        const dni = student.dni.toLowerCase();
        const seccion = student.seccion.toLowerCase();
        
        const matchesSearch = apellido.includes(searchValue) || nombre.includes(searchValue) || dni.includes(searchValue);
        const matchesSection = selectedSection === '' || seccion === selectedSection;
        
        return matchesSearch && matchesSection;
    });
    
    // Sort filtered students by last name in alphabetical order
    students.sort((a, b) => a.apellido.localeCompare(b.apellido));
    
    // Clear the table body before adding filtered students
    const studentTableBody = document.getElementById('studentTableBody');
    studentTableBody.innerHTML = '';
    
    // Assign order number based on sorted order
    students.forEach((student, index) => {
        addStudentToTable(student, index + 1);
    });
}

function openEditModal(student) {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close-btn');
    
    document.getElementById('editDni').value = student.dni;
    document.getElementById('editApellido').value = student.apellido;
    document.getElementById('editNombre').value = student.nombre;
    document.getElementById('editGrado').value = student.grado;
    document.getElementById('editSeccion').value = student.seccion;
    document.getElementById('editNota1').value = student.notas.nota1;
    document.getElementById('editNota2').value = student.notas.nota2;
    document.getElementById('editNota3').value = student.notas.nota3;
    
    modal.style.display = 'block';
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    // Actualizar la barra de progreso al abrir el modal
    updateProgressBar(student.practicaCalificadaProgress, 'editNota3');
}

// ... (resto del código)

function addPointToNota(button) {
    // Obtener el ID del input de la nota
    const notaId = button.dataset.notaId;
    // Obtener el valor actual de la nota
    const notaInput = document.getElementById(notaId);
    let nota = parseInt(notaInput.value) || 0;
    // Obtener el valor del botón
    const pointsToAdd = parseInt(button.textContent);
    // Sumar los puntos a la nota
    nota += pointsToAdd;
    // Actualizar el valor del input de la nota
    notaInput.value = nota;
}

function updateProgressBar(percentage, notaId) {
    const progressBar = document.getElementById(`${notaId}ProgressBar`);
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');

    // Calcular el porcentaje de desarrollo
    progressFill.style.width = percentage + '%';
    progressText.textContent = percentage + '%';
}

// ... (resto del código)

document.getElementById('editStudentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const dni = document.getElementById('editDni').value;
    const apellido = document.getElementById('editApellido').value;
    const nombre = document.getElementById('editNombre').value;
    const grado = document.getElementById('editGrado').value;
    const seccion = document.getElementById('editSeccion').value;
    const nota1 = parseInt(document.getElementById('editNota1').value) || 0; // Convertir a número
    const nota2 = parseInt(document.getElementById('editNota2').value) || 0; // Convertir a número
    const nota3 = parseInt(document.getElementById('editNota3').value) || 0; // Convertir a número

    // Validación de las notas
    if (nota1 > 20 || nota2 > 20 || nota3 > 20) {
        alert("Las notas no pueden ser mayores a 20.");
        return; // Detener el envío del formulario
    }
    
    let students = JSON.parse(localStorage.getItem('students')) || [];
    const studentIndex = students.findIndex(student => student.dni === dni);
    
    if (studentIndex !== -1) {
        students[studentIndex] = {
            dni,
            apellido,
            nombre,
            grado,
            seccion,
            notas: {
                nota1,
                nota2,
                nota3
            },
            // Guardar el porcentaje de la práctica calificada
            practicaCalificadaProgress: (nota3 / 20) * 100
        };
        localStorage.setItem('students', JSON.stringify(students));
        location.reload();
    }
});

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

function addStudentToGradesTable(student) {
    const studentGradesTableBody = document.getElementById('studentGradesTableBody');
    
    const row = document.createElement('tr');
    const promedio = ((student.notas.nota1 + student.notas.nota2 + student.notas.nota3 + student.notas.nota4 + student.notas.nota5) / 5).toFixed(2);
    const letterGrade1 = getLetterGrade(student.notas.nota1);
    const letterGrade2 = getLetterGrade(student.notas.nota2);
    const letterGrade3 = getLetterGrade(student.notas.nota3);
    const letterGrade4 = getLetterGrade(student.notas.nota4);
    const letterGrade5 = getLetterGrade(student.notas.nota5);
    
    row.innerHTML = `
        <td>${student.apellido}</td>
        <td>${student.nombre}</td>
        <td>${student.dni}</td>
        <td>${student.grado}</td>
        <td>${student.seccion}</td>
        <td>${student.notas.nota1} (${letterGrade1})</td>
        <td>${student.notas.nota2} (${letterGrade2})</td>
        <td>${student.notas.nota3} (${letterGrade3})</td>
        <td>${student.notas.nota4} (${letterGrade4})</td>
        <td>${student.notas.nota5} (${letterGrade5})</td>
        <td>${promedio}</td>
    `;
    
    studentGradesTableBody.appendChild(row);
}

document.getElementById('clearNotesButton').addEventListener('click', function() {
    const confirmation = confirm("Las notas que pusiste se borrarán, así que exporta las notas o tomale una captura porque no podrás recuperar las notas. Preciona ACEPTAR para que las notas se borren.");
    
    if (confirmation) {
        let students = JSON.parse(localStorage.getItem('students')) || [];

        students.forEach(student => {
            student.notas.nota1 = '';
            student.notas.nota2 = '';
            student.notas.nota3 = '';
        });

        localStorage.setItem('students', JSON.stringify(students));
        loadStudents();
    }
});

function populateSectionFilter() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const sectionFilter = document.getElementById('sectionFilter');
    const sections = new Set();

    students.forEach(student => {
        sections.add(student.seccion);
    });

    sectionFilter.innerHTML = '<option value="">Todas las Secciones</option>';

    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
    });
}

document.getElementById('uploadExcelButton').addEventListener('click', function() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo Excel.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Procesar los datos del Excel
        if (jsonData.length > 0) {
            jsonData.forEach((row, index) => {
                // Ignorar la primera fila (encabezados)
                if (index === 0) return;

                const [apellido, nombre, dni, grado, seccion] = row;

                // Verificar que al menos uno de los campos tenga datos
                if (apellido || nombre || grado || seccion) {
                    const student = {
                        apellido: apellido ? apellido.trim() : '', // Asignar cadena vacía si está vacío
                        nombre: nombre ? nombre.trim() : '', // Asignar cadena vacía si está vacío
                        dni: dni ? dni.trim() : '', // Asignar cadena vacía si está vacío
                        grado: grado ? grado.trim() : '', // Asignar cadena vacía si está vacío
                        seccion: seccion ? seccion.trim() : '', // Asignar cadena vacía si está vacío
                        notas: {
                            nota1: '',
                            nota2: '',
                            nota3: ''
                        },
                        practicaCalificadaProgress: 0
                    };

                    addStudentToTable(student);
                    saveStudent(student);
                }
            });
        }

        alert("Estudiantes cargados exitosamente desde Excel.");
        fileInput.value = ''; // Limpiar el campo de archivo
    };

    reader.readAsArrayBuffer(file);
});

document.getElementById('exportExcelButton').addEventListener('click', function() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Convertir los datos de los estudiantes a un formato adecuado para Excel
    const data = students.map(student => ({
        Apellidos: student.apellido,
        Nombres: student.nombre,
        DNI: student.dni || '', // Si está vacío, asignar cadena vacía
        Grado: student.grado || '', // Si está vacío, asignar cadena vacía
        Sección: student.seccion || '', // Si está vacío, asignar cadena vacía
    }));

    // Crear un libro de trabajo y una hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');

    // Exportar el archivo
    XLSX.writeFile(wb, 'Lista_Estudiantes.xlsx');
});

document.getElementById('uploadWordButton').addEventListener('click', function() {
    const fileInput = document.getElementById('wordFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo Word.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
            .then(function(result) {
                const html = result.value; // El HTML extraído
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Extraer las filas de la tabla
                const rows = tempDiv.querySelectorAll('table tr');

                // Ignorar la primera fila (encabezados)
                if (rows.length > 0) {
                    rows.forEach((row, index) => {
                        if (index === 0) return; // Ignorar encabezados

                        const cells = row.querySelectorAll('td'); // Obtener todas las celdas
                        if (cells.length > 0) {
                            const apellido = cells[0] ? cells[0].innerText.trim() : ''; // Apellido
                            const nombre = cells[1] ? cells[1].innerText.trim() : ''; // Nombre
                            const grado = cells[2] ? cells[2].innerText.trim() : ''; // Grado
                            const seccion = cells[3] ? cells[3].innerText.trim() : ''; // Sección

                            // Verificar que al menos uno de los campos tenga datos
                            if (apellido || nombre || grado || seccion) {
                                const student = {
                                    apellido: apellido || '',
                                    nombre: nombre || '',
                                    dni: '', // Puedes dejarlo vacío o agregar lógica para obtenerlo
                                    grado: grado || '',
                                    seccion: seccion || '',
                                    notas: {
                                        nota1: '',
                                        nota2: '',
                                        nota3: ''
                                    },
                                    practicaCalificadaProgress: 0
                                };

                                addStudentToTable(student);
                                saveStudent(student);
                            }
                        }
                    });
                }

                alert("Estudiantes cargados exitosamente desde Word.");
                fileInput.value = ''; // Limpiar el campo de archivo
            })
            .catch(function(err) {
                console.error("Error al leer el archivo Word:", err);
                alert("Error al procesar el archivo Word. Asegúrate de que el archivo esté en el formato correcto.");
            });
    };

    reader.readAsArrayBuffer(file);
});

function addPointToNota(button) {
    // Obtener el ID del input de la nota
    const notaId = button.dataset.notaId;
    // Obtener el valor actual de la nota
    const notaInput = document.getElementById(notaId);
    let nota = parseInt(notaInput.value) || 0;
    // Obtener el valor del botón
    const pointsToAdd = parseInt(button.textContent);
    // Sumar los puntos a la nota
    nota += pointsToAdd;
    // Actualizar el valor del input de la nota
    notaInput.value = nota;
}

function updateProgressBar(percentage, notaId) {
    const progressBar = document.getElementById(`${notaId}ProgressBar`);
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');

    // Calcular el porcentaje de desarrollo
    progressFill.style.width = percentage + '%';
    progressText.textContent = percentage + '%';
}
