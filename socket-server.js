import http from "http";
import { Server } from "socket.io";
import { decode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import DOMPurify from "isomorphic-dompurify";

const prisma = new PrismaClient();
const PORT = process.env.SOCKET_PORT || 3001;

// Create standalone HTTP Server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("FarmLink AI Socket Server - Operational\n");
});

// Configure Socket.IO Server with CORS
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Optional Redis clustering adapter integration (if REDIS_URL exists)
if (process.env.REDIS_URL) {
  try {
    const { createClient } = await import("redis");
    const { createAdapter } = await import("@socket.io/redis-adapter");
    
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

function getCookie(cookieString, name) {
  if (!cookieString) return null;
  const pairs = cookieString.split(";");
  
  // 1. Try to read single cookie case first
  for (let pair of pairs) {
    const parts = pair.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=")?.trim();
    if (key === name) return decodeURIComponent(value);
  }

  // 2. Try to read chunked cookies (name.0, name.1, etc.)
  const chunks = [];
  for (let pair of pairs) {
    const parts = pair.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=")?.trim();
    if (key && key.startsWith(name + ".")) {
      const index = parseInt(key.substring(name.length + 1), 10);
      if (!isNaN(index)) {
        chunks[index] = decodeURIComponent(value);
      }
    }
  }

  if (chunks.length > 0) {
    return chunks.join("");
  }

  return null;
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || 
                  getCookie(socket.handshake.headers?.cookie, "next-auth.session-token") || 
                  getCookie(socket.handshake.headers?.cookie, "__Secure-next-auth.session-token");

    if (!token) {
      console.warn("authentication failed");
      socket.disconnect(true);
      return next(new Error("Authentication failed"));
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.warn("authentication failed");
      socket.disconnect(true);
      return next(new Error("Authentication failed"));
    }

    const decoded = await decode({
      token,
      secret
    });

    if (!decoded) {
      console.warn("authentication failed");
      socket.disconnect(true);
      return next(new Error("Authentication failed"));
    }

    // Store verified userId and role on the socket instance itself
    socket.data = socket.data || {};
    socket.data.userId = decoded.id;
    socket.data.role = decoded.role;
    socket.data.name = decoded.name;

    console.log(`Authenticated user ${decoded.id} with role ${decoded.role}`);
    next();
  } catch (err) {
    console.warn("authentication failed");
    socket.disconnect(true);
    next(new Error("Authentication failed"));
  }
});

// Rate limiting cache (socket.id -> timestamps)
const rateLimits = new Map();

// Rate limiting helper: max 'limit' events per 'windowMs' milliseconds per connection
function checkRateLimit(socket, limit = 10, windowMs = 10000) {
  const now = Date.now();
  if (!rateLimits.has(socket.id)) {
    rateLimits.set(socket.id, []);
  }
  
  let timestamps = rateLimits.get(socket.id).filter((t) => now - t < windowMs);
  
  if (timestamps.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  timestamps.push(now);
  rateLimits.set(socket.id, timestamps);
  return true;
}

io.on("connection", (socket) => {
  console.log(`Connected client: ${socket.id}`);

  // User online registry
  socket.on("user:status", (payload = {}) => {
    const { userId, name, status } = payload;
    const verifiedUserId = socket.data.userId;
    const verifiedName = socket.data.name || name || "Unknown User";

    if (userId && userId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied userId (${userId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    activeUsers.set(verifiedUserId, { socketId: socket.id, name: verifiedName, status: status || "online" });
    socket.userId = verifiedUserId;
    
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
  socket.on("message:send", async (payload = {}) => {
    // 1. Rate limiting check (max 10 events per 10 seconds per connection)
    if (!checkRateLimit(socket, 10, 10000)) {
      socket.emit("error:rate-limit", { message: "Too many messages. Please wait a moment." });
      console.warn(`Rate limit exceeded on message:send for socket ${socket.id}`);
      return;
    }

    const { roomId, senderId, senderName, text, image, audio } = payload;
    const verifiedUserId = socket.data.userId;
    const verifiedName = socket.data.name || senderName || "Anonymous";

    if (senderId && senderId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied senderId (${senderId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    try {
      // 2. Escape/Sanitize text content using DOMPurify (strip all HTML tags to prevent stored/reflected XSS)
      const sanitizedText = DOMPurify.sanitize(text || "", { ALLOWED_TAGS: [] });

      // 3. Persist the message record to the database
      const chatMsg = await prisma.chatMessage.create({
        data: {
          roomId,
          senderId: verifiedUserId,
          senderName: verifiedName,
          text: sanitizedText,
          image: image || null,
          audio: !!audio
        }
      });

      // Broadcast message to room members
      io.to(roomId).emit("message:received", {
        id: chatMsg.id,
        senderId: verifiedUserId,
        senderName: verifiedName,
        text: sanitizedText,
        image: chatMsg.image,
        audio: chatMsg.audio,
        timestamp: chatMsg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error("Failed to process chat message send:", err);
      socket.emit("message:error", { message: "Failed to send message" });
    }
  });

  // Event 2: Real-time price negotiation bid ticks
  socket.on("bid:update", async (payload = {}) => {
    // 1. Rate limiting check (max 10 events per 10 seconds per connection)
    if (!checkRateLimit(socket, 10, 10000)) {
      socket.emit("error:rate-limit", { message: "Too many bids. Please wait a moment." });
      console.warn(`Rate limit exceeded on bid:update for socket ${socket.id}`);
      return;
    }

    const { listingId, cropName, bidderName, bidderId, bidAmount } = payload;
    const verifiedUserId = socket.data.userId;
    const verifiedName = socket.data.name || bidderName || "Bidder";

    if (bidderId && bidderId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied bidderId (${bidderId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    try {
      const parsedAmount = parseFloat(bidAmount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
        socket.emit("bid:error", { message: "Bid amount must be a positive number." });
        return;
      }

      // 2. Persist the bid and update listing price inside an interactive transaction to prevent race conditions
      await prisma.$transaction(async (tx) => {
        // Enforce database-level row lock using SELECT ... FOR UPDATE
        const listings = await tx.$queryRaw`
          SELECT * FROM "CropListing" 
          WHERE id = ${listingId} 
          FOR UPDATE
        `;
        const listing = listings && (listings as any)[0];

        if (!listing) {
          throw new Error("Listing not found");
        }

        if (parsedAmount <= listing.price) {
          throw new Error("Bid amount must be strictly greater than the current price");
        }

        await tx.bid.create({
          data: {
            listingId,
            bidderId: verifiedUserId,
            bidderName: verifiedName,
            amount: parsedAmount
          }
        });

        await tx.cropListing.update({
          where: { id: listingId },
          data: { price: parsedAmount }
        });
      });

      // Broadcast auction ticks to listing-specific room
      io.to(`listing:${listingId}`).emit("bid:tick", {
        listingId,
        cropName,
        bidderId: verifiedUserId,
        bidderName: verifiedName,
        bidAmount: parsedAmount,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error("Failed to process bid update:", err);
      socket.emit("bid:error", { message: err.message || "Failed to submit bid update" });
    }
  });

  // Event 3: Real-time dispatch coordinates updates
  socket.on("order:update", (payload = {}) => {
    const { orderId, trackingStep, status, location, userId } = payload;
    const verifiedUserId = socket.data.userId;

    if (userId && userId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied userId (${userId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    // Send delivery ticks to specific tracking room
    io.to(orderId).emit("order:progress", {
      orderId,
      trackingStep,
      status,
      location,
      updatedBy: verifiedUserId,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Event 4: Live push notifications (Targeted or Global)
  socket.on("notification:push", (payload = {}) => {
    const { userId, message, type } = payload;
    const verifiedUserId = socket.data.userId;

    const notification = {
      id: `notif_${Date.now()}`,
      message,
      type: type || "info",
      senderId: verifiedUserId,
      timestamp: new Date().toLocaleTimeString()
    };

    if (userId) {
      // Target specific user connection socket
      const active = activeUsers.get(userId);
      if (active) {
        io.to(active.socketId).emit("notification:receive", notification);
      }
    } else {
      // Broadcast globally
      io.emit("notification:receive", notification);
    }
  });

  // Event 5: Typing indicators
  socket.on("typing:start", (payload = {}) => {
    const { roomId, userName, userId } = payload;
    const verifiedUserId = socket.data.userId;
    const verifiedName = socket.data.name || userName || "Someone";

    if (userId && userId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied userId (${userId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    socket.to(roomId).emit("typing:status", { 
      roomId, 
      userName: verifiedName, 
      userId: verifiedUserId, 
      isTyping: true 
    });
  });

  socket.on("typing:stop", (payload = {}) => {
    const { roomId, userName, userId } = payload;
    const verifiedUserId = socket.data.userId;
    const verifiedName = socket.data.name || userName || "Someone";

    if (userId && userId !== verifiedUserId) {
      console.warn(`Warning: Client-supplied userId (${userId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
    }

    socket.to(roomId).emit("typing:status", { 
      roomId, 
      userName: verifiedName, 
      userId: verifiedUserId, 
      isTyping: false 
    });
  });

  // Disconnection cleanup
  socket.on("disconnect", () => {
    console.log(`Disconnected client: ${socket.id}`);
    rateLimits.delete(socket.id);
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
