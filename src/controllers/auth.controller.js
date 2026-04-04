import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/token.js";
import { User } from "../models/userModel.js";
import { successResponse, errorResponse, notFoundResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export async function registerUser(req, res) {
  try {
    const { name, email, mobile, password, role , comanyId} = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409);
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return errorResponse(res, "Mobile number already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get last user id
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const user = await User.create({
      id: nextId,
      name,
      email,
      mobile,
      password: hashedPassword,
      authcode: password,
      role: role || "workspace_owner",
      comanyId: comanyId || null,
      active: true,
    });

    const token = generateAccessToken(user);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      comanyId: user.comanyId || null,
      authcode: user.authcode,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, { user: userResponse, token }, "User registered successfully", 200);
  } catch (error) {
    return errorResponse(res, "Failed to register user", 500);
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });    
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }   
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return errorResponse(res, "Invalid email or password", 401);
    }
    // Generate token
    const token = generateAccessToken(user);
    // Remove sensitive data before sending response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    logger.info("User logged in successfully", { userId: user.id, email: user.email });
    return successResponse(res, { user: userResponse, token }, "Login successful");
  } catch (error) {
    logger.error("Login error", { error: error.message });
    return errorResponse(res, "Failed to login", 500);
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -authcode");

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    return successResponse(res, user, "User found");
  } catch (error) {
    logger.error("Get user by ID error", { error: error.message, userId: req.params.id });
    return errorResponse(res, "Failed to fetch user", 500);
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password -authcode").sort({ createdAt: -1 });
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    logger.error("Get users error", { error: error.message });
    return errorResponse(res, "Failed to fetch users", 500);
  }
}

export async function getUsersByRole(req, res) {
  try {
    const { role } = req.body;
    const users = await User.find({ role }).select("-password -authcode").sort({ createdAt: -1 });

    if (users.length === 0) {
      return successResponse(res, [], "No users found for this role");
    }

    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    logger.error("Get users by role error", { error: error.message });
    return errorResponse(res, "Failed to fetch users", 500);
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow password updates through this endpoint
    delete updateData.password;
    delete updateData.authcode;

    // If email is being updated, check for duplicates
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email, id: { $ne: id } });
      if (existingUser) {
        return errorResponse(res, "Email already exists", 409);
      }
    }

    // If mobile is being updated, check for duplicates
    if (updateData.mobile) {
      const existingMobile = await User.findOne({ mobile: updateData.mobile, id: { $ne: id } });
      if (existingMobile) {
        return errorResponse(res, "Mobile number already exists", 409);
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -authcode");

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    logger.info("User updated successfully", { userId: id });
    return successResponse(res, user, "User updated successfully");
  } catch (error) {
    logger.error("Update user error", { error: error.message, userId: req.params.id });
    return errorResponse(res, "Failed to update user", 500);
  }
}
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(id, { active }, { new: true }).select("-password -authcode");
    if (!user) {
      return notFoundResponse(res, "User not found");
    }
    logger.info("User status updated successfully", { userId: id, active: user.active });
    return successResponse(res, user, "User status updated successfully");
  } catch (error) {
    logger.error("Update user status error", { error: error.message, userId: req.params.id });
    return errorResponse(res, "Failed to update user status", 500);
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user && req.user.id === id) {
      return errorResponse(res, "You cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    logger.info("User deleted successfully", { userId: id });
    return successResponse(res, { id: user.id }, "User deleted successfully");
  } catch (error) {
    logger.error("Delete user error", { error: error.message, userId: req.params.id });
    return errorResponse(res, "Failed to delete user", 500);
  }
}
  