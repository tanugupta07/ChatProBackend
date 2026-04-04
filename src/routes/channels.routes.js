import express from "express";

  import { createChannels, deleteChannel, getChannelsById, getChannels, getChannelsByWorkspaceId, updateChannel } from "../controllers/channels.controller.js";

const router = express.Router();

// Public routes
router.post("/createChannels",  createChannels);
router.get("/getChannels",  getChannels);
router.get("/getChannelsById/:id",  getChannelsById);
router.post("/getChannelsByWorkspaceId", getChannelsByWorkspaceId);

// Admin only routes
router.put(
  "/updateChannel/:id",
  updateChannel
);
router.delete(
  "/deleteChannel/:id",
  deleteChannel
);

export default router;
