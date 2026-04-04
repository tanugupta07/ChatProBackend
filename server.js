import http from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import { Server } from 'socket.io';
// Load environment variables
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join Workspace
    socket.on("join_workspace", (workspaceId) => {
        socket.join(`workspace-${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    // Leave Workspace
    socket.on("leave_workspace", (workspaceId) => {
        socket.leave(`workspace-${workspaceId}`);
        console.log(`Socket ${socket.id} left workspace ${workspaceId}`);
    });

    // Join Channel
    socket.on("join_channel", ({ workspaceId, channelId }) => {
        const room = `channel-${workspaceId}-${channelId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined channel room ${room}`);
    });

    // Leave Channel
    socket.on("leave_channel", ({ workspaceId, channelId }) => {
        const room = `channel-${workspaceId}-${channelId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left channel room ${room}`);
    });

    // Send Message
    socket.on("send_message", ({ workspaceId, message, channelId }) => {
        const room = channelId
            ? `channel-${workspaceId}-${channelId}`
            : `workspace-${workspaceId}`;
        io.to(room).emit("receive_message", {
            workspaceId,
            channelId,
            message,
            senderSocketId: socket.id,
            timestamp: new Date().toISOString(),
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});