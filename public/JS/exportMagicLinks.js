async function exportMagicLinks() {
    try {

        // Disable the submit button to prevent multiple clicks
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const apiKey = document.getElementById('apiKey').value;
        const eventId = document.getElementById('eventId').value;

        const response = await fetch('/linkExport', {
            method: 'POST',
            body: JSON.stringify({
                apiKey,
                eventId
            }), // Use the extracted values from the form
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const resultDiv = document.getElementById('result');
        let fileLinkLabel = document.getElementById('fileLink');

        if (!fileLinkLabel) {
            // If the fileLink label element doesn't exist, create one
            fileLinkLabel = document.createElement('label');
            fileLinkLabel.setAttribute('class', 'form-control output');
            fileLinkLabel.setAttribute('id', 'fileLink');
            fileLinkLabel.setAttribute('name', 'fileLink');
            resultDiv.appendChild(fileLinkLabel);
        }

        if (data.fileLink) {
            // If the file link is available, update the label element with the link
            fileLinkLabel.innerHTML = `Link export was successful. Download the file <a href="${data.fileLink}">here</a>.`;
        } else {
            // If there is no file link, display a message indicating no registrations were processed
            fileLinkLabel.textContent = data.message;
        }

        submitButton.disabled = false;
        submitButton.textContent = 'Export Links';
    } catch (error) {
        console.error('Error processing registrations:', error);
        document.getElementById('result').textContent = 'An error occurred while processing registrations.';
    }
}