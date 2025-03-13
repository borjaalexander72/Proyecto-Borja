class Auth {
    constructor() {
      this.checkAuth()
      this.initializeUsers()
      // Mostrar usuarios en consola para depuración
      console.log("Usuarios disponibles:", JSON.parse(localStorage.getItem("users") || "[]"))
    }
  
    initializeUsers() {
      // Si no existen usuarios, crear los predeterminados
      if (!localStorage.getItem("users")) {
        const defaultUsers = [
          {
            username: "admin",
            password: "borjadmin123",
            fullName: "",
            dni: "",
            specialty: "",
            academicDegree: "Docente",
          },
          {
            username: "alesstapia@bm.com",
            password: "pruebaaless",
            fullName: "",
            dni: "",
            specialty: "",
            academicDegree: "Docente",
          },
          {
            username: "samuelleal@bm.com",
            password: "lealprueba12",
            fullName: "",
            dni: "",
            specialty: "",
            academicDegree: "Docente",
          },
          {
            username: "kattyvel@bm.com",
            password: "katprueba104",
            fullName: "",
            dni: "",
            specialty: "",
            academicDegree: "Docente",
          },
          {
            username: "davidespinoza@bm.com",
            password: "prueba12david",
            fullName: "",
            dni: "",
            specialty: "",
            academicDegree: "Docente",
          },
        ]
        localStorage.setItem("users", JSON.stringify(defaultUsers))
        console.log("Usuarios predeterminados inicializados:", defaultUsers)
      }
  
      // Forzar la reinicialización de usuarios para asegurar que estén correctos
      // Esto es solo para depuración y se puede quitar después
      const defaultUsers = [
        {
          username: "admin",
          password: "borjadmin123",
          fullName: "",
          dni: "",
          specialty: "",
          academicDegree: "Docente",
        },
        {
          username: "alesstapia@bm.com",
          password: "pruebaaless",
          fullName: "",
          dni: "",
          specialty: "",
          academicDegree: "Docente",
        },
        {
          username: "samuelleal@bm.com",
          password: "lealprueba12",
          fullName: "",
          dni: "",
          specialty: "",
          academicDegree: "Docente",
        },
        {
          username: "kattyvel@bm.com",
          password: "katprueba104",
          fullName: "",
          dni: "",
          specialty: "",
          academicDegree: "Docente",
        },
        {
          username: "davidespinoza@bm.com",
          password: "prueba12david",
          fullName: "",
          dni: "",
          specialty: "",
          academicDegree: "Docente",
        },
      ]
      localStorage.setItem("users", JSON.stringify(defaultUsers))
    }
  
    checkAuth() {
      // Si estamos en la página de login, no redirigir
      if (window.location.pathname.includes("index.html")) {
        return true
      }
  
      const isLoggedIn = localStorage.getItem("isLoggedIn")
  
      if (!isLoggedIn) {
        this.logout()
        return false
      }
  
      return true
    }
  
    logout() {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("currentUser")
      localStorage.removeItem("teacherData")
      window.location.href = "index.html"
    }
  
    login(username, password, dni) {
      // Obtener usuarios del localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []
      console.log("Usuarios disponibles para login:", users)
      console.log("Intentando login con:", { username, password })
  
      // Verificar si existe un usuario con el nombre de usuario y contraseña proporcionados
      const user = users.find((u) => u.username === username && u.password === password)
  
      if (user) {
        console.log("Usuario encontrado:", user)
  
        // Actualizar datos del usuario con la información del formulario si se proporciona
        if (document.getElementById("fullName")) {
          user.fullName = document.getElementById("fullName").value.trim() || user.fullName
        }
  
        if (document.getElementById("specialty")) {
          user.specialty = document.getElementById("specialty").value || user.specialty
        }
  
        if (dni) {
          user.dni = dni
        }
  
        // Actualizar el array de usuarios en localStorage
        const updatedUsers = users.map((u) => (u.username === username ? user : u))
        localStorage.setItem("users", JSON.stringify(updatedUsers))
  
        // Guardar estado de login
        localStorage.setItem("isLoggedIn", "true")
  
        // Guardar datos del perfil del usuario actual
        const teacherData = {
          fullName: user.fullName || "",
          dni: user.dni || "",
          specialty: user.specialty || "",
          academicDegree: user.academicDegree,
        }
  
        localStorage.setItem("teacherData", JSON.stringify(teacherData))
        localStorage.setItem("currentUser", user.username)
  
        // Redirigir al dashboard
        window.location.href = "dashboard.html"
        return true
      } else {
        console.log("Usuario no encontrado")
        return false
      }
    }
  }
  
  // Inicializar autenticación
  const auth = new Auth()
  
  // Event listeners
  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm")
    const logoutBtn = document.getElementById("logout-btn")
  
    if (loginForm) {
      // Validación en tiempo real para el DNI
      const dniInput = document.getElementById("dni")
      if (dniInput) {
        dniInput.addEventListener("input", function (e) {
          this.value = this.value.replace(/[^0-9]/g, "").slice(0, 8)
        })
      }
  
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value.trim()
        const password = document.getElementById("password").value.trim()
        const dni = document.getElementById("dni")?.value.trim() || ""
  
        console.log("Formulario enviado con:", { username, password, dni })
  
        // Validar DNI solo si tiene algún valor
        if (dni && !/^\d{8}$/.test(dni)) {
          alert("El DNI debe contener 8 dígitos numéricos")
          return
        }
  
        if (!auth.login(username, password, dni)) {
          alert("Usuario o contraseña incorrectos")
        }
      })
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => auth.logout())
    }
  })
  
  