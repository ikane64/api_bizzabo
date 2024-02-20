const axios = require('axios');
const getAuthToken = require('./getAuthToken');

// Global variable to track cancellation request
let cancelRequest = false;

// Function to handle cancellation request
const stopBulkCancellation = async () => {
    cancelRequest = true;
    console.log('Operation cancelled');
};

// Middleware
const checkCancellation = (req, res, next) => {
    if (cancelRequest) {
        console.log('Cancellation requested, stopping bulk cancellation');
        res.json({ message: 'Cancellation requested, stopping bulk cancellation' });
    } else {
        next();
    }
};

const bulkTicketCancel = async (req, res) => {
    const { clientId, clientSecret, accountId, eventId, refundAmount, sendEmail, ticketListInput } = req.body;
    const token = await getAuthToken.getAuthToken(clientId, clientSecret, accountId);
    const ticketList = formatTicketList(ticketListInput); 
    const ticketOrderPairs = await getTicketOrderPairs(token, eventId, ticketList);

    try {
        const responses = [];

        for (const ticketId of ticketList) {
            if (cancelRequest) {
                console.log('Cancellation requested, stopping bulk cancellation');
                break;
            }

            const orderId = ticketOrderPairs[ticketId];
            const apiUrl = `https://api.bizzabo.com/v1/events/${eventId}/registrations/${ticketId}/cancel`;

            const body = new FormData();
            body.append('orderId', orderId);
            body.append('refundAmount', refundAmount);
            body.append('sendEmail', sendEmail === 'true');
            body.append('validity', 'invalid');

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            try {
                const response = await axios.put(apiUrl, body, { headers });
                responses.push({ ticketId, status: response.status, message: response.statusText });
            } catch (error) {
                responses.push({ ticketId, status: error.response.status, message: error.response.data.message || 'Unknown error' });
            }
        }

        res.json({ message: 'Bulk ticket cancellation completed', responses });
    } catch (error) {
        console.error('Failed to cancel tickets:', error.message);
        res.status(500).json({ error: 'Failed to cancel tickets', details: error.message });
    } finally {
        // Reset the cancelRequest flag
        cancelRequest = false;
    }
};

async function getTicketOrderPairs(token, eventId, ticketList) {
    const header = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const promises = ticketList.map(async (ticket) => {
            const apiUrl = `https://api.bizzabo.com/v1/events/${eventId}/registrations/${ticket}`;
            try {
                const response = await axios.get(apiUrl, { headers: header });
                const { orderId } = response.data;
                return { ticket, orderId };
            } catch (error) {
                return { ticket, error: error.message };
            }
        });

        const ticketOrderPairs = await Promise.all(promises);
        const result = {};
        ticketOrderPairs.forEach(pair => {
            result[pair.ticket] = pair.orderId || pair.error;
        });

        return result;
    } catch (error) {
        console.error('Failed to get ticket-order pairs:', error.message);
        return error.message;
    }
}

const formatTicketList = function(ticketListInput) {
    // Replace periods with commas
    ticketListInput = ticketListInput.replace(/\./g, ',');
    // Split by commas, spaces, and new lines
    const tickets = ticketListInput.split(/[,\s\n]+/);
    // Remove empty strings
    const filteredTickets = tickets.filter(ticket => ticket.trim() !== '');
    return filteredTickets;
};

module.exports = {
    bulkTicketCancel: bulkTicketCancel,
    stopBulkCancellation: stopBulkCancellation,
    checkCancellation: checkCancellation,
}