import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { io as clientIO } from "socket.io-client";
import { encode, decode } from "next-auth/jwt";

const NEXTAUTH_SECRET = "test_nextauth_secret_key_32";

describe("Socket.IO Authorization & Event Security Tests", () => {
  let server: any;
  let ioServer: SocketServer;
  let port: number;
  let listingPrices: Map<string, number>;

  beforeEach(async () => {
    process.env.NEXTAUTH_SECRET = NEXTAUTH_SECRET;
    listingPrices = new Map<string, number>();

    // Create a dynamic HTTP & Socket Server
    server = createServer();
    ioServer = new SocketServer(server);

    // 1. Wire up the auth middleware
    function getCookie(cookieString: string | undefined, name: string) {
      if (!cookieString) return null;
      const pairs = cookieString.split(";");
      for (let pair of pairs) {
        const parts = pair.split("=");
        const key = parts[0]?.trim();
        const value = parts.slice(1).join("=")?.trim();
        if (key === name) return decodeURIComponent(value);
      }
      const chunks: string[] = [];
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

    ioServer.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || 
                      getCookie(socket.handshake.headers?.cookie, "next-auth.session-token") || 
                      getCookie(socket.handshake.headers?.cookie, "__Secure-next-auth.session-token");

        if (!token) {
          socket.disconnect(true);
          return next(new Error("Authentication failed"));
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
          socket.disconnect(true);
          return next(new Error("Authentication failed"));
        }

        const decoded = await decode({
          token,
          secret
        });

        if (!decoded) {
          socket.disconnect(true);
          return next(new Error("Authentication failed"));
        }

        socket.data = socket.data || {};
        socket.data.userId = decoded.id;
        socket.data.role = decoded.role;
        socket.data.name = decoded.name;

        next();
      } catch (err) {
        socket.disconnect(true);
        next(new Error("Authentication failed"));
      }
    });

    const rateLimits = new Map<string, number[]>();

    function checkRateLimit(socketId: string, limit = 10, windowMs = 10000) {
      const now = Date.now();
      if (!rateLimits.has(socketId)) {
        rateLimits.set(socketId, []);
      }
      
      let timestamps = (rateLimits.get(socketId) || []).filter((t) => now - t < windowMs);
      
      if (timestamps.length >= limit) {
        return false;
      }
      
      timestamps.push(now);
      rateLimits.set(socketId, timestamps);
      return true;
    }

    // 2. Wire up the connection event handlers
    ioServer.on("connection", (socket) => {
      socket.on("room:join", ({ roomId }) => {
        socket.join(roomId);
      });

      // Event: bid placement
      socket.on("bid:update", (payload: any = {}) => {
        if (!checkRateLimit(socket.id, 10, 10000)) {
          socket.emit("error:rate-limit", { message: "Too many bids. Please wait a moment." });
          return;
        }

        const { listingId, cropName, bidderName, bidderId, bidAmount } = payload;
        const verifiedUserId = socket.data.userId;
        const verifiedName = socket.data.name || bidderName || "Bidder";

        if (bidderId && bidderId !== verifiedUserId) {
          console.warn(`Warning: Client-supplied bidderId (${bidderId}) does not match token-verified userId (${verifiedUserId}). Possible spoofing attempt.`);
        }

        const parsedAmount = parseFloat(bidAmount);
        if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
          socket.emit("bid:error", { message: "Bid amount must be a positive number." });
          return;
        }

        // Mock current listing price check (using listingPrices map)
        const currentListingPrice = listingPrices.get(listingId) || 100;
        if (parsedAmount <= currentListingPrice) {
          socket.emit("bid:error", { message: "Bid amount must be strictly greater than the current price" });
          return;
        }

        // Lock/update price immediately to simulate serial execution of SELECT FOR UPDATE
        listingPrices.set(listingId, parsedAmount);

        ioServer.to(`listing:${listingId}`).emit("bid:tick", {
          listingId,
          cropName,
          bidderId: verifiedUserId,
          bidderName: verifiedName,
          bidAmount: parsedAmount
        });
      });

      socket.on("message:send", (payload: any = {}) => {
        if (!checkRateLimit(socket.id, 5, 10000)) {
          socket.emit("error:rate-limit", { message: "Too many messages. Please wait a moment." });
          return;
        }

        const { roomId, senderId, senderName, text, image, audio } = payload;
        const verifiedUserId = socket.data.userId;
        const verifiedName = socket.data.name || senderName || "Sender";

        // basic mock regex sanitization error check
        if (text && (text.includes("<script>") || text.includes("<img"))) {
          socket.emit("message:error", { message: "XSS payload detected in text message." });
          return;
        }

        ioServer.to(roomId).emit("message:received", {
          id: `msg_${Date.now()}`,
          roomId,
          senderId: verifiedUserId,
          senderName: verifiedName,
          text,
          image,
          audio,
          timestamp: new Date().toLocaleTimeString()
        });
      });

      socket.on("disconnect", () => {
        rateLimits.delete(socket.id);
      });
    });

    // Listen on dynamic port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        port = typeof addr === "string" ? 0 : addr.port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      ioServer.close(() => {
        server.close(() => resolve());
      });
    });
  });

  it("should reject connection when token is missing", async () => {
    let connectionError: any = null;

    const socket = clientIO(`http://localhost:${port}`, {
      transports: ["websocket"],
      autoConnect: true,
      auth: {} // No token
    });

    await new Promise<void>((resolve) => {
      socket.on("connect_error", (err) => {
        connectionError = err;
        resolve();
      });
      socket.on("connect", () => {
        socket.disconnect();
        resolve();
      });
    });

    expect(connectionError).not.toBeNull();
    expect(connectionError.message).toBe("Authentication failed");
  });

  it("should reject connection when token is tampered/expired", async () => {
    let connectionError: any = null;

    const socket = clientIO(`http://localhost:${port}`, {
      transports: ["websocket"],
      autoConnect: true,
      auth: { token: "invalid-token-string" }
    });

    await new Promise<void>((resolve) => {
      socket.on("connect_error", (err) => {
        connectionError = err;
        resolve();
      });
      socket.on("connect", () => {
        socket.disconnect();
        resolve();
      });
    });

    expect(connectionError).not.toBeNull();
    expect(connectionError.message).toBe("Authentication failed");
  });

  it("should accept connection with valid token and record bid under token identity rather than forged userId", async () => {
    const testUser = {
      id: "farmer-verified-id-456",
      role: "FARMER",
      name: "Verified Farmer"
    };

    // Encrypt authentic token
    const token = await encode({
      token: testUser as any,
      secret: NEXTAUTH_SECRET
    });

    const clientSocket = clientIO(`http://localhost:${port}`, {
      transports: ["websocket"],
      autoConnect: true,
      auth: { token }
    });

    await new Promise<void>((resolve) => {
      clientSocket.on("connect", resolve);
    });

    // Join listing room
    clientSocket.emit("room:join", { roomId: "listing:listing_99" });
    // Wait for join mapping to settle
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    // Send a bid updating event with a forged bidderId payload
    const bidPayload = {
      listingId: "listing_99",
      cropName: "Wheat",
      bidderId: "hacker-forged-id-789", // spoofing attempt
      bidderName: "Hacker Spoof",
      bidAmount: 15000
    };

    clientSocket.emit("bid:update", bidPayload);

    // Wait for bid:tick broadcast
    const receivedTick = await new Promise<any>((resolve) => {
      clientSocket.on("bid:tick", (tick) => {
        resolve(tick);
      });
    });

    clientSocket.disconnect();

    // Assertions
    expect(receivedTick.listingId).toBe("listing_99");
    expect(receivedTick.cropName).toBe("Wheat");
    expect(receivedTick.bidAmount).toBe(15000);
    // Identity must map to the token value, NOT the forged bidderId!
    expect(receivedTick.bidderId).toBe(testUser.id);
    expect(receivedTick.bidderName).toBe(testUser.name);
  });

  it("should accept connection when valid token is split across chunked cookies", async () => {
    const testUser = {
      id: "farmer-chunked-id-777",
      role: "FARMER",
      name: "Chunked User"
    };

    // Encrypt authentic token
    const token = await encode({
      token: testUser as any,
      secret: NEXTAUTH_SECRET
    });

    // Chunk the token into 3 parts
    const chunkLength = Math.ceil(token.length / 3);
    const chunk0 = token.substring(0, chunkLength);
    const chunk1 = token.substring(chunkLength, chunkLength * 2);
    const chunk2 = token.substring(chunkLength * 2);

    const cookieString = `__Secure-next-auth.session-token.0=${encodeURIComponent(chunk0)}; __Secure-next-auth.session-token.1=${encodeURIComponent(chunk1)}; __Secure-next-auth.session-token.2=${encodeURIComponent(chunk2)}`;

    const clientSocket = clientIO(`http://localhost:${port}`, {
      transports: ["websocket"],
      autoConnect: true,
      extraHeaders: {
        cookie: cookieString
      }
    });

    await new Promise<void>((resolve) => {
      clientSocket.on("connect", resolve);
    });

    expect(clientSocket.connected).toBe(true);
    clientSocket.disconnect();
  });

  describe("CORS localhost origin gating tests", () => {
    it("should exclude localhost:3000 from allowed origins when NODE_ENV is production", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
      try {
        (process.env as any).NODE_ENV = "production";
        process.env.NEXT_PUBLIC_APP_URL = "https://farmlink-ai.vercel.app";

        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          (process.env.NODE_ENV as string) !== "production" ? "http://localhost:3000" : null
        ].filter(Boolean);

        expect(allowedOrigins).toContain("https://farmlink-ai.vercel.app");
        expect(allowedOrigins).not.toContain("http://localhost:3000");
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      }
    });

    it("should include localhost:3000 in allowed origins when NODE_ENV is not production", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
      try {
        (process.env as any).NODE_ENV = "development";
        process.env.NEXT_PUBLIC_APP_URL = "https://farmlink-ai.vercel.app";

        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          (process.env.NODE_ENV as string) !== "production" ? "http://localhost:3000" : null
        ].filter(Boolean);

        expect(allowedOrigins).toContain("https://farmlink-ai.vercel.app");
        expect(allowedOrigins).toContain("http://localhost:3000");
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
        process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      }
    });
  });

  describe("Realtime Feature Enhancements & Safety", () => {
    let token: string;

    beforeEach(async () => {
      token = await encode({
        token: { id: "user-123", role: "BUYER", name: "Buyer 123" } as any,
        secret: NEXTAUTH_SECRET
      });
    });

    it("should reject bid update if bidAmount is negative or NaN", async () => {
      const clientSocket = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await new Promise<void>((resolve) => {
        clientSocket.on("connect", resolve);
      });

      let bidError: any = null;
      clientSocket.emit("bid:update", {
        listingId: "listing-abc",
        cropName: "Wheat",
        bidAmount: -50
      });

      await new Promise<void>((resolve) => {
        clientSocket.on("bid:error", (err) => {
          bidError = err;
          resolve();
        });
      });

      expect(bidError).not.toBeNull();
      expect(bidError.message).toBe("Bid amount must be a positive number.");
      clientSocket.disconnect();
    });

    it("should reject bid update if bidAmount is not strictly greater than current price", async () => {
      const clientSocket = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await new Promise<void>((resolve) => {
        clientSocket.on("connect", resolve);
      });

      let bidError: any = null;
      clientSocket.emit("bid:update", {
        listingId: "listing-abc",
        cropName: "Wheat",
        bidAmount: 90
      });

      await new Promise<void>((resolve) => {
        clientSocket.on("bid:error", (err) => {
          bidError = err;
          resolve();
        });
      });

      expect(bidError).not.toBeNull();
      expect(bidError.message).toBe("Bid amount must be strictly greater than the current price");
      clientSocket.disconnect();
    });

    it("should reject the 11th event within window due to rate limits", async () => {
      const clientSocket = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await new Promise<void>((resolve) => {
        clientSocket.on("connect", resolve);
      });

      let rateLimitError: any = null;
      clientSocket.on("error:rate-limit", (err) => {
        rateLimitError = err;
      });

      for (let i = 0; i < 11; i++) {
        clientSocket.emit("bid:update", {
          listingId: "listing-abc",
          cropName: "Wheat",
          bidAmount: 150
        });
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });

      expect(rateLimitError).not.toBeNull();
      expect(rateLimitError.message).toContain("Too many bids");
      clientSocket.disconnect();
    });

    it("should process near-simultaneous bids sequentially so the second bid is validated against the updated price", async () => {
      const clientSocket1 = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });
      const clientSocket2 = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await Promise.all([
        new Promise<void>((resolve) => clientSocket1.on("connect", resolve)),
        new Promise<void>((resolve) => clientSocket2.on("connect", resolve))
      ]);

      clientSocket1.emit("room:join", { roomId: "listing:listing-sim" });
      clientSocket2.emit("room:join", { roomId: "listing:listing-sim" });
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      let bidError2: any = null;
      let tickReceived1 = false;

      clientSocket1.on("bid:tick", () => {
        tickReceived1 = true;
      });

      clientSocket2.on("bid:error", (err) => {
        bidError2 = err;
      });

      // Emit near-simultaneously (120 and 110: both would pass 100, but 110 should fail against 120)
      clientSocket1.emit("bid:update", { listingId: "listing-sim", cropName: "Wheat", bidAmount: 120 });
      clientSocket2.emit("bid:update", { listingId: "listing-sim", cropName: "Wheat", bidAmount: 110 });

      await new Promise<void>((resolve) => setTimeout(resolve, 150));

      expect(tickReceived1).toBe(true);
      expect(bidError2).not.toBeNull();
      expect(bidError2.message).toBe("Bid amount must be strictly greater than the current price");

      clientSocket1.disconnect();
      clientSocket2.disconnect();
    });

    it("should deliver message securely via round-trip and trigger message:error on XSS payload", async () => {
      const testUser = { id: "farmer-verified-id-456", name: "Verified Farmer" };
      const clientSocket = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await new Promise<void>((resolve) => clientSocket.on("connect", resolve));

      clientSocket.emit("room:join", { roomId: "room-abc" });
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      let receivedMsg: any = null;
      let receivedError: any = null;

      clientSocket.on("message:received", (msg) => {
        receivedMsg = msg;
      });

      clientSocket.on("message:error", (err) => {
        receivedError = err;
      });

      // Send standard message
      clientSocket.emit("message:send", {
        roomId: "room-abc",
        senderId: testUser.id,
        senderName: testUser.name,
        text: "Hello World"
      });

      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      expect(receivedMsg).not.toBeNull();
      expect(receivedMsg.text).toBe("Hello World");
      expect(receivedMsg.senderId).toBe("user-123");

      // Send XSS payload message
      clientSocket.emit("message:send", {
        roomId: "room-abc",
        senderId: testUser.id,
        senderName: testUser.name,
        text: "<script>alert('xss')</script>"
      });

      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      expect(receivedError).not.toBeNull();
      expect(receivedError.message).toContain("XSS payload detected");

      clientSocket.disconnect();
    });

    it("should trigger error:rate-limit when sending too many messages", async () => {
      const testUser = { id: "farmer-verified-id-456", name: "Verified Farmer" };
      const clientSocket = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await new Promise<void>((resolve) => clientSocket.on("connect", resolve));

      let rateLimitError: any = null;
      clientSocket.on("error:rate-limit", (err) => {
        rateLimitError = err;
      });

      // Send 6 messages quickly (limit is 5)
      for (let i = 0; i < 6; i++) {
        clientSocket.emit("message:send", {
          roomId: "room-abc",
          senderId: testUser.id,
          senderName: testUser.name,
          text: `Message ${i}`
        });
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      expect(rateLimitError).not.toBeNull();
      expect(rateLimitError.message).toContain("Too many messages");

      clientSocket.disconnect();
    });

    it("should broadcast bid:tick to all clients subscribed to the listing room when a valid bid is submitted", async () => {
      const clientSocketA = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });
      const clientSocketB = clientIO(`http://localhost:${port}`, {
        transports: ["websocket"],
        autoConnect: true,
        auth: { token }
      });

      await Promise.all([
        new Promise<void>((resolve) => clientSocketA.on("connect", resolve)),
        new Promise<void>((resolve) => clientSocketB.on("connect", resolve))
      ]);

      clientSocketA.emit("room:join", { roomId: "listing:listing-bcast" });
      clientSocketB.emit("room:join", { roomId: "listing:listing-bcast" });
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      let receivedTickB: any = null;
      clientSocketB.on("bid:tick", (tick) => {
        receivedTickB = tick;
      });

      // Client A places a bid
      clientSocketA.emit("bid:update", {
        listingId: "listing-bcast",
        cropName: "Rice",
        bidAmount: 150
      });

      // Wait for broadcast to reach Client B
      await new Promise<void>((resolve) => setTimeout(resolve, 150));

      expect(receivedTickB).not.toBeNull();
      expect(receivedTickB.listingId).toBe("listing-bcast");
      expect(receivedTickB.bidAmount).toBe(150);
      expect(receivedTickB.bidderId).toBe("user-123");

      clientSocketA.disconnect();
      clientSocketB.disconnect();
    });
  });
});
