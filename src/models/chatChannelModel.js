import mongoose from "mongoose";

const chatChannelSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "ID is required"],
    },
    senderId: {
      type: Number,
      required: [true, "Sender ID is required"],
    },
    channelId: {
      type: Number,
      required: [true, "Channel ID is required"],
    },
    workspaceId: {
      type: Number,
      required: [true, "Workspace ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2000, "Message must not exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export const ChatChannel = mongoose.model("ChatChannel", chatChannelSchema, "chatChannels");