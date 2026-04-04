import express from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  getUsers,
  getUsersByRole,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/register",  registerUser);
router.post("/login",  loginUser);
router.get("/getUsers",  getUsers);
router.get("/getUserById/:id",  getUserById);
router.post("/getUsersByRole", getUsersByRole);
router.patch("/updateUserStatus/:id",  updateUserStatus);

// Admin only routes
router.put(
  "/updateUser/:id",
  updateUser
);
router.delete(
  "/deleteUser/:id",
  deleteUser
);

export default router;
