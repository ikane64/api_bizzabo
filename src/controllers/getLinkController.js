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


module.exports = {
    getMagicLink: getMagicLink,
};