const express = require('express');
const router = express.Router();
const { postTweet } = require('../controller/twitterController');
const twitterController = require('../controller/twitterController');

router.post('/tweet', postTweet);
router.post('/deduct-points', twitterController.deductPoints);

module.exports = router;