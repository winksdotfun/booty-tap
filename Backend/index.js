const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./Models/User");

require('dotenv').config();

const app = express();

app.use(cors());
 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const dbURI = process.env.MONGODB;
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



  const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});