document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('activity-modal');
    const closeModal = document.querySelector('.close');
    const saveActivityBtn = document.getElementById('save-activity-btn');
    const deleteActivityBtn = document.getElementById('delete-activity-btn');
    const calendar = document.getElementById('calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Función para inicializar el calendario
    function initializeCalendar() {
        // Recuperar el estado guardado o usar valores por defecto
        const savedState = JSON.parse(localStorage.getItem('calendarState')) || {
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            activities: []
        };

        currentMonth = parseInt(savedState.month);
        currentYear = parseInt(savedState.year);
        activities = savedState.activities;

        renderCalendar();
    }

    // Función para guardar el estado completo del calendario
    function saveCalendarState() {
        const calendarState = {
            month: currentMonth,
            year: currentYear,
            activities: activities
        };
        localStorage.setItem('calendarState', JSON.stringify(calendarState));
    }

    function renderCalendar() {
        const monthName = document.getElementById('month-name');
        const currentDate = new Date(currentYear, currentMonth);

        // Asegurarse de que el contenedor del calendario existe
        if (!calendar) {
            console.error('El contenedor del calendario no existe');
            return;
        }

        monthName.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        calendar.innerHTML = '';

        // Crear encabezados de días de la semana
        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Agregar celdas vacías para los días antes del primer día del mes
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day', 'empty');
            calendar.appendChild(emptyCell);
        }

        // Crear las celdas de los días
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = dateStr;
            
            // Agregar el número del día
            const dayNumber = document.createElement('span');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            // Marcar el día actual
            const today = new Date();
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayCell.classList.add('today');
            }

            // Agregar actividades del día
            const dayActivities = activities.filter(activity => activity.date === dateStr);
            dayActivities.forEach(activity => {
                const activityElement = document.createElement('div');
                activityElement.classList.add('activity', `priority-${activity.priority}`);
                activityElement.textContent = activity.title;
                dayCell.appendChild(activityElement);
            });

            dayCell.addEventListener('click', () => openModal(dateStr, dayCell));
            calendar.appendChild(dayCell);
        }

        saveCalendarState();
    }

    function renderActivities() {
        calendar.querySelectorAll('.day').forEach(day => {
            const dayDate = day.dataset.date;
            const dayActivities = activities.filter(activity => activity.date === dayDate);
            day.innerHTML = ''; 
            day.textContent = dayDate.split('-')[2]; 
            dayActivities.forEach(activity => {
                const activityElement = document.createElement('div');
                activityElement.classList.add('activity');
                activityElement.textContent = activity.title;
                day.appendChild(activityElement);
            });
        });
    }

    function openModal(date, dayCell) {
        modal.style.display = 'block';
        document.getElementById('activity-date').value = date;
        document.getElementById('activity-title').value = '';
        document.getElementById('activity-description').value = '';
        document.getElementById('activity-category').value = 'tarea';
        document.getElementById('activity-priority').value = 'media';
        deleteActivityBtn.style.display = 'none';
        // Actualizar el botón de guardar para que guarde la actividad en el día correcto
        saveActivityBtn.dataset.dayCell = dayCell;
        // Buscar si hay una actividad existente para esa fecha
        const existingActivity = activities.find(activity => activity.date === date);
        if (existingActivity) {
            // Si hay una actividad, rellenar el formulario con los datos de la actividad
            document.getElementById('activity-title').value = existingActivity.title;
            document.getElementById('activity-description').value = existingActivity.description;
            document.getElementById('activity-category').value = existingActivity.category;
            document.getElementById('activity-priority').value = existingActivity.priority;
            // Mostrar el botón de eliminar
            deleteActivityBtn.style.display = 'block';
            // Actualizar el botón de eliminar con la fecha de la actividad
            deleteActivityBtn.dataset.date = date;
        }
    }

    function closeModalFunc() {
        modal.style.display = 'none';
    }

    function saveActivity() {
        const date = document.getElementById('activity-date').value;
        const title = document.getElementById('activity-title').value;
        const description = document.getElementById('activity-description').value;
        const category = document.getElementById('activity-category').value;
        const priority = document.getElementById('activity-priority').value;

        if (title.trim() === "") {
            alert("El título de la actividad no puede estar vacío.");
            return;
        }

        const newActivity = { date, title, description, category, priority };
        // Encontrar el índice de la actividad existente
        const existingActivityIndex = activities.findIndex(activity => activity.date === date);
        if (existingActivityIndex !== -1) {
            // Si existe una actividad, reemplazarla con la nueva
            activities[existingActivityIndex] = newActivity;
        } else {
            // Si no existe una actividad, agregarla
            activities.push(newActivity);
        }
        // Guardar las actividades en el localStorage
        localStorage.setItem('activities', JSON.stringify(activities));

        renderActivities();
        closeModalFunc();
    }

    function deleteActivity() {
        const date = deleteActivityBtn.dataset.date;
        activities = activities.filter(activity => activity.date !== date);
        localStorage.setItem('activities', JSON.stringify(activities));
        // Actualizar el calendario
        renderCalendar();
        closeModalFunc();
    }

    // Eventos para los botones de cambio de mes
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    closeModal.addEventListener('click', closeModalFunc);
    saveActivityBtn.addEventListener('click', saveActivity);
    deleteActivityBtn.addEventListener('click', deleteActivity);

    // Inicializar el calendario
    initializeCalendar();
});

// Asegurarse de que el calendario se mantenga actualizado
window.addEventListener('beforeunload', function() {
    saveCalendarState();
});
