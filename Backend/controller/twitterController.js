const { initializeTwitterClient } = require('../Config/twitter');

const generateQuirkyMessage = (username) => {
  const messages = [
    `Hey @${username}! 👋 Just wanted to let you know you're absolutely crushing it! 🚀`,
    `Spotted in the wild: @${username} being awesome as usual! ✨`,
    `Breaking news: @${username} just made our day a whole lot better! 🌟`,
    `Dear @${username}, thanks for being uniquely you! 🎉`,
    `BREAKING: @${username} just made our day hotter than a summer day in Vegas! 🔥😈`,
    `Yo @${username}, you’re so amazing, it's borderline unfair. Keep making us all jealous. 😜💯`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

let twitterClient = null;

const postTweet = async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const { username } = req.body;

    if (!username) {
      console.log('No username provided in request');
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log('Processing username:', username);

    // Initialize Twitter client if not already initialized
    if (!twitterClient) {
      console.log('Initializing Twitter client...');
      twitterClient = await initializeTwitterClient();
    }

    // Remove @ symbol if included
    const cleanUsername = username.replace('@', '');
    const message = generateQuirkyMessage(cleanUsername);

    console.log('Posting tweet with message:', message);

    try {
      // Send the tweet
      const tweetResult = await twitterClient.sendTweet(message);
      console.log('Tweet result:', tweetResult);

      // Instead of fetching tweet details again, construct URL from the initial response
      // Most Twitter API responses include either an id or id_str field
      const tweetId = tweetResult.id || tweetResult.id_str;
      console.log(tweetId)
      
      if (!tweetId) {
        console.log('Tweet posted but no ID received:', tweetResult);
        // Still return success since tweet was posted
        return res.status(200).json({
          success: true,
          message: 'Tweet posted successfully',
          tweetUrl: `https://twitter.com/${process.env.TWITTER_USERNAME}/`, // Fallback URL
          tweetText: message
        });
      }

      const tweetUrl = `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetId}`;
      console.log('Constructed tweet URL:', tweetUrl);

      return res.status(200).json({
        success: true,
        message: 'Tweet posted successfully',
        tweetUrl,
        tweetText: message
      });

    } catch (tweetError) {
      console.error('Error with tweet operation:', tweetError);
      throw tweetError;
    }

  } catch (error) {
    console.error('Error in postTweet:', error);
    
    if (error.message.includes('authentication')) {
      twitterClient = null;
    }

    return res.status(500).json({
      error: 'Failed to post tweet',
      details: error.message
    });
  }
};


module.exports = {
  postTweet
};
