import bcrypt from "bcryptjs";
import { generateAccessToken, verifyAccessToken } from "../utils/token.js";
import { successResponse, errorResponse, notFoundResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import { workSpace } from "../models/workspaceModel.js";
import { User } from "../models/userModel.js";
import { WorkspaceMember } from "../models/workspaceMemberModel.js";

export async function createWorkspace(req, res) {
  try {
    const { name, description, companyId } = req.body;
     const lastWorkspace = await workSpace.findOne().sort({ id: -1 });
     const nextId = lastWorkspace ? Number(lastWorkspace.id) + 1 : 1;
     console.log(nextId, "nextId");
    const workspace = await workSpace.create({
      id: nextId,
      name,
      description,
      companyId,
      active: true,
    });

    // Remove sensitive data before sending response
    const workspaceResponse = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      companyId: workspace.companyId,
      createdAt: workspace.createdAt,
    };

    logger.info("workSpace registered successfully", { workspaceId: workspace.id });
    return successResponse(res, { workspace: workspaceResponse }, "workSpace registered successfully", 200);
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    return errorResponse(res, "Failed to register workspace", 500);
  }
}

export async function getWorkspaceById(req, res) {
  try {
    const { id } = req.params;
    const workspace = await workSpace.findOne({ id: id });

    if (!workspace) {
      return notFoundResponse(res, "workSpace not found");
    }

    return successResponse(res, workspace, "workSpace found");
  } catch (error) {
    logger.error("Get workspace by ID error", { error: error.message, workspaceId: req.params.id });
    return errorResponse(res, "Failed to fetch workspace", 500);
  }
}

export async function getWorkspaces(req, res) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse(res, "No token provided", 401);
    }

    let userId, role;
    try {
      const decoded = verifyAccessToken(authHeader.split(" ")[1]);
      userId = decoded.userId;
      role = decoded.role;
    } catch {
      return errorResponse(res, "Invalid token", 401);
    }

    let workspaces = [];
    if (role === "member") {
      const workspaceIds = (await WorkspaceMember.find({ empId: userId })).map(m => m.workspaceId);
      workspaces = await workSpace.find({ id: workspaceIds });
    } else if (role === "super_admin") {
      workspaces = await workSpace.find().sort({ createdAt: -1 });
    } else if (role === "workspace_owner") {
      workspaces = await workSpace.find({ companyId: userId }).sort({ createdAt: -1 });
    }

    const data = workspaces.map(({ id, name, description, companyId, createdAt }) => ({
      id, name, description, companyId, createdAt
    }));

    return successResponse(res, data, "Workspaces fetched successfully");
  } catch (error) {
    logger.error("Get workspaces error", { error: error.message });
    return errorResponse(res, "Failed to fetch workspaces", 500);
  }
}

export async function getWorkspacesByCompanyId(req, res) {
  try {
    const { companyId } = req.body;
    const workspaces = await workSpace.find({ companyId }).sort({ createdAt: -1 });
    if (workspaces.length === 0) {
      return notFoundResponse(res, "No workspaces found for this company");
    }
    return successResponse(res, workspaces, "Workspaces fetched successfully");
  } catch (error) {
    logger.error("Get workspaces by company ID error", { error: error.message });
    return errorResponse(res, "Failed to fetch workspaces", 500);
  }
}

export async function updateWorkspace(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow password updates through this endpoint
    const workspace = await workSpace.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!workspace) {
      return notFoundResponse(res, "workSpace not found");
    }

    logger.info("workSpace updated successfully", { workspaceId: id });
    return successResponse(res, workspace, "workSpace updated successfully");
  } catch (error) {
    logger.error("Update workspace error", { error: error.message, workspaceId: req.params.id });
    return errorResponse(res, "Failed to update workspace", 500);
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;

    const workspace = await workSpace.findByIdAndDelete(id);

    if (!workspace) {
      return notFoundResponse(res, "workSpace not found");
    }

    logger.info("workSpace deleted successfully", { workspaceId: id });
    return successResponse(res, { id: workspace.id }, "workSpace deleted successfully");
  } catch (error) {
    logger.error("Delete workspace error", { error: error.message, workspaceId: req.params.id });
    return errorResponse(res, "Failed to delete workspace", 500);
  }
}

export async function assignUserToWorkSpace(req, res) {
  try {
    const empId = Number(req.body.empId);
    const workspaceId = Number(req.body.workspaceId);

    if (!empId || !workspaceId) {
      return errorResponse(res, "empId and workspaceId are required", 400);
    }

    const lastWorkspaceMember = await WorkspaceMember.findOne().sort({ id: -1 });
    const nextId = lastWorkspaceMember ? Number(lastWorkspaceMember.id) + 1 : 1;

    await WorkspaceMember.create({
      id: nextId,
      empId,
      workspaceId,
      active: true,
    });

    return successResponse(res, { empId, workspaceId }, "User assigned to workspace successfully", 200);
  } catch (error) {
    logger.error("Assign user to workspace error", { error: error.message });
    return errorResponse(res, "Failed to assign user to workspace", 500);
  }
}
  