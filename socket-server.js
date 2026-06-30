// =================================================================================
// FARMLINK AI - SCALABLE WEBSOCKET SERVER MICROSERVICE
// =================================================================================
// This standalone server manages real-time chat, bid ticks, and dispatch tracking.
// Supports Redis adapters for horizontal clustering across multi-core container nodes.

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.SOCKET_PORT || 3001;

// Create standalone HTTP Server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("FarmLink AI Socket Server - Operational\n");
});

// Configure Socket.IO Server with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to specific NEXT_PUBLIC_APP_URL in production
    methods: ["GET", "POST"]
  }
});

// Optional Redis clustering adapter integration (if REDIS_URL exists)
if (process.env.REDIS_URL) {
  try {
    const { createClient } = require("redis");
    const { createAdapter } = require("@socket.io/redis-adapter");
    
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✓ Socket.IO Redis adapter connected successfully.");
    });
  } catch (err) {
    console.warn("⚠ Redis adapter failed to load. Defaulting to in-memory adapter.");
  }
}

// Client status registry
const activeUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`Connected client: ${socket.id}`);

  // User online registry
  socket.on("user:status", ({ userId, name, status }) => {
    activeUsers.set(userId, { socketId: socket.id, name, status });
    socket.userId = userId;
    
    // Broadcast user online states to all clients
    io.emit("user:status:update", Array.from(activeUsers.entries()).map(([uid, details]) => ({
      userId: uid,
      name: details.name,
      status: details.status
    })));
  });

  // Room linking
  socket.on("room:join", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Event 1: Chat message delivery
  socket.on("message:send", (payload) => {
    const { roomId, senderId, senderName, text, image, audio } = payload;
    
    // Broadcast message to room members
    io.to(roomId).emit("message:received", {
      id: `msg_${Date.now()}`,
      senderId,
      senderName,
      text,
      image,
      audio,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Event 2: Real-time price negotiation bid ticks
  socket.on("bid:update", (payload) => {
    const { listingId, cropName, bidderName, bidAmount } = payload;
    
    // Broadcast auction ticks globally
    io.emit("bid:tick", {
      listingId,
      cropName,
      bidderName,
      bidAmount,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Event 3: Real-time dispatch coordinates updates
  socket.on("order:update", (payload) => {
    const { orderId, trackingStep, status, location } = payload;
    
    // Send delivery ticks to specific tracking room
    io.to(orderId).emit("order:progress", {
      orderId,
      trackingStep,
      status,
      location,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Event 4: Typing indicators
  socket.on("typing:start", ({ roomId, userName }) => {
    socket.to(roomId).emit("typing:status", { roomId, userName, isTyping: true });
  });

  socket.on("typing:stop", ({ roomId, userName }) => {
    socket.to(roomId).emit("typing:status", { roomId, userName, isTyping: false });
  });

  // Disconnection cleanup
  socket.on("disconnect", () => {
    console.log(`Disconnected client: ${socket.id}`);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit("user:status:update", Array.from(activeUsers.entries()).map(([uid, details]) => ({
        userId: uid,
        name: details.name,
        status: details.status
      })));
    }
  });
});

// Launch server
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🌾 FarmLink AI Socket.IO Server live on port ${PORT}`);
  console.log(`======================================================`);
});
