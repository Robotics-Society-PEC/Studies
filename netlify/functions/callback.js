const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

export const handler = async (event, context) => {
  const { code } = event.queryStringParameters;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No code received from GitHub" }),
    };
  }

  try {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

    // Determine the correct redirect URL based on environment
    const isDevelopment = process.env.NODE_ENV === "development"; // Check for development environment
    const redirectBaseUrl = isDevelopment
      ? "http://localhost:8080/upload" // Localhost redirect in development
      : "https://pecademic.netlify.app/upload"; // Production redirect URL

    // Exchange the code for an access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI, // The correct redirect URI here
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("GitHub authentication failed");
    }

    // Redirect back to your frontend with the token based on the environment
    return {
      statusCode: 302,
      headers: {
        Location: `${redirectBaseUrl}?access_token=${accessToken}`,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error exchanging code for token",
        details: error.message,
      }),
    };
  }
};
