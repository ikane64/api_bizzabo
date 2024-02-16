const axios = require('axios');

const updateField = async (req, res) => {
    const {
        apiKey,
        regField,
        fieldValue,
        ticketListInput
    } = req.body;
    const ticketList = formatTicketList(ticketListInput);

    switch (regField) {
        case 'company':
            await updateCompanyField(apiKey, fieldValue, ticketList, res);
            break;
        case 'checkedIn':
            await updateCheckInField(apiKey, fieldValue, ticketList, res);
            break;
        default:
            res.status(400).json({
                error: 'Field update failed.'
            });
    }
};

const updateCheckInField = async (apiKey, fieldValue, ticketList, res) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const promises = ticketList.map(async (ticket) => {
            const apiUrl = `https://api.bizzabo.com/api/registrations/${ticket}`;
            const requestBody = {
                checkedin: fieldValue
            };

            try {
                const response = await axios.put(apiUrl, requestBody, config);
                const statusText = response.statusText || 'Unknown';
                return `${ticket}: ${response.status} ${statusText}`;
            } catch (error) {
                return `${ticket}: Error - ${error.message}`;
            }
        });

        const statusList = await Promise.all(promises);
        res.json({
            statusList
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update check-in field',
            details: error.message
        });
    }
};

const updateCompanyField = async (apiKey, fieldValue, ticketList, res) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const promises = ticketList.map(async (ticket) => {
            const apiUrl = `https://api.bizzabo.com/api/registrations/${ticket}`;
            const requestBody = {
                "properties": {
                    "company": fieldValue
                }
            };

            try {
                const response = await axios.put(apiUrl, requestBody, config);
                const statusText = response.statusText || 'Unknown';
                return `${ticket}: ${response.status} ${statusText}`;
            } catch (error) {
                return `${ticket}: Error - ${error.message}`;
            }
        });

        const statusList = await Promise.all(promises);
        res.json({
            statusList
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to update check-in field',
            details: error.message
        });
    }
};

const formatTicketList = function(ticketListInput) {
    // Replace periods with commas
    ticketListInput = ticketListInput.replace(/\./g, ',');
    // Split by commas, spaces, and new lines
    const tickets = ticketListInput.split(/[,\s\n]+/);
    // Remove empty strings
    return tickets.filter(ticket => ticket.trim() !== '');
};

module.exports = {
    updateField: updateField,
};