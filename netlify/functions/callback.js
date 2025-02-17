import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export const handler = async (event, context) => {
  const { code } = event.queryStringParameters;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No code received from GitHub' }),
    };
  }

  try {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

    const isDevelopment = process.env.NODE_ENV === 'development';
    const redirectUri = isDevelopment
      ? 'http://localhost:8080/upload'
      : 'https://pecademic.netlify.app/upload';

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

    return {
      statusCode: 302,
      headers: {
        Location: `${redirectUri}?access_token=${accessToken}`,
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
