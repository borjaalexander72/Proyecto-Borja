document.addEventListener("DOMContentLoaded", () => {
    loadCourses()
    initializeEventListeners()
  
    // Inicializar selector de colores
    initializeColorSelector()
  })
  
  function initializeEventListeners() {
    // Botón para nuevo curso
    document.getElementById("new-course-btn").addEventListener("click", () => {
      showModal()
    })
  
    // Cerrar modales
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none"
      })
    })
  
    // Guardar curso
    document.getElementById("save-course").addEventListener("click", saveCourse)
  
    // Búsqueda de cursos
    document.getElementById("course-search").addEventListener("input", filterCourses)
  
    // Agregar sesión
    document.getElementById("add-session-btn").addEventListener("click", () => {
      showSessionModal()
    })
  
    // Guardar sesión
    document.getElementById("save-session").addEventListener("click", saveSession)
  
    // Agregar actividad
    document.getElementById("add-activity-btn").addEventListener("click", addActivity)
  
    // Guardar notas de sesión
    document.getElementById("save-session-grades").addEventListener("click", saveSessionGrades)
  
    // Exportar notas
    document.getElementById("export-session-grades").addEventListener("click", exportSessionGrades)
  
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
      }
    })
  
    // Eliminar actividad (delegación de eventos)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-activity")) {
        e.target.closest(".activity-form").remove()
      }
    })
  }
  
  // Variables globales
  let currentCourseId = null
  let currentSessionId = null
  
  function initializeColorSelector() {
    const colorOptions = document.querySelectorAll(".color-option")
    const colorInput = document.getElementById("course-color")
  
    // Seleccionar el primer color por defecto
    colorOptions[0].classList.add("selected")
  
    colorOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Quitar selección anterior
        document.querySelector(".color-option.selected")?.classList.remove("selected")
  
        // Añadir selección al color actual
        option.classList.add("selected")
  
        // Actualizar valor en el input oculto
        colorInput.value = option.dataset.color
      })
    })
  }
  
  function loadCourses() {
    const courses = JSON.parse(localStorage.getItem("courses")) || []
    displayCourses(courses)
  }
  
  function createCourseCard(course, index) {
    const card = document.createElement("div")
  
    // Asignar color basado en la selección del usuario o usar un color por defecto
    const colorIndex = course.color || (index % 6) + 1
  
    card.innerHTML = `
      <div class="course-card">
        <div class="course-header course-color-${colorIndex}">
          <h3>${course.name}</h3>
          <p><i class="fas fa-hashtag"></i> <strong>Código:</strong> ${course.code}</p>
          <p><i class="fas fa-calendar-alt"></i> <strong>Semestre:</strong> ${course.semester}</p>
        </div>
        <div class="course-content">
          <p>${course.description || "Sin descripción"}</p>
          
          <div class="course-stats">
            <div class="stat-item">
              <div class="stat-value">${getSessionsCount(course.id)}</div>
              <div class="stat-label">Sesiones</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${getStudentsCount(course.id)}</div>
              <div class="stat-label">Estudiantes</div>
            </div>
          </div>
          
          <div class="course-actions">
            <button class="btn-edit" data-course-id="${course.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-sessions" data-course-id="${course.id}">
              <i class="fas fa-clock"></i> Sesiones
            </button>
            <button class="btn-delete" data-course-id="${course.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
  
    // Agregar eventos
    const editBtn = card.querySelector(".btn-edit")
    const sessionsBtn = card.querySelector(".btn-sessions")
    const deleteBtn = card.querySelector(".btn-delete")
  
    editBtn.addEventListener("click", () => showModal(course))
    sessionsBtn.addEventListener("click", () => showCourseDetails(course))
    deleteBtn.addEventListener("click", () => deleteCourse(course.id))
  
    return card
  }
  
  function displayCourses(courses) {
    const container = document.getElementById("courses-container")
    container.innerHTML = ""
  
    if (courses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open fa-3x"></i>
          <h3>No hay cursos registrados</h3>
          <p>Haz clic en "Nuevo Curso" para comenzar a agregar tus cursos.</p>
        </div>
      `
      return
    }
  
    courses.forEach((course, index) => {
      const card = createCourseCard(course, index)
      container.appendChild(card)
    })
  }
  
  function showModal(courseData = null) {
    const modal = document.getElementById("course-modal")
    const modalTitle = document.getElementById("modal-title")
    const saveButton = document.getElementById("save-course")
    const colorOptions = document.querySelectorAll(".color-option")
  
    if (courseData) {
      modalTitle.textContent = "Editar Curso"
      // Rellenar el formulario con los datos del curso
      document.getElementById("course-name").value = courseData.name
      document.getElementById("course-code").value = courseData.code
      document.getElementById("course-semester").value = courseData.semester
      document.getElementById("course-description").value = courseData.description || ""
      document.getElementById("enable-forums").checked = courseData.enableForums || false
      document.getElementById("enable-assignments").checked = courseData.enableAssignments || false
      document.getElementById("enable-attendance").checked = courseData.enableAttendance || false
      document.getElementById("enable-resources").checked = courseData.enableResources || false
  
      // Seleccionar el color del curso
      document.querySelector(".color-option.selected")?.classList.remove("selected")
      const colorToSelect = courseData.color || 1
      document.querySelector(`.color-option[data-color="${colorToSelect}"]`).classList.add("selected")
      document.getElementById("course-color").value = colorToSelect
  
      // Agregar el ID del curso como atributo de datos al botón de guardar
      saveButton.dataset.courseId = courseData.id
    } else {
      modalTitle.textContent = "Nuevo Curso"
      // Limpiar el formulario
      document.getElementById("course-name").value = ""
      document.getElementById("course-code").value = ""
      document.getElementById("course-semester").value = "2024-1"
      document.getElementById("course-description").value = ""
      document.getElementById("enable-forums").checked = false
      document.getElementById("enable-assignments").checked = false
      document.getElementById("enable-attendance").checked = false
      document.getElementById("enable-resources").checked = false
  
      // Seleccionar el primer color por defecto
      document.querySelector(".color-option.selected")?.classList.remove("selected")
      colorOptions[0].classList.add("selected")
      document.getElementById("course-color").value = "1"
  
      // Eliminar el ID del curso del botón de guardar
      delete saveButton.dataset.courseId
    }
  
    modal.style.display = "block"
  }
  
  function saveCourse() {
    const saveButton = document.getElementById("save-course")
    const courseId = saveButton.dataset.courseId
  
    const courseData = {
      id: courseId || Date.now().toString(),
      name: document.getElementById("course-name").value,
      code: document.getElementById("course-code").value,
      semester: document.getElementById("course-semester").value,
      description: document.getElementById("course-description").value,
      color: document.getElementById("course-color").value,
      enableForums: document.getElementById("enable-forums").checked,
      enableAssignments: document.getElementById("enable-assignments").checked,
      enableAttendance: document.getElementById("enable-attendance").checked,
      enableResources: document.getElementById("enable-resources").checked,
      updatedAt: new Date().toISOString(),
    }
  
    // Validar campos requeridos
    if (!courseData.name || !courseData.code) {
      alert("Por favor complete los campos obligatorios: Nombre y Código")
      return
    }
  
    const courses = JSON.parse(localStorage.getItem("courses")) || []
  
    if (courseId) {
      // Actualizar curso existente
      const index = courses.findIndex((c) => c.id === courseId)
      if (index !== -1) {
        // Mantener la fecha de creación original
        courseData.createdAt = courses[index].createdAt
        courses[index] = courseData
      }
    } else {
      // Agregar nuevo curso
      courseData.createdAt = courseData.updatedAt
      courses.push(courseData)
    }
  
    localStorage.setItem("courses", JSON.stringify(courses))
    document.getElementById("course-modal").style.display = "none"
    loadCourses()
  
    // Mostrar notificación
    showNotification(
      courseId ? "Curso actualizado" : "Curso creado",
      courseId ? "El curso ha sido actualizado correctamente." : "El curso ha sido creado correctamente.",
    )
  }
  
  function filterCourses() {
    const searchTerm = document.getElementById("course-search").value.toLowerCase()
    const courses = JSON.parse(localStorage.getItem("courses")) || []
    const filteredCourses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm) ||
        course.code.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm),
    )
  
    displayCourses(filteredCourses)
  }
  
  function deleteCourse(courseId) {
    if (confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.")) {
      const courses = JSON.parse(localStorage.getItem("courses")) || []
      const updatedCourses = courses.filter((course) => course.id !== courseId)
      localStorage.setItem("courses", JSON.stringify(updatedCourses))
  
      // Eliminar también las sesiones asociadas
      localStorage.removeItem(`sessions_${courseId}`)
  
      // Eliminar las notas asociadas
      localStorage.removeItem(`grades_${courseId}`)
  
      loadCourses()
  
      // Mostrar notificación
      showNotification("Curso eliminado", "El curso ha sido eliminado correctamente.")
    }
  }
  
  // Función para mostrar el detalle del curso y sus sesiones
  function showCourseDetails(course) {
    currentCourseId = course.id
    const viewModal = document.getElementById("view-course-modal")
    const courseTitle = document.getElementById("view-course-title")
  
    courseTitle.textContent = course.name
    document.getElementById("view-course-code").textContent = course.code
    document.getElementById("view-course-semester").textContent = course.semester
    document.getElementById("view-course-description").textContent = course.description || "Sin descripción"
  
    // Cargar sesiones del curso
    loadSessions(course.id)
  
    viewModal.style.display = "block"
  }
  
  // Función para cargar las sesiones del curso
  function loadSessions(courseId) {
    const sessionsList = document.getElementById("sessions-list")
    const sessions = JSON.parse(localStorage.getItem(`sessions_${courseId}`)) || []
  
    sessionsList.innerHTML = ""
  
    if (sessions.length === 0) {
      sessionsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clock fa-3x"></i>
          <h3>No hay sesiones registradas</h3>
          <p>Haz clic en "Nueva Sesión" para comenzar a agregar sesiones a este curso.</p>
        </div>
      `
      return
    }
  
    // Ordenar sesiones por número
    sessions.sort((a, b) => a.number - b.number)
  
    sessions.forEach((session) => {
      const sessionElement = createSessionElement(session)
      sessionsList.appendChild(sessionElement)
    })
  }
  
  // Función para crear el elemento HTML de una sesión
  function createSessionElement(session) {
    const sessionDiv = document.createElement("div")
    sessionDiv.className = "session-card"
    sessionDiv.innerHTML = `
      <div class="session-header">
        <h4>
          <span class="session-number">${session.number}</span>
          ${session.title}
        </h4>
        <span>${new Date(session.date).toLocaleDateString()}</span>
      </div>
      <div class="session-body">
        <p>${session.description || "Sin descripción"}</p>
        <p><strong><i class="fas fa-hourglass"></i> Duración:</strong> ${session.duration} horas</p>
      </div>
      ${
        session.activities && session.activities.length > 0
          ? `
        <div class="session-activities">
          <h5><i class="fas fa-tasks"></i> Actividades y Evaluaciones:</h5>
          ${session.activities
            .map(
              (activity) => `
            <div class="activity-item">
              <span>${activity.name}</span>
              <span>${activity.points} puntos</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
      <div class="session-actions">
        <button class="btn-grades" data-session-id="${session.id}">
          <i class="fas fa-clipboard-list"></i> Gestionar Notas
        </button>
        <button class="btn-edit" data-session-id="${session.id}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-delete" data-session-id="${session.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
  
    // Agregar eventos a los botones
    const gradesBtn = sessionDiv.querySelector(".btn-grades")
    const editBtn = sessionDiv.querySelector(".btn-edit")
    const deleteBtn = sessionDiv.querySelector(".btn-delete")
  
    gradesBtn.addEventListener("click", () => showSessionGradesModal(session))
    editBtn.addEventListener("click", () => showSessionModal(session))
    deleteBtn.addEventListener("click", () => deleteSession(session.id))
  
    return sessionDiv
  }
  
  function showSessionModal(sessionData = null) {
    const modal = document.getElementById("session-modal")
    const modalTitle = document.querySelector("#session-modal .modal-header h2")
    const saveButton = document.getElementById("save-session")
    const activitiesContainer = document.getElementById("activities-container")
  
    // Limpiar el contenedor de actividades
    activitiesContainer.innerHTML = ""
  
    if (sessionData) {
      modalTitle.innerHTML = '<i class="fas fa-clock"></i> Editar Sesión'
  
      // Rellenar el formulario con los datos de la sesión
      document.getElementById("session-title").value = sessionData.title
      document.getElementById("session-number").value = sessionData.number
      document.getElementById("session-date").value = sessionData.date
      document.getElementById("session-duration").value = sessionData.duration
      document.getElementById("session-description").value = sessionData.description || ""
  
      // Agregar actividades existentes
      if (sessionData.activities && sessionData.activities.length > 0) {
        sessionData.activities.forEach((activity) => {
          addActivity(activity)
        })
      }
  
      // Guardar el ID de la sesión en el botón
      saveButton.dataset.sessionId = sessionData.id
    } else {
      modalTitle.innerHTML = '<i class="fas fa-clock"></i> Nueva Sesión'
  
      // Limpiar el formulario
      document.getElementById("session-title").value = ""
      document.getElementById("session-number").value = getNextSessionNumber()
      document.getElementById("session-date").value = new Date().toISOString().split("T")[0]
      document.getElementById("session-duration").value = "2"
      document.getElementById("session-description").value = ""
  
      // Eliminar el ID de la sesión del botón
      delete saveButton.dataset.sessionId
    }
  
    modal.style.display = "block"
  }
  
  function getNextSessionNumber() {
    const sessions = JSON.parse(localStorage.getItem(`sessions_${currentCourseId}`)) || []
    if (sessions.length === 0) return 1
  
    // Encontrar el número de sesión más alto y sumar 1
    const maxNumber = Math.max(...sessions.map((s) => s.number))
    return maxNumber + 1
  }
  
  function addActivity(activityData = null) {
    const activitiesContainer = document.getElementById("activities-container")
    const activityDiv = document.createElement("div")
    activityDiv.className = "activity-form"
  
    activityDiv.innerHTML = `
      <i class="fas fa-times remove-activity"></i>
      <div class="form-group">
        <label>Nombre de la Actividad</label>
        <input type="text" class="form-control activity-name" value="${activityData ? activityData.name : ""}" required>
      </div>
      <div class="form-group">
        <label>Puntos</label>
        <input type="number" class="form-control activity-points" min="0" max="100" value="${activityData ? activityData.points : "10"}" required>
      </div>
    `
  
    activitiesContainer.appendChild(activityDiv)
  }
  
  function saveSession(event) {
    event.preventDefault()
  
    if (!currentCourseId) {
      alert("Error: No se ha seleccionado un curso")
      return
    }
  
    const saveButton = document.getElementById("save-session")
    const sessionId = saveButton.dataset.sessionId
  
    // Validar campos requeridos
    const title = document.getElementById("session-title").value
    const number = Number.parseInt(document.getElementById("session-number").value)
    const date = document.getElementById("session-date").value
  
    if (!title || !number || !date) {
      alert("Por favor complete los campos obligatorios: Título, Número y Fecha")
      return
    }
  
    // Recopilar actividades
    const activities = Array.from(document.querySelectorAll(".activity-form"))
      .map((form) => ({
        name: form.querySelector(".activity-name").value,
        points: Number.parseInt(form.querySelector(".activity-points").value, 10) || 0,
      }))
      .filter((activity) => activity.name.trim() !== "")
  
    const sessionData = {
      id: sessionId || Date.now().toString(),
      number: number,
      title: title,
      date: date,
      duration: document.getElementById("session-duration").value,
      description: document.getElementById("session-description").value,
      activities: activities,
      updatedAt: new Date().toISOString(),
    }
  
    const sessions = JSON.parse(localStorage.getItem(`sessions_${currentCourseId}`)) || []
  
    if (sessionId) {
      // Actualizar sesión existente
      const index = sessions.findIndex((s) => s.id === sessionId)
      if (index !== -1) {
        // Mantener la fecha de creación original
        sessionData.createdAt = sessions[index].createdAt
        sessions[index] = sessionData
      }
    } else {
      // Agregar nueva sesión
      sessionData.createdAt = sessionData.updatedAt
      sessions.push(sessionData)
    }
  
    localStorage.setItem(`sessions_${currentCourseId}`, JSON.stringify(sessions))
    document.getElementById("session-modal").style.display = "none"
  
    // Recargar las sesiones
    loadSessions(currentCourseId)
  
    // Mostrar notificación
    showNotification(
      sessionId ? "Sesión actualizada" : "Sesión creada",
      sessionId ? "La sesión ha sido actualizada correctamente." : "La sesión ha sido creada correctamente.",
    )
  }
  
  function deleteSession(sessionId) {
    if (confirm("¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.")) {
      const sessions = JSON.parse(localStorage.getItem(`sessions_${currentCourseId}`)) || []
      const updatedSessions = sessions.filter((session) => session.id !== sessionId)
      localStorage.setItem(`sessions_${currentCourseId}`, JSON.stringify(updatedSessions))
  
      // Eliminar las notas asociadas a esta sesión
      localStorage.removeItem(`grades_${currentCourseId}_${sessionId}`)
  
      // Recargar las sesiones
      loadSessions(currentCourseId)
  
      // Mostrar notificación
      showNotification("Sesión eliminada", "La sesión ha sido eliminada correctamente.")
    }
  }
  
  function showSessionGradesModal(session) {
    currentSessionId = session.id
  
    const modal = document.getElementById("session-grades-modal")
    const modalTitle = document.getElementById("session-grades-title")
  
    // Obtener información del curso
    const courses = JSON.parse(localStorage.getItem("courses")) || []
    const course = courses.find((c) => c.id === currentCourseId)
  
    if (!course) {
      alert("Error: No se pudo encontrar el curso")
      return
    }
  
    modalTitle.textContent = `Notas - ${session.title}`
    document.getElementById("session-grades-course").textContent = course.name
    document.getElementById("session-grades-session").textContent = `Sesión ${session.number}: ${session.title}`
    document.getElementById("session-grades-date").textContent = new Date(session.date).toLocaleDateString()
  
    // Cargar estudiantes y sus notas
    loadStudentsForGrades()
  
    // Mostrar el modal
    modal.style.display = "block"
  }
  
  function loadStudentsForGrades() {
    const students = JSON.parse(localStorage.getItem("students")) || []
    const gradesTableBody = document.getElementById("session-grades-body")
    const gradeFilter = document.getElementById("grades-grade-filter")
    const sectionFilter = document.getElementById("grades-section-filter")
  
    // Limpiar tabla
    gradesTableBody.innerHTML = ""
  
    // Limpiar y llenar filtros
    populateGradeAndSectionFilters(students, gradeFilter, sectionFilter)
  
    // Cargar notas existentes
    const sessionGrades = JSON.parse(localStorage.getItem(`grades_${currentCourseId}_${currentSessionId}`)) || {}
  
    if (students.length === 0) {
      gradesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay estudiantes registrados en el sistema.</td>
        </tr>
      `
      return
    }
  
    // Ordenar estudiantes por apellido
    students.sort((a, b) => a.apellido.localeCompare(b.apellido))
  
    students.forEach((student) => {
      const row = document.createElement("tr")
      const studentId = student.dni
      const grade = sessionGrades[studentId] || { value: "", observations: "" }
  
      row.innerHTML = `
        <td>${student.apellido}</td>
        <td>${student.nombre}</td>
        <td>${student.grado}</td>
        <td>${student.seccion}</td>
        <td>
          <input type="number" min="0" max="20" step="1" value="${grade.value}" 
                 class="grade-input" data-student-id="${studentId}">
        </td>
        <td>
          <input type="text" value="${grade.observations || ""}" 
                 class="observation-input" data-student-id="${studentId}">
        </td>
      `
  
      gradesTableBody.appendChild(row)
    })
  
    // Agregar eventos a los filtros
    gradeFilter.addEventListener("change", filterGradesTable)
    sectionFilter.addEventListener("change", filterGradesTable)
  }
  
  function populateGradeAndSectionFilters(students, gradeFilter, sectionFilter) {
    // Obtener grados y secciones únicos
    const grades = [...new Set(students.map((s) => s.grado))].filter(Boolean).sort()
    const sections = [...new Set(students.map((s) => s.seccion))].filter(Boolean).sort()
  
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
  }
  
  function filterGradesTable() {
    const gradeFilter = document.getElementById("grades-grade-filter").value
    const sectionFilter = document.getElementById("grades-section-filter").value
    const rows = document.querySelectorAll("#session-grades-body tr")
  
    rows.forEach((row) => {
      const studentGrade = row.cells[2].textContent
      const studentSection = row.cells[3].textContent
  
      const matchesGrade = !gradeFilter || studentGrade === gradeFilter
      const matchesSection = !sectionFilter || studentSection === sectionFilter
  
      row.style.display = matchesGrade && matchesSection ? "" : "none"
    })
  }
  
  function saveSessionGrades() {
    const gradeInputs = document.querySelectorAll(".grade-input")
    const observationInputs = document.querySelectorAll(".observation-input")
  
    const grades = {}
  
    // Recopilar notas y observaciones
    gradeInputs.forEach((input) => {
      const studentId = input.dataset.studentId
      const value = input.value.trim()
  
      if (value !== "") {
        if (!grades[studentId]) {
          grades[studentId] = {}
        }
        grades[studentId].value = value
      }
    })
  
    observationInputs.forEach((input) => {
      const studentId = input.dataset.studentId
      const observations = input.value.trim()
  
      if (observations !== "" || grades[studentId]) {
        if (!grades[studentId]) {
          grades[studentId] = {}
        }
        grades[studentId].observations = observations
      }
    })
  
    // Guardar en localStorage
    localStorage.setItem(`grades_${currentCourseId}_${currentSessionId}`, JSON.stringify(grades))
  
    // Cerrar modal
    document.getElementById("session-grades-modal").style.display = "none"
  
    // Mostrar notificación
    showNotification("Notas guardadas", "Las notas han sido guardadas correctamente.")
  }
  
  function exportSessionGrades() {
    const students = JSON.parse(localStorage.getItem("students")) || []
    const sessionGrades = JSON.parse(localStorage.getItem(`grades_${currentCourseId}_${currentSessionId}`)) || {}
  
    // Obtener información del curso y sesión
    const courses = JSON.parse(localStorage.getItem("courses")) || []
    const course = courses.find((c) => c.id === currentCourseId)
  
    const sessions = JSON.parse(localStorage.getItem(`sessions_${currentCourseId}`)) || []
    const session = sessions.find((s) => s.id === currentSessionId)
  
    if (!course || !session) {
      alert("Error: No se pudo encontrar la información del curso o sesión")
      return
    }
  
    // Preparar datos para Excel
    const data = [
      [`Notas - ${course.name} - ${session.title}`],
      [`Fecha: ${new Date(session.date).toLocaleDateString()}`],
      [],
      ["Apellidos", "Nombres", "Grado", "Sección", "Nota", "Observaciones"],
    ]
  
    // Ordenar estudiantes por apellido
    students.sort((a, b) => a.apellido.localeCompare(b.apellido))
  
    // Agregar filas de estudiantes
    students.forEach((student) => {
      const studentId = student.dni
      const grade = sessionGrades[studentId] || { value: "", observations: "" }
  
      data.push([student.apellido, student.nombre, student.grado, student.seccion, grade.value, grade.observations || ""])
    })
  
    // Crear libro de Excel
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
  
    // Agregar estilos (ancho de columnas)
    ws["!cols"] = [
      { wch: 20 }, // Apellidos
      { wch: 20 }, // Nombres
      { wch: 10 }, // Grado
      { wch: 10 }, // Sección
      { wch: 10 }, // Nota
      { wch: 30 }, // Observaciones
    ]
  
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Notas")
  
    // Generar archivo y descargar
    const fileName = `Notas_${course.name}_${session.title}.xlsx`
    XLSX.writeFile(wb, fileName)
  
    // Mostrar notificación
    showNotification("Exportación completada", "Las notas han sido exportadas correctamente.")
  }
  
  // Funciones auxiliares
  function getSessionsCount(courseId) {
    const sessions = JSON.parse(localStorage.getItem(`sessions_${courseId}`)) || []
    return sessions.length
  }
  
  function getStudentsCount(courseId) {
    // Aquí podríamos filtrar por estudiantes asignados al curso
    // Por ahora, simplemente devolvemos el total de estudiantes
    const students = JSON.parse(localStorage.getItem("students")) || []
    return students.length
  }
  
  // Función para mostrar notificaciones
  function showNotification(title, message) {
    // Crear elemento de notificación
    const notification = document.createElement("div")
    notification.className = "notification success"
  
    // Contenido de la notificación
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-check-circle"></i>
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
  
    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }
  
  