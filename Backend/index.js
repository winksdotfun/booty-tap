const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./Models/User");

const rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const dbURI = process.env.MONGODB;

// Store IPs that have already claimed coupons with timestamps
const claimedIPs = new Map(); // Maps IP to {timestamp, categoryId}

// Constants for time calculations
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Function to check if claim has expired
const hasExpired = (timestamp) => {
  return Date.now() - timestamp >= TWENTY_FOUR_HOURS;
};

// Function to get time remaining in milliseconds
const getTimeRemaining = (timestamp) => {
  const remaining = (timestamp + TWENTY_FOUR_HOURS) - Date.now();
  return remaining > 0 ? remaining : 0;
};

// Format remaining time into hours and minutes
const formatTimeRemaining = (ms) => {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours} hours and ${minutes} minutes`;
};

// Clean expired entries periodically
const cleanExpiredEntries = () => {
  let cleaned = 0;
  for (const [ip, data] of claimedIPs.entries()) {
    if (hasExpired(data.timestamp)) {
      claimedIPs.delete(ip);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired IP entries`);
  }
};

// Run cleanup every hour
setInterval(cleanExpiredEntries, ONE_HOUR);

// Middleware for IP claiming
const ipLimitMiddleware = async (req, res, next) => {
  const clientIP = getClientIP(req);
  console.log("clientIP", clientIP);
  const { id } = req.query;
  const numId = parseInt(id);
  
  const claimData = claimedIPs.get(clientIP);

  if (claimData) {
    if (!hasExpired(claimData.timestamp)) {
      const remaining = getTimeRemaining(claimData.timestamp);
      return res.status(403).json({
        message: 'You have already claimed a coupon.',
        timeRemaining: formatTimeRemaining(remaining),
        nextAvailableTime: new Date(claimData.timestamp + TWENTY_FOUR_HOURS).toISOString()
      });
    }
    // Remove expired claim
    claimedIPs.delete(clientIP);
  }

  next();
};

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, 
    socketTimeoutMS: 45000, 
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

  app.post('/api/user', async (req, res) => {
    console.log(req.body);
    const { address } = req.body; // Removed referralCode extraction

    try {
        // Check if the user already exists
        let user = await User.findOne({ address });

        if (user) {
            return res.status(200).json({
                message: "User found.",
                score: user.score,
                referralScore: user.referralScore,
                referredBy: user.referredBy,
                level: user.level,
                levelbar: user.levelbar,
                referralCode: user.referralCode,
            });
        }

        // Create a new user
        user = new User({ address });

        await user.save();
        console.log("User created");

        return res.status(201).json({
            message: "User created.",
            score: user.score,
            level: user.level,
            levelbar: user.levelbar,
            referralCode: user.referralCode,
        });

    } catch (error) {
        console.error("Error in POST /api/user:", error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
});

app.put('/api/user/update', async (req, res) => {

  console.log('Received body:', req.body); // Log the body content
  
  const { address, score, level, levelbar } = req.body;
  
  try {
      let user = await User.findOne({ address });

      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }

      user.score = score || user.score; 
      user.level = level || user.level; // Update level if provided, otherwise keep the existing value
      user.levelbar = levelbar || user.levelbar;
      await user.save();

      // Return the updated user details
      return res.status(200).json({
          message: "User score and level updated.",
          score: user.score,
          level: user.level,
          levelbar: user.levelbar,
      });
  } catch (error) {
      console.error("Error in PUT /api/user/update:", error);
      return res.status(500).json({ message: "Server error.", error: error.message });
  }
});

app.post("/api/user/update-referred-by", async (req, res) => {
  const { referralId, address } = req.body;

  if (!referralId || !address) {
    return res.status(400).json({ error: "Referral ID and address are required." });
  }

  try {
    // Find the user by their address
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Find the referrer by their referralCode
    const referrer = await User.findOne({ referralCode: referralId });
    if (!referrer) {
      return res.status(404).json({ error: "Referrer not found." });
    }

    // Check if the user is already referred
    if (user.referredBy) {
      return res.status(400).json({ error: "User is already referred by someone." });
    }

    // Update the referredBy field for the user
    user.referredBy = referrer.address;
    
    // Update the user's referralScore
    user.referralScore += 69;
    // Update the referrer's details
    referrer.referralCount += 1;
    referrer.referralScore += 69696;
    referrer.score += 69696;
    referrer.referrals.push(user.address);

    // Save both the user and the referrer
    await user.save();
    await referrer.save();

    res.status(200).json({ message: "ReferredBy field updated successfully." });
  } catch (error) {
    console.error("Error updating referredBy field:", error);
    res.status(500).json({ error: "An error occurred while processing the referral." });
  }
});

const couponPools = new Map();

// Initialize some sample coupon codes for different IDs
// Hardcoded coupon pools
couponPools.set(0, [
  'TWICA047BAF', 'TWI8D17025B', 'TWI04D1B8B0', 'TWI52A94E68', 'TWI8F914032',
  'TWI063DFFDA', 'TWIDABA8AA8', 'TWIDDD02B32', 'TWID862FAB8', 'TWI08D21F22',
  'TWI61D6D3A9', 'TWIE2CEA175', 'TWI03BA0E6F', 'TWI0149ECD0', 'TWI0CCDD9D3',
  'TWIC47BB074', 'TWIA3783697', 'TWI586C66DC', 'TWI0CFCDCD4', 'TWIC06FC709',
  'TWI1B979AAF', 'TWI93A1A3FA', 'TWI9203CC8B', 'TWI8CB47919', 'TWI634BD1D8',
  'TWI6064F661', 'TWI8332607D', 'TWID191DFEE', 'TWIEDA000AB', 'TWIE92EEF38',
  'TWI4EEEEDB1', 'TWIB2CA179B', 'TWICE414248', 'TWI6A8D251A', 'TWIB1926E8F',
  'TWID6D418AD', 'TWI0B1C29E0', 'TWICA14833B', 'TWI8B3997CB', 'TWI28D83324',
  'TWI5A65EC0F', 'TWI925E4DD5', 'TWI23ED7CB0', 'TWIDCBF8328', 'TWIB030D80A',
  'TWI0801A0AC', 'TWI35D24536', 'TWI7B03AA54', 'TWI62CBC306', 'TWI277E864A',
  'TWIC121F292', 'TWIEBD6B1C8', 'TWIBD57785D', 'TWI9711B851', 'TWI00E00EC4',
  'TWIBCAB41D2', 'TWID4EE8844', 'TWIE4813838', 'TWI7C7A9BC0', 'TWI44C8810E',
  'TWIE54CCB5A', 'TWI950CC7C2', 'TWIC7AB43CA', 'TWI52171563', 'TWI2E54ED4A',
  'TWI13BB45E1', 'TWI95FD8D36', 'TWI9E9219CA', 'TWI45C3E8CC', 'TWI487C5418',
  'TWI422977B4', 'TWIF3BC25B2', 'TWIE5CD517B', 'TWI775F3E10', 'TWI0CDD9A6D',
  'TWICE2F45D1', 'TWIFFAC5C32', 'TWI799008C0', 'TWIDACF9763', 'TWI55CB355D',
  'TWI34A68958', 'TWI41FFF7D7', 'TWIEFC00C88', 'TWI478B8BC2', 'TWI8FAEE9FB',
  'TWI2C3B4FBF', 'TWI2B61F145', 'TWIECB5C8C8', 'TWI44492613', 'TWI2F9EE42B',
  'TWIE6F47E65', 'TWIA1121065', 'TWI6ED31967', 'TWI77AEAE66', 'TWI41941E0D',
  'TWI63B1E862', 'TWIC18023D6', 'TWI8FF6013D', 'TWI2923A77E', 'TWI43D4D1E9',
  'TWIF8CC7626', 'TWIA17FC8F1', 'TWIDBC8F2ED', 'TWI2569EFFA', 'TWI66DA7F32',
  'TWIEA58D3BF', 'TWI66B235EF', 'TWI5C84F91A', 'TWICF9A1FEE', 'TWIFE6342A9',
  'TWIE51D0C52', 'TWI13AD28CA', 'TWIEEE475CC', 'TWI72D5BE68', 'TWI36272504',
  'TWI4F3A3EF4', 'TWI6127E156', 'TWI867CD2E1', 'TWIFE8CAF65', 'TWI9B4D3E3C',
  'TWI1CEFF91E', 'TWI7D3BFE7E', 'TWI5FD42009', 'TWIF6DC0473', 'TWI87C7BCE0',
  'TWI13B0E403', 'TWI92C2AB3E', 'TWI308477CE', 'TWI905D5737', 'TWIDDD81DB5',
  'TWI000DDC84', 'TWIA779518F', 'TWIAEC9A2AB', 'TWI443904C0', 'TWIE44365B8',
  'TWI0398FEDF', 'TWI2F689114', 'TWIA56073D3', 'TWI9E42EA27', 'TWI5F9C32B6',
  'TWI2F5D153F', 'TWIE8B4376E', 'TWIEC9731FF', 'TWID38211DC', 'TWI87B848E2',
  'TWICA5E9A07', 'TWI32C65109', 'TWI2DD8FA51', 'TWIE1EFC3D1', 'TWI4F3AEE14',
  'TWI4C9A8FA3', 'TWI67502672', 'TWIC0C8E709', 'TWI1173B6AB', 'TWI1227EBAA',
  'TWIA5441A3C', 'TWICAD90E1B', 'TWI01BE51D9', 'TWI696A85A0', 'TWIB86F8E0D'
]);

couponPools.set(1, [
  'TWI612F99B3', 'TWI33A2E2FE', 'TWI1D4D2318', 'TWIC3B1CF3A', 'TWIF69AEE72',
  'TWIFD671374', 'TWI64A16525', 'TWID724608D', 'TWI44E0C572', 'TWI44F92C31',
  'TWID24F42C2', 'TWI5C771A0C', 'TWI1468C277', 'TWI616E6778', 'TWI0EB00023',
  'TWIB73B3013', 'TWICCB6370B', 'TWI2D58C560', 'TWIA48BCECB', 'TWIB1AC9E90'
]);

couponPools.set(3, [
  'TWIB0039DDD', 'TWI71AA43E1', 'TWI11EC4092', 'TWI9622DB24', 'TWID360284A',
  'TWI1D88DEB4', 'TWI95F406AB', 'TWIEF65F984', 'TWI38DAE8BC', 'TWIDDC2D17B'
]);

couponPools.set(4, [
  'TWI9295A12C', 'TWIA751EFFA', 'TWI95C285B5', 'TWIA1BF161B', 'TWIE46B99F7',
  'TWI9520A75F', 'TWIAB247262', 'TWI9042CF36', 'TWI47D22E4E', 'TWIC6F07395',
  'TWIE5326BDA', 'TWI31933CCB', 'TWIB785771B', 'TWI8F5A5D6E', 'TWI365A955D',
  'TWIA883612B', 'TWI426FACA5', 'TWIA2373F5C', 'TWI6323ED4C', 'TWIB100E100'
]);

// Store current index state
let currentIndexMap = new Map();
const getClientIP = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  console.log('IP Debug:', {
    reqIP: req.ip,
    forwardedFor,
    realIP,
    remoteAddr: req.connection.remoteAddress
  });
  
  // Use the first forwarded IP if available, otherwise fallback to req.ip
  return forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;
};

app.get("/api/coupon", ipLimitMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    const numId = parseInt(id);
    const clientIP = req.ip;
console.log("clientIP in coupon", clientIP);


    if (!couponPools.has(numId)) {
      return res.status(404).json({ message: 'Invalid coupon category ID' });
    }

    const coupons = couponPools.get(numId);
    
    // Initialize index for this category if not exists
    if (!currentIndexMap.has(numId)) {
      currentIndexMap.set(numId, 0);
    }

    let currentIndex = currentIndexMap.get(numId);
    
    // Get coupon at current index
    const couponCode = coupons[currentIndex];
    
    // Move to next index, loop back to 0 if at end
    currentIndex = (currentIndex + 1) % coupons.length;
    currentIndexMap.set(numId, currentIndex);

    // Store IP with current timestamp and category
    const claimTime = Date.now();
    claimedIPs.set(clientIP, {
      timestamp: claimTime,
      categoryId: numId
    });

    return res.status(200).json({ 
      couponCode,
      message: 'Coupon claimed successfully. You can claim again in 24 hours.',
      nextAvailableTime: new Date(claimTime + TWENTY_FOUR_HOURS).toISOString()
    });

  } catch (error) {
    console.error('Error getting coupon code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// New endpoint to check IP claim status
app.get("/api/check-ip-status", async (req, res) => {
  try {
    console.log("check-ip-status");
    const clientIP = getClientIP(req);
    const claimData = claimedIPs.get(clientIP);
console.log("clientIP", clientIP);

    console.log("claimData", claimData);
    if (!claimData) {
      return res.status(200).json({
        hasClaimed: false,
        message: 'IP has not claimed any coupon yet'
      });
    }

    if (hasExpired(claimData.timestamp)) {
      claimedIPs.delete(clientIP);
      return res.status(200).json({
        hasClaimed: false,
        message: 'Previous claim has expired'
      });
    }

    const remaining = getTimeRemaining(claimData.timestamp);
    return res.status(200).json({
      hasClaimed: true,
      message: 'IP has an active claim',
      categoryId: claimData.categoryId,
      timeRemaining: formatTimeRemaining(remaining),
      nextAvailableTime: new Date(claimData.timestamp + TWENTY_FOUR_HOURS).toISOString()
    });

  } catch (error) {
    console.error('Error checking IP status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});