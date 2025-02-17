exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }
  
    const { code } = JSON.parse(event.body);
  
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No code received from GitHub' }),
      };
    }
  
    // You can handle the code exchange here similar to the callback function
    try {
      // Exchange code for access token logic goes here...
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Token exchanged successfully' }),
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
  