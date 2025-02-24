const { initializeTwitterClient } = require('../config/twitter');
const User = require('mongoose').model('User');

const generateQuirkyMessage = (username) => {
  const messages = [
    `Hey @${username}! 👋 Just wanted to let you know you're absolutely crushing it! 🚀\nhttps://bootytap.winks.fun/`,
    `Spotted in the wild: @${username} being awesome as usual! ✨\nhttps://bootytap.winks.fun/`,
    `Breaking news: @${username} just made our day a whole lot better! 🌟\nhttps://bootytap.winks.fun/`,
    `Dear @${username}, thanks for being uniquely you! 🎉\nhttps://bootytap.winks.fun/`,
    `BREAKING: @${username} just made our day hotter than a summer day in Vegas! 🔥😈\nhttps://bootytap.winks.fun/`,
    `Yo @${username}, you're so amazing, it's borderline unfair. Keep making us all jealous. 😜💯\nhttps://bootytap.winks.fun/`
];
  return messages[Math.floor(Math.random() * messages.length)];
};

let twitterClient = null;

const postTweet = async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    const { username, address } = req.body;

    if (!username) {
      console.log('No username provided in request');
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Check points before posting tweet
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.score < 69) {
      return res.status(400).json({ 
        error: 'Insufficient points',
        currentScore: user.score,
        required: 69
      });
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

      // If tweet is successful, deduct points
      user.score -= 69;
      await user.save();

      // Instead of fetching tweet details again, construct URL from the initial response
      // Most Twitter API responses include either an id or id_str field
      const tweetId = tweetResult.id || tweetResult.id_str;
      console.log(tweetId)
      
      if (!tweetId) {
        console.log('Tweet posted but no ID received:', tweetResult);
        return res.status(200).json({
          success: true,
          message: 'Tweet posted successfully',
          tweetUrl: `https://twitter.com/${process.env.TWITTER_USERNAME}/`, // Fallback URL
          tweetText: message,
          updatedScore: user.score
        });
      }

      const tweetUrl = `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetId}`;
      console.log('Constructed tweet URL:', tweetUrl);

      return res.status(200).json({
        success: true,
        message: 'Tweet posted successfully',
        tweetUrl,
        tweetText: message,
        updatedScore: user.score
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

const deductPoints = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Find the user
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough points
    if (user.score < 69) {
      return res.status(400).json({ 
        error: 'Insufficient points',
        currentScore: user.score,
        required: 69
      });
    }

    // Deduct points
    user.score -= 69;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Points deducted successfully',
      updatedScore: user.score
    });

  } catch (error) {
    console.error('Error in deductPoints:', error);
    return res.status(500).json({
      error: 'Failed to deduct points',
      details: error.message
    });
  }
};

module.exports = {
  postTweet,
  deductPoints
};
