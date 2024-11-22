const mongoose = require('mongoose');

// You can use a package like uuid for generating unique IDs
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true, // Useful for quick searches by address
  },
  referralCode: {
    type: String,
    unique: true, // A unique code to identify referrals
  },
  referredBy: {
    type: String, // The wallet address of the user who referred this user (optional)
    default: "",  // Default to an empty string
  },
  referralCount: {
    type: Number,
    default: 0, // To track how many users this user has referred (optional)
  },
  referralScore: {
    type: Number,
    default: 0, // To track referral scores
  },
  score: {
    type: Number,
    default: 0, // Default score
  },
  level: {
    type: Number,
    default: 1, // Default level
  },
  levelbar: {
    type: Number,
    default: 0, // Default level
  },
  createdAt: {
    type: Date,
    default: Date.now, // Track when the user was added to the system
  },
  referrals: {
    type: [String], // Array to store user referrals
    default: [], // Default to an empty array
  },
});


// Function to generate a unique referral code
function generateReferralCode(address) {
    // Use a combination of the address and current timestamp to generate a unique code
    const timestamp = Date.now().toString(36); // Convert timestamp to base-36
    const addressPart = address.slice(-4); // Get the last 4 characters of the address
    return `${addressPart}-${timestamp}`; // Example format: "abcd-5g1j3k"
  }
  
  // Middleware to generate a unique referral code before saving
  userSchema.pre('save', function (next) {
    if (this.isNew) {
      this.referralCode = generateReferralCode(this.address); // Generate a unique referral code
    }
    next();
  });
  

module.exports = mongoose.model('User', userSchema);
