import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import { connectDB } from "./config/db.js";
import channelsRoutes from "./routes/channels.routes.js";

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/channels", channelsRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

export default app;
