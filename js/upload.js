document.addEventListener('DOMContentLoaded', function() {
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const uploadArea = document.getElementById('upload-area');
    const fileList = document.getElementById('file-list');
    const processFilesBtn = document.getElementById('process-files-btn');
    const sessionForm = document.getElementById('session-form');
    const sessionContent = document.getElementById('session-content');
    let uploadedFiles = [];

    uploadContainer.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileUpload);

    uploadContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadContainer.classList.add('dragover');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('dragover');
    });

    uploadContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadContainer.classList.remove('dragover');
        const files = event.dataTransfer.files;
        handleFileUpload({ target: { files } });
    });

    function handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            for (let file of files) {
                uploadedFiles.push(file);
                const listItem = document.createElement('li');
                listItem.textContent = file.name;
                fileList.appendChild(listItem);
            }
        }
    }

    processFilesBtn.addEventListener('click', () => {
        if (uploadedFiles.length > 0) {
            // Aquí puedes agregar el código para procesar los archivos y subirlos al servidor
            console.log('Archivos a procesar:', uploadedFiles);
            alert('Archivos procesados exitosamente.');
        } else {
            alert('No hay archivos para procesar.');
        }
    });

    const inputs = document.querySelectorAll('#session-form input, #session-form select');
    inputs.forEach(input => {
        input.addEventListener('change', async function() {
            const title = document.getElementById('session-title').value;
            const topic = document.getElementById('session-topic').value;
            const date = document.getElementById('session-date').value;
            const competencies = document.getElementById('session-competencies').value;
            const capacities = document.getElementById('session-capacities').value;

            if (title && topic && date && competencies && capacities) {
                const sessionTemplate = await generateSessionTemplate(title, topic, date, competencies, capacities);
                sessionContent.innerHTML = sessionTemplate;
            }
        });
    });

    async function generateSessionTemplate(title, topic, date, competencies, capacities) {
        const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer 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`
            },
            body: JSON.stringify({
                prompt: `Generate a detailed class session plan based on the following information:\n\nTitle: ${title}\nTopic: ${topic}\nDate: ${date}\nCompetencies: ${competencies}\nCapacities: ${capacities}\n\nThe session should include an introduction, development, and closure.`,
                max_tokens: 500
            })
        });

        const data = await response.json();
        return data.choices[0].text;
    }
});
