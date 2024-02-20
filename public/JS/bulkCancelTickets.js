// Function to handle cancellation request
const cancelOperation = async () => {
    try {
        const response = await fetch('/cancel-bulk-cancelation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Failed to cancel operation:', error);
        // Handle error (e.g., display an error message)
    }
};

// Event listener for cancel button
document.getElementById('cancelButton').addEventListener('click', async () => {
    await cancelOperation();
});

// Modify the bulkCancelTickets function to include cancellation logic
async function bulkCancelTickets(event) {
    event.preventDefault();

    const submitButton = document.querySelector('button[type="submit"]');
    const cancelButton = document.getElementById('cancelButton');
        
    // Replace submit button with cancel button
    cancelButton.style.display = 'block';
    submitButton.style.display = 'none';

    try {
        const submitButton = document.querySelector('button[type="submit"]');
        const cancelButton = document.getElementById('cancelButton');
        
        // Replace submit button with cancel button
        cancelButton.style.display = 'block';
        submitButton.style.display = 'none';

        const clientId = document.getElementById('clientId').value;
        const clientSecret = document.getElementById('clientSecret').value;
        const accountId = document.getElementById('accountId').value;
        const eventId = document.getElementById('eventId').value;
        const refundAmount = document.getElementById('refundAmount').value;
        const sendEmail = document.getElementById('sendEmail').value;
        const ticketListInput = document.getElementById('ticketListInput').value;

        const response = await fetch('/bulkCancel', {
            method: 'POST',
            body: JSON.stringify({
                clientId,
                clientSecret,
                accountId,
                eventId,
                refundAmount,
                sendEmail,
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

        if (data.responses && data.responses.length > 0) {
            // Append each status to the div on a new line with color based on response status
            data.responses.forEach(responseData => {
                const { ticketId, status, message } = responseData;
                const statusLine = document.createElement('div');
                if (message === "The parameter orderId must be of type java.lang.Long") {
                    const fixedMessage = "The ticket ID value is not correct";
                    statusLine.textContent = `Ticket ${ticketId}: ${fixedMessage}`;
                } else {
                    statusLine.textContent = `Ticket ${ticketId}: ${message}`;
                }
                statusLine.style.color = status === 200 ? 'green' : 'red'; // Change text color based on response status code
                statusDiv.appendChild(statusLine);
            });
        } else {
            // If there are no statusList, display a message indicating no registrations were processed
            statusDiv.textContent = data.error || 'No status list available.';
        }

        resultDiv.appendChild(statusDiv);

        cancelButton.style.display = 'none';
        submitButton.style.display = 'block';

    } catch (error) {
        console.error('Error processing the request:', error);
        document.getElementById('result').textContent = 'An error occurred during the cancelation process.';
    }
}
