import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando dashboard de estadísticas...")

  // Inicializar las estadísticas
  initializeStats()

  // Configurar los filtros
  const gradeFilter = document.getElementById("statsGradeFilter")
  const sectionFilter = document.getElementById("statsSectionFilter")
  const refreshBtn = document.getElementById("refreshStats")

  if (gradeFilter && sectionFilter) {
    gradeFilter.addEventListener("change", updateStats)
    sectionFilter.addEventListener("change", updateStats)
    console.log("Eventos de filtros configurados")
  } else {
    console.error("No se encontraron los elementos de filtro")
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      populateFilters()
      updateStats()
      console.log("Estadísticas actualizadas manualmente")
    })
  }

  // Cargar los filtros con datos
  populateFilters()
})

// Corregir la función populateFilters para asegurar que cargue correctamente los datos
function populateFilters() {
  const students = JSON.parse(localStorage.getItem("students")) || []

  if (students.length === 0) {
    console.log("No hay estudiantes registrados")
    showNotification("info", "Sin datos", "No hay estudiantes registrados en el sistema.")
    return
  }

  const gradeFilter = document.getElementById("statsGradeFilter")
  const sectionFilter = document.getElementById("statsSectionFilter")

  // Obtener grados y secciones únicos
  const grades = [...new Set(students.map((student) => student.grado))].filter(Boolean).sort()
  const sections = [...new Set(students.map((student) => student.seccion))].filter(Boolean).sort()

  console.log("Grados disponibles:", grades)
  console.log("Secciones disponibles:", sections)

  // Limpiar y llenar selector de grados
  gradeFilter.innerHTML = '<option value="">Todos los Grados</option>'
  grades.forEach((grade) => {
    const option = document.createElement("option")
    option.value = grade
    option.textContent = grade
    gradeFilter.appendChild(option)
  })

  // Limpiar y llenar selector de secciones
  sectionFilter.innerHTML = '<option value="">Todas las Secciones</option>'
  sections.forEach((section) => {
    const option = document.createElement("option")
    option.value = section
    option.textContent = section
    sectionFilter.appendChild(option)
  })

  // Mostrar notificación con el total de estudiantes
  showNotification("success", "Datos cargados", `Se han cargado ${students.length} estudiantes en total.`)
}

function initializeStats() {
  // Obtener datos de estudiantes
  const students = JSON.parse(localStorage.getItem("students")) || []

  if (students.length === 0) {
    console.log("No hay estudiantes registrados")
    return
  }

  updateStats()
}

function updateStats() {
  const students = JSON.parse(localStorage.getItem("students")) || []

  if (students.length === 0) {
    document.getElementById("totalStudentsValue").textContent = "0"
    document.getElementById("goodPerformanceValue").textContent = "0%"
    document.getElementById("averagePerformanceValue").textContent = "0%"
    document.getElementById("lowPerformanceValue").textContent = "0%"

    // Limpiar gráficos
    clearCharts()
    return
  }

  const selectedGrade = document.getElementById("statsGradeFilter").value
  const selectedSection = document.getElementById("statsSectionFilter").value

  // Filtrar estudiantes según los filtros seleccionados
  let filteredStudents = students

  if (selectedGrade) {
    filteredStudents = filteredStudents.filter((student) => student.grado === selectedGrade)
  }

  if (selectedSection) {
    filteredStudents = filteredStudents.filter((student) => student.seccion === selectedSection)
  }

  // Calcular estadísticas
  const totalStudents = filteredStudents.length
  let goodPerformance = 0
  let averagePerformance = 0
  let lowPerformance = 0

  // Arrays para almacenar las notas para el gráfico de distribución
  const nota1Values = []
  const nota2Values = []
  const nota3Values = []
  const promedioValues = []

  // Calcular rendimiento basado en notas
  filteredStudents.forEach((student) => {
    const nota1 = Number.parseFloat(student.notas?.nota1) || 0
    const nota2 = Number.parseFloat(student.notas?.nota2) || 0
    const nota3 = Number.parseFloat(student.notas?.nota3) || 0

    // Almacenar notas para el gráfico de distribución
    if (nota1 > 0) nota1Values.push(nota1)
    if (nota2 > 0) nota2Values.push(nota2)
    if (nota3 > 0) nota3Values.push(nota3)

    // Calcular promedio
    const promedio = (nota1 + nota2 + nota3) / 3
    if (promedio > 0) promedioValues.push(promedio)

    // Clasificar rendimiento
    if (promedio >= 15) {
      goodPerformance++
    } else if (promedio >= 11 && promedio < 15) {
      averagePerformance++
    } else {
      lowPerformance++
    }
  })

  // Calcular porcentajes
  const goodPercentage = totalStudents > 0 ? Math.round((goodPerformance / totalStudents) * 100) : 0
  const averagePercentage = totalStudents > 0 ? Math.round((averagePerformance / totalStudents) * 100) : 0
  const lowPercentage = totalStudents > 0 ? Math.round((lowPerformance / totalStudents) * 100) : 0

  // Actualizar valores en la interfaz
  document.getElementById("totalStudentsValue").textContent = totalStudents
  document.getElementById("goodPerformanceValue").textContent = goodPercentage + "%"
  document.getElementById("averagePerformanceValue").textContent = averagePercentage + "%"
  document.getElementById("lowPerformanceValue").textContent = lowPercentage + "%"

  // Actualizar gráficos
  updateCharts(goodPerformance, averagePerformance, lowPerformance)

  // Actualizar gráfico de distribución de notas
  updateNotesDistributionChart(nota1Values, nota2Values, nota3Values, promedioValues)

  // Mostrar mensaje de filtro aplicado
  if (selectedGrade || selectedSection) {
    let message = "Filtro aplicado: "
    if (selectedGrade) message += `Grado ${selectedGrade}`
    if (selectedGrade && selectedSection) message += " - "
    if (selectedSection) message += `Sección ${selectedSection}`

    showNotification("info", "Filtro aplicado", `${message}. Mostrando ${totalStudents} estudiantes.`)
  }
}

function clearCharts() {
  // Limpiar gráfico de barras
  if (window.performanceChart instanceof Chart) {
    window.performanceChart.destroy()
  }

  // Limpiar gráfico de pastel
  if (window.performancePieChart instanceof Chart) {
    window.performancePieChart.destroy()
  }

  // Limpiar gráfico de distribución de notas
  if (window.notesDistributionChart instanceof Chart) {
    window.notesDistributionChart.destroy()
  }
}

function updateCharts(good, average, low) {
  // Limpiar gráficos existentes
  clearCharts()

  const ctx = document.getElementById("performanceChart").getContext("2d")

  // Crear nuevo gráfico de barras
  window.performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Buen Rendimiento", "Rendimiento Regular", "Bajo Rendimiento"],
      datasets: [
        {
          label: "Cantidad de Estudiantes",
          data: [good, average, low],
          backgroundColor: ["rgba(74, 222, 128, 0.7)", "rgba(251, 191, 36, 0.7)", "rgba(244, 63, 94, 0.7)"],
          borderColor: ["rgba(74, 222, 128, 1)", "rgba(251, 191, 36, 1)", "rgba(244, 63, 94, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw} estudiantes`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutQuart",
      },
    },
  })

  // Crear gráfico de pastel para mostrar la distribución
  const total = good + average + low
  if (total > 0) {
    // Crear un nuevo canvas para el gráfico de pastel si no existe
    let pieCanvas = document.getElementById("performancePieChart")
    if (!pieCanvas) {
      pieCanvas = document.createElement("canvas")
      pieCanvas.id = "performancePieChart"
      document.querySelector(".chart-container").appendChild(pieCanvas)
    }

    const pieCtx = pieCanvas.getContext("2d")

    window.performancePieChart = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: ["Buen Rendimiento", "Rendimiento Regular", "Bajo Rendimiento"],
        datasets: [
          {
            data: [good, average, low],
            backgroundColor: ["rgba(74, 222, 128, 0.7)", "rgba(251, 191, 36, 0.7)", "rgba(244, 63, 94, 0.7)"],
            borderColor: ["rgba(74, 222, 128, 1)", "rgba(251, 191, 36, 1)", "rgba(244, 63, 94, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const percentage = Math.round((context.raw / total) * 100)
                return `${context.raw} estudiantes (${percentage}%)`
              },
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
      },
    })
  }
}

// Nueva función para crear el gráfico de distribución de notas
function updateNotesDistributionChart(nota1Values, nota2Values, nota3Values, promedioValues) {
  const canvas = document.getElementById("notesDistributionChart")
  if (!canvas) {
    console.error("No se encontró el canvas para el gráfico de distribución de notas")
    return
  }

  const ctx = canvas.getContext("2d")

  // Calcular la distribución de notas por rangos
  const ranges = ["0-5", "6-10", "11-14", "15-17", "18-20"]

  // Función para contar notas por rango
  function countByRange(values) {
    const counts = [0, 0, 0, 0, 0] // Para cada rango

    values.forEach((value) => {
      if (value >= 0 && value <= 5) counts[0]++
      else if (value > 5 && value <= 10) counts[1]++
      else if (value > 10 && value <= 14) counts[2]++
      else if (value > 14 && value <= 17) counts[3]++
      else if (value > 17 && value <= 20) counts[4]++
    })

    return counts
  }

  const nota1Distribution = countByRange(nota1Values)
  const nota2Distribution = countByRange(nota2Values)
  const nota3Distribution = countByRange(nota3Values)
  const promedioDistribution = countByRange(promedioValues)

  // Crear el gráfico de líneas
  window.notesDistributionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ranges,
      datasets: [
        {
          label: "Nota 1",
          data: nota1Distribution,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "rgba(75, 192, 192, 1)",
          pointRadius: 4,
        },
        {
          label: "Nota 2",
          data: nota2Distribution,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "rgba(153, 102, 255, 1)",
          pointRadius: 4,
        },
        {
          label: "Nota 3",
          data: nota3Distribution,
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "rgba(255, 159, 64, 1)",
          pointRadius: 4,
        },
        {
          label: "Promedio",
          data: promedioDistribution,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          pointRadius: 5,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Distribución de Notas por Rango",
          font: {
            size: 16,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw} estudiantes`,
          },
        },
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de Estudiantes",
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          title: {
            display: true,
            text: "Rango de Notas",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      animation: {
        duration: 1000,
      },
    },
  })
}

// Función para mostrar notificación
function showNotification(type, title, message) {
  // Verificar si ya existe una notificación
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  // Crear elemento de notificación
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  // Contenido de la notificación
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
  `

  // Agregar al DOM
  document.body.appendChild(notification)

  // Mostrar con animación
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  // Ocultar después de 5 segundos
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 5000)
}

// Evento para el botón de cerrar sesión
document.getElementById("logout-btn").addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    window.location.href = "index.html"
  }
})

// Función para cargar los filtros
function loadFilters() {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const gradeFilter = document.getElementById("statsGradeFilter");
    const sectionFilter = document.getElementById("statsSectionFilter");
    
    // Obtener grados y secciones únicos
    const grades = [...new Set(students.map(student => student.grade))];
    const sections = [...new Set(students.map(student => student.section))];
    
    // Llenar los filtros
    gradeFilter.innerHTML = '<option value="">Todos los Grados</option>';
    grades.forEach(grade => {
        gradeFilter.innerHTML += `<option value="${grade}">${grade}</option>`;
    });
    
    sectionFilter.innerHTML = '<option value="">Todas las Secciones</option>';
    sections.forEach(section => {
        sectionFilter.innerHTML += `<option value="${section}">${section}</option>`;
    });
}

// Función para calcular estadísticas
function calculateStats(students, selectedGrade, selectedSection) {
    let filteredStudents = students;
    
    // Aplicar filtros si están seleccionados
    if (selectedGrade) {
        filteredStudents = filteredStudents.filter(student => student.grade === selectedGrade);
    }
    if (selectedSection) {
        filteredStudents = filteredStudents.filter(student => student.section === selectedSection);
    }
    
    const totalStudents = filteredStudents.length;
    let goodPerformance = 0;
    let averagePerformance = 0;
    let lowPerformance = 0;
    
    // Calcular promedios y categorizar estudiantes
    filteredStudents.forEach(student => {
        const average = calculateStudentAverage(student.grades);
        if (average >= 15) goodPerformance++;
        else if (average >= 11) averagePerformance++;
        else lowPerformance++;
    });
    
    return {
        total: totalStudents,
        good: (goodPerformance / totalStudents) * 100,
        average: (averagePerformance / totalStudents) * 100,
        low: (lowPerformance / totalStudents) * 100
    };
}

// Función para calcular promedio de un estudiante
function calculateStudentAverage(grades) {
    if (!grades || grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
}

// Función para actualizar el gráfico de distribución de notas
function updateNotesDistributionChart(students, selectedGrade, selectedSection) {
    const filteredStudents = students.filter(student => 
        (!selectedGrade || student.grade === selectedGrade) &&
        (!selectedSection || student.section === selectedSection)
    );
    
    const averages = filteredStudents.map(student => calculateStudentAverage(student.grades));
    const labels = Array.from({length: 21}, (_, i) => i);
    const data = new Array(21).fill(0);
    
    averages.forEach(avg => {
        const roundedAvg = Math.round(avg);
        if (roundedAvg >= 0 && roundedAvg <= 20) {
            data[roundedAvg]++;
        }
    });
    
    const ctx = document.getElementById('notesDistributionChart').getContext('2d');
    if (window.notesChart) window.notesChart.destroy();
    
    window.notesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Estudiantes',
                data: data,
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Función principal para actualizar todas las estadísticas
function updateAllStats() {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const selectedGrade = document.getElementById("statsGradeFilter").value;
    const selectedSection = document.getElementById("statsSectionFilter").value;
    
    const stats = calculateStats(students, selectedGrade, selectedSection);
    
    // Actualizar valores en el DOM
    document.getElementById("totalStudentsValue").textContent = stats.total;
    document.getElementById("goodPerformanceValue").textContent = `${Math.round(stats.good)}%`;
    document.getElementById("averagePerformanceValue").textContent = `${Math.round(stats.average)}%`;
    document.getElementById("lowPerformanceValue").textContent = `${Math.round(stats.low)}%`;
    
    // Actualizar gráfico
    updateNotesDistributionChart(students, selectedGrade, selectedSection);
}

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    loadFilters();
    updateAllStats();
    
    // Event listeners para filtros y botón de actualizar
    document.getElementById("statsGradeFilter").addEventListener("change", updateAllStats);
    document.getElementById("statsSectionFilter").addEventListener("change", updateAllStats);
    document.getElementById("refreshStats").addEventListener("click", updateAllStats);
});

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const goodPerformanceElement = document.getElementById('goodPerformanceValue');
    const averagePerformanceElement = document.getElementById('averagePerformanceValue');
    const lowPerformanceElement = document.getElementById('lowPerformanceValue');
    const totalStudentsElement = document.getElementById('totalStudentsValue');

    function calculatePerformanceStats() {
        // Obtener las notas del localStorage (guardadas en registro-notas.html)
        const studentGrades = JSON.parse(localStorage.getItem('studentGrades')) || [];
        
        // Si no hay notas, mostrar 0 en todas las estadísticas
        if (studentGrades.length === 0) {
            totalStudentsElement.textContent = '0';
            goodPerformanceElement.textContent = '0%';
            averagePerformanceElement.textContent = '0%';
            lowPerformanceElement.textContent = '0%';
            return;
        }

        // Agrupar notas por estudiante y calcular promedios
        const studentAverages = {};
        studentGrades.forEach(grade => {
            if (!studentAverages[grade.studentId]) {
                studentAverages[grade.studentId] = {
                    total: 0,
                    count: 0
                };
            }
            studentAverages[grade.studentId].total += parseFloat(grade.grade);
            studentAverages[grade.studentId].count++;
        });

        // Calcular el promedio final de cada estudiante
        const finalAverages = Object.values(studentAverages).map(student => 
            student.total / student.count
        );

        // Contar estudiantes en cada categoría
        const totalStudents = finalAverages.length;
        let goodCount = 0;
        let averageCount = 0;
        let lowCount = 0;

        finalAverages.forEach(average => {
            if (average >= 15) {
                goodCount++;
            } else if (average >= 11) {
                averageCount++;
            } else {
                lowCount++;
            }
        });

        // Calcular porcentajes
        const goodPercentage = ((goodCount / totalStudents) * 100).toFixed(1);
        const averagePercentage = ((averageCount / totalStudents) * 100).toFixed(1);
        const lowPercentage = ((lowCount / totalStudents) * 100).toFixed(1);

        // Actualizar el DOM
        totalStudentsElement.textContent = totalStudents;
        goodPerformanceElement.textContent = `${goodPercentage}%`;
        averagePerformanceElement.textContent = `${averagePercentage}%`;
        lowPerformanceElement.textContent = `${lowPercentage}%`;
    }

    // Calcular estadísticas al cargar la página
    calculatePerformanceStats();

    // Actualizar cuando se presione el botón de refrescar
    document.getElementById('refreshStats').addEventListener('click', calculatePerformanceStats);
});

document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    setupCharts();
    setupFilters();
});

function updateDashboardStats() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    console.log("Estudiantes cargados:", students.length); // Debug
    
    // Actualizar contador total de estudiantes
    document.getElementById('totalStudentsValue').textContent = students.length;

    // Calcular rendimiento
    let goodPerformance = 0;
    let averagePerformance = 0;
    let lowPerformance = 0;

    students.forEach(student => {
        const notas = student.notas || {};
        const nota1 = parseFloat(notas.nota1) || 0;
        const nota2 = parseFloat(notas.nota2) || 0;
        const nota3 = parseFloat(notas.nota3) || 0;
        
        // Calcular promedio solo si hay al menos una nota
        if (nota1 || nota2 || nota3) {
            const notasValidas = [nota1, nota2, nota3].filter(nota => nota > 0);
            const promedio = notasValidas.length > 0 ? 
                notasValidas.reduce((a, b) => a + b) / notasValidas.length : 0;

            if (promedio >= 15) {
                goodPerformance++;
            } else if (promedio >= 11) {
                averagePerformance++;
            } else if (promedio > 0) {
                lowPerformance++;
            }
        }
    });

    // Calcular porcentajes
    const total = students.length || 1;
    const goodPercent = ((goodPerformance / total) * 100).toFixed(1);
    const averagePercent = ((averagePerformance / total) * 100).toFixed(1);
    const lowPercent = ((lowPerformance / total) * 100).toFixed(1);

    // Actualizar valores en el dashboard
    document.getElementById('goodPerformanceValue').textContent = goodPercent + '%';
    document.getElementById('averagePerformanceValue').textContent = averagePercent + '%';
    document.getElementById('lowPerformanceValue').textContent = lowPercent + '%';

    // Actualizar gráficos
    updateCharts(goodPerformance, averagePerformance, lowPerformance);
}

function calculateAverage(notas) {
    const validNotas = notas.filter(nota => !isNaN(parseFloat(nota)) && nota !== '');
    if (validNotas.length === 0) return 0;
    
    const sum = validNotas.reduce((acc, nota) => acc + parseFloat(nota), 0);
    return sum / validNotas.length;
}

function setupCharts() {
    // Gráfico de rendimiento
    const ctx = document.getElementById('performanceChart').getContext('2d');
    window.performanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Buen Rendimiento', 'Rendimiento Regular', 'Bajo Rendimiento'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Gráfico de distribución de notas
    const ctx2 = document.getElementById('notesDistributionChart').getContext('2d');
    window.notesChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['0-5', '6-10', '11-13', '14-16', '17-20'],
            datasets: [{
                label: 'Cantidad de Estudiantes',
                data: [0, 0, 0, 0, 0],
                borderColor: '#4e73df',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateCharts(good, average, low) {
    // Actualizar gráfico de rendimiento
    performanceChart.data.datasets[0].data = [good, average, low];
    performanceChart.update();

    // Actualizar gráfico de distribución de notas
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const distribution = [0, 0, 0, 0, 0]; // [0-5, 6-10, 11-13, 14-16, 17-20]

    students.forEach(student => {
        const promedio = calculateAverage([student.notas.nota1, student.notas.nota2, student.notas.nota3]);
        
        if (promedio <= 5) distribution[0]++;
        else if (promedio <= 10) distribution[1]++;
        else if (promedio <= 13) distribution[2]++;
        else if (promedio <= 16) distribution[3]++;
        else distribution[4]++;
    });

    notesChart.data.datasets[0].data = distribution;
    notesChart.update();
}

function setupFilters() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const gradeFilter = document.getElementById('statsGradeFilter');
    const sectionFilter = document.getElementById('statsSectionFilter');
    
    // Obtener grados y secciones únicos
    const grades = [...new Set(students.map(s => s.grado))];
    const sections = [...new Set(students.map(s => s.seccion))];
    
    // Llenar filtros
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = `Grado ${grade}`;
        gradeFilter.appendChild(option);
    });

    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = `Sección ${section}`;
        sectionFilter.appendChild(option);
    });

    // Eventos de filtros
    gradeFilter.addEventListener('change', filterStats);
    sectionFilter.addEventListener('change', filterStats);
    document.getElementById('refreshStats').addEventListener('click', filterStats);
}

function filterStats() {
    const selectedGrade = document.getElementById('statsGradeFilter').value;
    const selectedSection = document.getElementById('statsSectionFilter').value;
    
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Aplicar filtros
    if (selectedGrade) {
        students = students.filter(s => s.grado === selectedGrade);
    }
    if (selectedSection) {
        students = students.filter(s => s.seccion === selectedSection);
    }
    
    // Actualizar estadísticas con los estudiantes filtrados
    updateFilteredStats(students);
}

function updateFilteredStats(filteredStudents) {
    // Similar a updateDashboardStats pero usando filteredStudents en lugar de todos los estudiantes
    // Actualizar contadores y gráficos con los datos filtrados
    // ... implementar lógica similar a updateDashboardStats
}

