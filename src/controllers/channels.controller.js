import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/token.js";
import { successResponse, errorResponse, notFoundResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import { User } from "../models/userModel.js";
import { channels, } from "../models/channelModel.js";
import { workSpace } from "../models/workspaceModel.js";

export async function createChannels(req, res) {
  try {
    const { name, description, companyId, workspaceId } = req.body;
    const lastChannel = await channels.findOne().sort({ id: -1 });
    const nextId = lastChannel ? Number(lastChannel.id) + 1 : 1;
    const channel = await channels.create({
      id: nextId,
      name,
      description,
      companyId,
      workspaceId,
      active: true,
    });

    // Remove sensitive data before sending response
    const channelResponse = {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      companyId: channel.companyId,
      workspaceId: channel.workspaceId,
      createdAt: channel.createdAt,
    };

    logger.info("channel registered successfully", { channelId: channel.id });
    return successResponse(res, { channel: channelResponse }, "channel registered successfully", 200);
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    return errorResponse(res, "Failed to register channel", 500);
  }
}

export async function getChannelsById(req, res) {
  try {
    const { id } = req.params;
    const channel = await channels.findOne({ id: id });

    if (!channel) {
      return notFoundResponse(res, "channel not found");
    }

    return successResponse(res, channel, "channel found");
  } catch (error) {
    logger.error("Get channel by ID error", { error: error.message, channelId: req.params.id });
    return errorResponse(res, "Failed to fetch workspace", 500);
  }
}

export async function getChannels(req, res) {
  try {
    const channels = await channels.find({ active: true });

    const data = await Promise.all(
      channels.map(async (channel) => {
        const user = await User.findOne({ id: channel.companyId });
        return {
            role : user.role,
            id: channel.id,
            name: channel.name,
            description: channel.description,
            companyId: channel.companyId,
            createdAt: channel.createdAt,
        };
      })
    );
    return successResponse(res, data, "Channels fetched successfully");
  } catch (error) {
    logger.error("Get channels error", { error: error.message });
    return errorResponse(res, "Failed to fetch channels", 500);
  }
}

export async function getChannelsByWorkspaceId(req, res) {
  try {
    const { workspaceId } = req.body;
    const channelsData = await channels.find({ workspaceId : Number(workspaceId), active: true }).sort({ createdAt: -1 });
    const data = await Promise.all(
      channelsData.map(async (channel) => {
        const user = await User.findOne({ id: channel.companyId });
        const workspace = await workSpace.findOne({ id: channel.workspaceId });
        return {
            workspaceName : workspace.name,
            userName : user.name,
            userId : user.id,
            workspaceId : workspace.id,
            role : user.role,
            id: channel.id,
            name: channel.name,
            description: channel.description,
            companyId: channel.companyId,
            createdAt: channel.createdAt,
        };
      })
    );
    return successResponse(res, data, "Channels fetched successfully");
  } catch (error) {
    logger.error("Get channels by workspace ID error", { error: error.message });
    return errorResponse(res, "Failed to fetch channels", 500);
  }
}

export async function updateChannel(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow password updates through this endpoint
    const channel = await channels.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!channel) {
      return notFoundResponse(res, "channel not found");
    }

    logger.info("channel updated successfully", { channelId: id });
    return successResponse(res, channel, "channel updated successfully");
  } catch (error) {
    logger.error("Update channel error", { error: error.message, channelId: req.params.id });
    return errorResponse(res, "Failed to update channel", 500);
  }
}

export async function deleteChannel(req, res) {
  try {
    const { id } = req.params;

      const channel = await channels.findByIdAndDelete(id);

    if (!channel) {
      return notFoundResponse(res, "channel not found");
    }

    logger.info("channel deleted successfully", { channelId: id });
    return successResponse(res, { id: channel.id }, "channel deleted successfully");
  } catch (error) {
    logger.error("Delete channel error", { error: error.message, channelId: req.params.id });
    return errorResponse(res, "Failed to delete channel", 500);
  }
}
  