import mongoose from "mongoose";

const channelsSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    workspaceId : {
      type: Number,
      required: [true, "Company ID is required"],
    },
    companyId : {
      type: Number,
      required: [true, "Company ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.authcode;
        return ret;
      },
    },
  }
);

export const channels = mongoose.model("Channels", channelsSchema, "channels");
