document.addEventListener('DOMContentLoaded', function() {
    const sessionForm = document.getElementById('session-form');
    const sessionContent = document.getElementById('session-content');
    const aiService = new AIService();
    const TIMEOUT_SECONDS = 60;

    sessionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        sessionContent.innerHTML = '<div class="loading">Generando sesión... <span class="timeout-counter">60</span>s</div>';
        
        try {
            const sessionData = {
                title: document.getElementById('session-title').value,
                topic: document.getElementById('session-topic').value,
                date: document.getElementById('session-date').value,
                duration: parseInt(document.getElementById('session-duration').value),
                competencies: document.getElementById('session-competencies').value,
                capacities: document.getElementById('session-capacities').value,
                materials: document.getElementById('session-materials').value,
                evaluation: document.getElementById('session-evaluation').value,
                specificInstructions: document.getElementById('session-specific-instructions').value
            };

            // Crear promesa con timeout y manejo detallado de errores
            const timeoutPromise = new Promise((_, reject) => {
                const countdown = setInterval(() => {
                    const counterElement = document.querySelector('.timeout-counter');
                    if (counterElement) {
                        const currentTime = parseInt(counterElement.textContent);
                        if (currentTime > 0) {
                            counterElement.textContent = currentTime - 1;
                        }
                    }
                }, 1000);

                setTimeout(() => {
                    clearInterval(countdown);
                    reject(new Error('Tiempo de espera agotado'));
                }, TIMEOUT_SECONDS * 1000);
            });

            console.log('Enviando solicitud a la API...'); // Debug
            const aiGeneratedContent = await Promise.race([
                aiService.generateSessionContent(sessionData),
                timeoutPromise
            ]);
            
            if (!aiGeneratedContent) {
                throw new Error('No se recibió respuesta de la API');
            }

            const formattedContent = formatSessionContent(sessionData, aiGeneratedContent);
            sessionContent.innerHTML = formattedContent;
            
        } catch (error) {
            console.error('Error detallado:', error); // Debug

            let errorMessage;
            if (error.message === 'Tiempo de espera agotado') {
                errorMessage = 'El servidor está demorando demasiado en responder. Por favor, intenta nuevamente.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.';
            } else if (error.response) {
                errorMessage = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
            } else {
                errorMessage = `Error al generar la sesión: ${error.message}`;
            }

            sessionContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    ${errorMessage}
                </div>
            `;
        }
    });
});

function formatSessionContent(sessionData, aiContent) {
    const sections = extractSections(aiContent);

    return `
        <div class="generated-session">
            <div class="session-header">
                <h3>${sessionData.title}</h3>
                <div class="session-meta">
                    <div class="meta-item">
                        <span class="meta-label">Fecha:</span>
                        <span class="meta-value">${sessionData.date}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Duración:</span>
                        <span class="meta-value">${sessionData.duration} horas</span>
                    </div>
                </div>
            </div>

            <div class="session-development">
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-badge inicio">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="timeline-content">
                            <h5>Inicio (${Math.round(sessionData.duration * 0.2 * 60)} minutos)</h5>
                            <div class="content-box inicio">
                                <ul>
                                    ${sections.inicio || 'No se encontró contenido para la sección de inicio'}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-badge desarrollo">
                            <i class="fas fa-sync"></i>
                        </div>
                        <div class="timeline-content">
                            <h5>Desarrollo (${Math.round(sessionData.duration * 0.6 * 60)} minutos)</h5>
                            <div class="content-box desarrollo">
                                <ul>
                                    ${sections.desarrollo || 'No se encontró contenido para la sección de desarrollo'}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-badge cierre">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <div class="timeline-content">
                            <h5>Cierre (${Math.round(sessionData.duration * 0.2 * 60)} minutos)</h5>
                            <div class="content-box cierre">
                                <ul>
                                    ${sections.cierre || 'No se encontró contenido para la sección de cierre'}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function extractSections(content) {
    const sections = {
        title: '',
        inicio: '',
        desarrollo: '',
        cierre: ''
    };

    try {
        // Extraer contenido entre INICIO, DESARROLLO y CIERRE
        const inicioMatch = content.match(/INICIO[^]*?(?=DESARROLLO|$)/i);
        const desarrolloMatch = content.match(/DESARROLLO[^]*?(?=CIERRE|$)/i);
        const cierreMatch = content.match(/CIERRE[^]*?(?=$)/i);

        // Procesar sección de inicio
        if (inicioMatch) {
            sections.inicio = inicioMatch[0]
                .replace(/INICIO.*?\):/i, '') // Remover "INICIO (X minutos):"
                .trim();
        }

        // Procesar sección de desarrollo
        if (desarrolloMatch) {
            sections.desarrollo = desarrolloMatch[0]
                .replace(/DESARROLLO.*?\):/i, '') // Remover "DESARROLLO (X minutos):"
                .trim();
        }

        // Procesar sección de cierre
        if (cierreMatch) {
            sections.cierre = cierreMatch[0]
                .replace(/CIERRE.*?\):/i, '') // Remover "CIERRE (X minutos):"
                .trim();
        }

        // Limpiar y formatear cada sección
        sections.inicio = formatSection(sections.inicio);
        sections.desarrollo = formatSection(sections.desarrollo);
        sections.cierre = formatSection(sections.cierre);

    } catch (error) {
        console.error('Error procesando secciones:', error);
    }

    return sections;
}

function formatSection(content) {
    if (!content) return '';

    // Limpiar el contenido
    let cleanContent = content
        .replace(/^\s*\d+\.\s*/gm, '') // Remover números de lista
        .replace(/^\s*-\s*/gm, '') // Remover guiones
        .replace(/\*\*/g, '') // Remover markdown de negrita
        .trim();

    // Convertir el contenido en lista HTML
    const lines = cleanContent.split('\n').filter(line => line.trim());
    return lines.map(line => `<li>${line.trim()}</li>`).join('\n');
}

function processSectionContent(content) {
    if (!content) return '';
    
    // Limpiar el contenido
    let cleanContent = content
        .trim()
        .replace(/^\s*\([^)]+\):/gm, '') // Remover marcadores de tiempo
        .replace(/\*\*/g, '')            // Remover marcadores de negrita
        .replace(/#{1,6}\s?/g, '')       // Remover encabezados markdown
        .replace(/^\s*-\s*/gm, '• ');    // Convertir guiones a bullets

    // Si hay lista de items, convertirlos a HTML
    if (cleanContent.includes('• ')) {
        const items = cleanContent.split('• ').filter(item => item.trim());
        cleanContent = '<ul>' + 
            items.map(item => `<li>${item.trim()}</li>`).join('') + 
            '</ul>';
    }

    return cleanContent;
}