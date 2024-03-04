const axios = require('axios');

class TicketFieldUpdateService {
    constructor(apiKey) {
        this.baseUrl = 'https://api.bizzabo.com/api/registrations';
        this.apiKey = apiKey;
        this.config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };
    }

    async updateField(regField, fieldValue, ticketList) {
        switch (regField) {
            case 'company':
                return this.updateCompanyField(fieldValue, ticketList);
            case 'checkedIn':
                return this.updateCheckInField(fieldValue, ticketList);
            default:
                throw new Error('Invalid field');
        }
    }

    async getTicketEmail(ticketId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${ticketId}`, this.config);
            return response.data.properties.email;
        } catch (error) {
            throw new Error(`Failed to fetch email for ticket ${ticketId}: ${error.message}`);
        }
    }

    async updateCheckInField(fieldValue, ticketList) {
        return this.updateTickets(ticketList, { checkedin: fieldValue });
    }

    async updateCompanyField(fieldValue, ticketList) {
        const updatedTicketList = await Promise.all(ticketList.map(async (ticket) => {
            const email = await this.getTicketEmail(ticket);
            return { ticket, email };
        }));

        return this.updateTickets(updatedTicketList, ticket => ({
            "properties": {
                "company": fieldValue,
                "email": ticket.email
            }
        }));
    }

    async updateTickets(ticketList, requestBodyFunc) {
        const promises = ticketList.map(async (ticketInfo) => {
            const ticket = typeof ticketInfo === 'object' ? ticketInfo.ticket : ticketInfo;
            const apiUrl = `${this.baseUrl}/${ticket}`;
            const requestBody = typeof requestBodyFunc === 'function' ? requestBodyFunc(ticketInfo) : requestBodyFunc;
            try {
                const response = await axios.put(apiUrl, requestBody, this.config);
                const statusText = response.statusText || 'Unknown';
                return `${ticket}: ${response.status} ${statusText}`;
            } catch (error) {
                return `${ticket}: Error - ${error.message}`;
            }
        });
        return Promise.all(promises);
    }
}

const formatTicketList = (ticketListInput) => {
    ticketListInput = ticketListInput.replace(/\./g, ',');
    const tickets = ticketListInput.split(/[,\s\n]+/);
    return tickets.filter(ticket => ticket.trim() !== '');
};

const updateField = async (req, res) => {
    const { apiKey, regField, fieldValue, ticketListInput } = req.body;
    const ticketList = formatTicketList(ticketListInput);
    const updater = new TicketFieldUpdateService(apiKey);

    try {
        const statusList = await updater.updateField(regField, fieldValue, ticketList);
        res.json({ statusList });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    updateField,
};
