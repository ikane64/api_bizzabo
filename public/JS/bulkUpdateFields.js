async function bulkUpdateFields(event) {
    event.preventDefault();

    try {

        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const apiKey = document.getElementById('apiKey').value;
        const regField = document.getElementById('regField').value;
        const fieldValue = document.getElementById('fieldValue').value;
        const ticketListInput = document.getElementById('ticketListInput').value;

        const response = await fetch('/fieldUpdate', {
            method: 'POST',
            body: JSON.stringify({
                apiKey,
                regField,
                fieldValue,
                ticketListInput
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear previous results

        const statusDiv = document.createElement('div');
        statusDiv.style.minWidth = '300px'; 
        statusDiv.style.minHeight = '100px';
        statusDiv.style.maxHeight = '600px';
        statusDiv.style.overflowY = 'auto';
        statusDiv.style.paddingLeft = '10px';
        statusDiv.style.borderLeft = '1px solid #ccc'; 

        if (data.statusList) {
            // Append each status to the div on a new line with color based on response status
            data.statusList.forEach(status => {
                const [ticket, statusCode, statusText] = status.split(': ');
                const statusLine = document.createElement('div');
                statusLine.textContent = status;
                statusLine.style.color = statusCode === '200 OK' ? 'green' : 'red'; // Change text color based on response status code
                statusDiv.appendChild(statusLine);
            });
        } else {
            // If there are no statusList, display a message indicating no registrations were processed
            statusDiv.textContent = data.error || 'No status list available.';
        }

        resultDiv.appendChild(statusDiv);


        submitButton.disabled = false;
        submitButton.textContent = 'Update field';

    } catch (error) {
        console.error('Error processing registrations:', error);
        document.getElementById('result').textContent = 'An error occurred while processing registrations.';
    }
}