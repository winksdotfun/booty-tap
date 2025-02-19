const { Scraper } = require('agent-twitter-client');

const initializeTwitterClient = async () => {
  const scraper = new Scraper();
  
  try {
    // Login with both password and API credentials for full functionality
    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL,
      process.env.TWITTER_API_KEY,
      process.env.TWITTER_API_SECRET_KEY,
      process.env.TWITTER_ACCESS_TOKEN,
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );
    
    return scraper;
  } catch (error) {
    console.error('Failed to initialize Twitter client:', error);
    throw error;
  }
};

module.exports = { initializeTwitterClient };