import { ChatChannel } from "../models/chatChannelModel.js";

export async function sendMessage(req, res) {
    try {
        const { senderId, channelId, workspaceId, message } = req.body;

        // Basic validation
        if (!senderId || !workspaceId || !message) {
            return res.status(400).json({
                success: false,
                message: "senderId, workspaceId, and message are required."
            });
        }
        const lastChat = await ChatChannel.findOne().sort({ id: -1 });
        const nextId = lastChat ? Number(lastChat.id) + 1 : 1;
        // Removed broken auto-incrementing logic, MongoDB uses _id.
        // If you do need an incrementing message id, use a counter collection.
        const savedMessage = await ChatChannel.create({
            id: nextId,
            senderId,
            channelId,
            workspaceId,
            message
        });

        // `io` may not be defined here: use req.app.get("io") if it's set in main app,
        // or inject io through dependency injection pattern.
        let io = req.app && req.app.get && req.app.get("io");
        if (!io && typeof global !== "undefined" && global.io) {
            io = global.io;
        }
      
        const room = channelId
            ? `channel-${workspaceId}-${channelId}`
            : `workspace-${workspaceId}`;

        if (io) {
            io.to(room).emit("receive_message", {
                workspaceId,
                channelId,
                message,
                senderId,
                timestamp: savedMessage.createdAt,
            });
        }

        res.status(201).json({
            success: true,
            message: "Message sent.",
            data: savedMessage
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err.message
        });
    }
}
export async function getChannelMessages(req, res) {
    try {
       
        const { workspaceId } = req.params;
        const { channelId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required."
            });
        }

        // Build query object
        const query = { workspaceId };
        if (channelId) query.channelId = channelId;

        const messages = await ChatChannel.find(query).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            message: "Messages retrieved.",
            data: messages
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err.message
        });
    }
}