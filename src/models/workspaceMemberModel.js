import mongoose from "mongoose";

// A schema to map employees (users) to workspaces. 
// Ek workspace ko multiple employee assign ho skta hai, aur ek employee multiple workspace me ho skta hai.

const workspaceMemberSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "ID is required"],
    },
    workspaceId: {
      type: Number,
      required: [true, "Workspace ID is required"],
      ref: "WorkSpace",
    },
    empId: {
      type: Number,
      required: [true, "Employee ID is required"],
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Custom transform if needed
        return ret;
      },
    },
  }
);

// Each document is a mapping of ek employee to ek workspace (can have many entries)
export const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema,
  "workspace_members"
);
