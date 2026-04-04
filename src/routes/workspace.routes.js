import express from "express";

import { assignUserToWorkSpace, createWorkspace, deleteWorkspace, getWorkspaceById, getWorkspaces, getWorkspacesByCompanyId, updateWorkspace } from "../controllers/workspace.controller.js";
import { getChannelMessages, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// Public routes
router.post("/createWorkspace",  createWorkspace);
router.get("/getWorkspaces",  getWorkspaces);
router.get("/getWorkspaceById/:id",  getWorkspaceById);
router.post("/getWorkspacesByCompanyId", getWorkspacesByCompanyId);

// Admin only routes
router.put(
  "/updateWorkspace/:id",
  updateWorkspace
);
router.delete(
  "/deleteWorkspace/:id",
  deleteWorkspace
);
router.post(
  "/assignWorkSpace",
  assignUserToWorkSpace
);
router.post(
  "/sendMessage",
  sendMessage
);
router.get(
  "/getChannelMessages/:workspaceId",
  getChannelMessages
);

export default router;