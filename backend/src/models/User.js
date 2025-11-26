import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    airtableUserId: { type: String, required: true, unique: true },
    email: { type: String },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    loginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
