import User from "../Models/SwellUser.js"
// Add Swell Points (POST)
export const updateSwellPoints = async (req, res) => {
  const { useraddress, newpoints, txnhash } = req.body;
  if (!useraddress || !newpoints || !txnhash) {
    return res.status(400).json({ message: "useraddress, newpoints, and txnhash are required" });
  }
  try {
    let user = await User.findOne({ userAddress: useraddress });
    if (!user) {
      user = new User({ userAddress: useraddress, points: newpoints, transactionHashes: [txnhash] });
    } else {
      user.points += Number(newpoints);
      user.transactionHashes.push(txnhash);
    }
    await user.save();
    return res.status(200).json({ success: true, points: user.points, transactionHashes: user.transactionHashes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update points", error: error.message });
  }
};

// Fetch Swell Points (GET)
export const fetchSwellPoints = async (req, res) => {
  const { useraddress } = req.query;
  if (!useraddress) {
    return res.status(400).json({ message: "useraddress is required" });
  }
  try {
    const user = await User.findOne({ userAddress: useraddress });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, points: user.points, transactionHashes: user.transactionHashes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch points", error: error.message });
  }
};
