const axios = require('axios');

class GetMagicLinkService {
    constructor(apiKey, registrationId) {
        this.apiKey = apiKey;
        this.registrationId = registrationId;
        this.url = `https://api.bizzabo.com/api/registrations/${registrationId}`;
    }

    async getMagicLink() {
        if (!this.apiKey || !this.registrationId) {
            throw new Error('API key and registration ID are required');
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            params: {
                registrationId: this.registrationId,
            }
        };

        try {
            const response = await axios.get(this.url, config);
            return response.data.magicLink;
        } catch (error) {
            console.error('Error fetching magic link:', error);
            throw new Error('Error fetching magic link. Check if API key and ticket ID are correct');
        }
    }
}

const getMagicLinkHandler = async (req, res) => {
    const { apiKey, registrationId } = req.body;

    try {
        const magicLinkService = new GetMagicLinkService(apiKey, registrationId);
        const magicLink = await magicLinkService.getMagicLink();
        res.setHeader('Content-Type', 'text/plain');
        res.send(magicLink);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMagicLinkHandler
};
