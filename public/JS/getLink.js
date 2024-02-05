document.getElementById('magicLinkForm').addEventListener('submit', function(event) {

    event.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const registrationId = document.getElementById('registrationId').value;

    fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey,
                registrationId
            })
        })
        .then(response => response.text())
        .then(data => {
            try {
                const jsonData = JSON.parse(data);

                document.getElementById('linkButtons').style.display = 'none';
                document.getElementById('magicLinkLabel').style.display = 'none';
                document.getElementById('magicLink').style.display = 'block';
                var outputField = document.getElementById('magicLink');
                outputField.value = data;
        
                // Add event listener for the resize event on the window
                window.addEventListener('resize', function() {
                    outputField.style.height = 'auto'; // Reset the height to auto to recalculate
                    outputField.style.height = outputField.scrollHeight + 'px'; // Set the height to the scrollHeight
                });
            } catch (error) {
                document.getElementById('magicLink').style.display = 'block';
                document.getElementById('linkButtons').style.display = 'block';
                document.getElementById('magicLinkLabel').style.display = 'block';
        
                var outputField = document.getElementById('magicLink');
                outputField.value = data;
        
                // Add event listener for the resize event on the window
                window.addEventListener('resize', function() {
                    outputField.style.height = 'auto'; // Reset the height to auto to recalculate
                    outputField.style.height = outputField.scrollHeight + 'px'; // Set the height to the scrollHeight
                });
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
        });
});