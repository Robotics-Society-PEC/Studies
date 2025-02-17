const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

exports.handler = async (event, context) => {
  const { code } = event.queryStringParameters;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No code received from GitHub' }),
    };
  }

  try {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('GitHub authentication failed');
    }

    // Redirect back to your frontend with the token
    return {
      statusCode: 302,
      headers: {
        Location: `https://pecademic.netlify.app/upload?access_token=${accessToken}`,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error exchanging code for token',
        details: error.message,
      }),
    };
  }
};
