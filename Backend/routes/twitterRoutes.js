const express = require('express');
const router = express.Router();
const { postTweet } = require('../controller/twitterController');

router.post('/tweet', postTweet);

module.exports = router;