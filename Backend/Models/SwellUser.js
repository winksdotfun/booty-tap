import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userAddress: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  transactionHashes: { type: [String], default: [] }
});

const User = mongoose.model("User", userSchema);
export default User; 