import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  mobile: {
    type: String,
    unique: true,
    required: true
  },
  authcode: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["super_admin","workspace_owner","member"],
    default: "workspace_owner"
  },
  active: {
    type: Boolean,
    default: true
  },
  comanyId: {
    type: Number,
    default: null
  },
},
{ timestamps: true }
);

export const User =
mongoose.models.User || mongoose.model("User", userSchema);