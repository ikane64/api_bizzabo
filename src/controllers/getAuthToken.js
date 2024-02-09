const axios = require('axios');

async function getAuthToken(clientId, clientSecret, accountId) {
  const url = 'https://auth.bizzabo.com/oauth/token';
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    audience: 'https://api.bizzabo.com/api',
    grant_type: 'client_credentials',
    account_id: accountId
  };
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get token:', error.message);
    return null;
  }
}

module.exports = {
    getAuthToken: getAuthToken,
}