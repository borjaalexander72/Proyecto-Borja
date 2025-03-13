class AIService {
    constructor() {
        this.apiKey = 'AIzaSyB_rJSo9weiZC0wyCOGe8l33TFpEXXcrfE';
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    async generateSessionContent(sessionData) {
        try {
            console.log('Iniciando solicitud a Gemini...'); // Debug

            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: this.createPrompt(sessionData)
                        }]
                    }]
                })
            });

            console.log('Respuesta recibida:', response.status); // Debug

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error API ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error en generateSessionContent:', error); // Debug
            throw error;
        }
    }

    createPrompt(sessionData) {
        return `
        Como experto en educación, genera una sesión de clase detallada con la siguiente información:
        
        Título: ${sessionData.title}
        Tema: ${sessionData.topic}
        Duración: ${sessionData.duration} horas
        Competencias: ${sessionData.competencies}
        Capacidades: ${sessionData.capacities}
        Materiales: ${sessionData.materials}
        
        Instrucciones específicas del docente:
        ${sessionData.specificInstructions}
        
        Por favor, genera una sesión de clase con una redacción formal, siguiendo ESTRICTAMENTE este formato: (Obligatoriamente debes comenzar en mayusculas el contenido que quieres decir. Por ejemplo: "INICIO: .....; DESARROLLO: ....; CIERRE: ....")

        INICIO (${Math.round(sessionData.duration * 0.2 * 60)} minutos):
        1. Saludo y motivación: El docente da la bienvenida y presenta el propósito de la sesión.
        2. Exploración de saberes previos: Una pregunta o actividad breve para conectar con el tema.

        DESARROLLO (${Math.round(sessionData.duration * 0.6 * 60)} minutos):
        - Desarrollo detallado de las actividades de aprendizaje
        - Trabajo individual o grupal
        - Análisis y discusión
        - Retroalimentación del docente

        CIERRE (${Math.round(sessionData.duration * 0.2 * 60)} minutos):
        1. Reflexión sobre lo aprendido
        2. Metacognición
        3. Evaluación del aprendizaje

        IMPORTANTE:
        - En el INICIO solo incluir dos puntos: saludo/motivación y exploración de saberes previos
        - No repetir el saludo del docente en el desarrollo
        - Mantener una estructura clara y ordenada
        - Usar lenguaje en tercera persona
        - Evitar el uso de abreviaturas
        - Dar una dinámica clara y detallada o juego para que los estudiantes no se aburran y se mantengan atentos
        - Que la dinámica sea divertida y educativa
        - Que la dinámica sea acorde a la edad de los estudiantes
        - Que la dinámica sea acorde al tema de la sesión
        - Que la dinámica sea acorde a la duración de la sesión
        - Que la dinámica sea acorde a los materiales disponibles
        `;
    }
}