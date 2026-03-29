import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ── Profile fields ──────────────────────────────────────────────────────────
  bio:          { type: String, default: "" },
  college:      { type: String, default: "" },
  phone:        { type: String, default: "" },
  profileImage: { type: String, default: "" },

  // ── Auth fields ─────────────────────────────────────────────────────────────
  role:                     { type: String, default: "student" },
  lastLogin:                { type: Date, default: Date.now },
  isVerfied:                { type: Boolean, default: false },
  resetPasswordToken:       String,
  resetPasswordExpires:     Date,
  verificationToken:        String,
  verificationTokenExpires: Date,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);