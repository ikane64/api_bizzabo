const axios = require('axios');
const getAuthToken = require('./getAuthToken');


let cancelRequest = false; // Flag to track cancellation request

const bulkTicketCancel = async (req, res) => {
    const { clientId, clientSecret, accountId, eventId, refundAmount, sendEmail, ticketListInput } = req.body;
    ticketList = formatTicketList(ticketListInput); 
    const token = await getAuthToken.getAuthToken(clientId, clientSecret, accountId);
    const ticketOrderPairs = await getTicketOrderPairs(token, eventId, ticketList);

    try {
        const responses = await Promise.all(Object.entries(ticketOrderPairs).map(async ([ticketId, orderId]) => {
            if (cancelRequest) {
                throw new Error('Cancellation requested');
            }

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
                return { ticketId, status: response.status, message: response.statusText };
            } catch (error) {
                return { ticketId, status: error.response.status, message: error.response.data.message || 'Unknown error' };
            }
        }));

        res.json({ message: 'Bulk ticket cancellation completed', responses });
    } catch (error) {
        console.error('Failed to cancel tickets:', error.message);
        res.status(500).json({ error: 'Failed to cancel tickets', details: error.message });
    }
};

// Endpoint to cancel the operation
const stopBulkCancellation = (req, res) => {
    cancelRequest = true;
    res.json({ message: 'Cancellation request received' });
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
    return tickets.filter(ticket => ticket.trim() !== '');
};

module.exports = {
    bulkTicketCancel: bulkTicketCancel,
    stopBulkCancellation: stopBulkCancellation,
}