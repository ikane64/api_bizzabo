const axios = require('axios');

// Handler for getting magic link
const getMagicLink = async (req, res) => {
    const {
        apiKey,
        registrationId
    } = req.body;

    if (apiKey && registrationId) {
        const config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            params: {
                registrationId: registrationId,
            }
        };

        const url = `https://api.bizzabo.com/api/registrations/${registrationId}`;

        try {
            const response = await axios.get(url, config);
            const magicLink = response.data.magicLink;
            if (magicLink) {
                res.setHeader('Content-Type', 'text/plain');
                res.send(magicLink);
            }
        } catch (error) {
            console.error('Error fetching magic link:', error);
            res.status(500).json({
                error: 'Error fetching magic link. Check if API key and ticket ID are correct'
            });
        }
    } else {
        console.log('Error: apiKey and registrationId are required');
        res.status(400).json({
            error: 'API key and ticket ID are required'
        });
    }
};

// Handler for getting registrations
const getRegistrations = async (apiKey, eventId, pageNumber) => {
    const totalPages = await getPageCount(apiKey, eventId);

    if (totalPages > 0) {
        const config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            params: {
                eventId: eventId,
                size: 200,
                number: pageNumber,
                sort: 'asc',
                filter: 'validity=valid',
            }
        };

        try {
            const response = await axios.get('https://api.bizzabo.com/api/registrations', config);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
};

// Function for getting page count
const getPageCount = async (apiKey, eventId) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        params: {
            eventId: eventId,
            size: 200,
            sort: 'asc',
            filter: 'validity=valid',
        }
    };

    try {
        const response = await axios.get('https://api.bizzabo.com/api/registrations', config);
        const totalPages = response.data.page.totalPages;
        return totalPages;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

module.exports = {
    getMagicLink: getMagicLink,
};