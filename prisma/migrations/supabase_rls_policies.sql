-- ==============================================================================
-- Supabase Row Level Security (RLS) policies for FarmLink AI
-- ==============================================================================
-- WARNING: Since Prisma DATABASE_URL connects as the 'postgres' superuser/owner,
-- these RLS policies will be bypassed by Prisma Client queries by default.
-- To restrict direct database access via the exposed Supabase REST/PostgREST APIs
-- (which use anon/authenticated roles), we enable RLS on all public tables.
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CropListing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GovernmentScheme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FarmerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BuyerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderDispute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bid" ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- A. User Table Policies
-- ==========================================
CREATE POLICY "Public profiles are viewable by anyone" ON "User"
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile records" ON "User"
  FOR UPDATE USING (auth.uid()::text = id OR is_admin());

CREATE POLICY "Users can delete their own profile" ON "User"
  FOR DELETE USING (auth.uid()::text = id OR is_admin());

-- ==========================================
-- B. CropListing Table Policies
-- ==========================================
CREATE POLICY "Crop listings are viewable by anyone" ON "CropListing"
  FOR SELECT USING (true);

CREATE POLICY "Farmers can insert their own crop listings" ON "CropListing"
  FOR INSERT WITH CHECK (
    (auth.uid()::text = "farmerId" AND 
     EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'FARMER'))
    OR is_admin()
  );

CREATE POLICY "Farmers can update their own crop listings" ON "CropListing"
  FOR UPDATE USING (auth.uid()::text = "farmerId" OR is_admin());

CREATE POLICY "Farmers can delete their own crop listings" ON "CropListing"
  FOR DELETE USING (auth.uid()::text = "farmerId" OR is_admin());

-- ==========================================
-- C. Order Table Policies
-- ==========================================
CREATE POLICY "Buyers and farmers can view their own orders" ON "Order"
  FOR SELECT USING (
    auth.uid()::text = "buyerId"
    OR EXISTS (
      SELECT 1 FROM "OrderItem" oi
      JOIN "CropListing" c ON oi."listingId" = c.id
      WHERE oi."orderId" = "Order".id AND c."farmerId" = auth.uid()::text
    )
    OR is_admin()
  );

CREATE POLICY "Buyers can place orders" ON "Order"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "buyerId" 
    OR is_admin()
  );

CREATE POLICY "Only related parties or admin can update order status" ON "Order"
  FOR UPDATE USING (
    auth.uid()::text = "buyerId"
    OR EXISTS (
      SELECT 1 FROM "OrderItem" oi
      JOIN "CropListing" c ON oi."listingId" = c.id
      WHERE oi."orderId" = "Order".id AND c."farmerId" = auth.uid()::text
    )
    OR is_admin()
  );

-- ==========================================
-- D. OrderItem Table Policies
-- ==========================================
CREATE POLICY "Users can view order items for their own orders" ON "OrderItem"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND (
        o."buyerId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM "CropListing" c
          WHERE c.id = "listingId" AND c."farmerId" = auth.uid()::text
        )
      )
    )
    OR is_admin()
  );

CREATE POLICY "Buyers can insert order items" ON "OrderItem"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND o."buyerId" = auth.uid()::text
    )
    OR is_admin()
  );

-- ==========================================
-- E. Booking Table Policies
-- ==========================================
CREATE POLICY "Users can view their own bookings" ON "Booking"
  FOR SELECT USING (auth.uid()::text = "userId" OR is_admin());

CREATE POLICY "Users can manage their own bookings" ON "Booking"
  FOR ALL USING (auth.uid()::text = "userId" OR is_admin());

-- ==========================================
-- F. ChatRoom Table Policies
-- ==========================================
CREATE POLICY "Users can view rooms they participate in" ON "ChatRoom"
  FOR SELECT USING (
    auth.uid()::text = "participantA" 
    OR auth.uid()::text = "participantB" 
    OR is_admin()
  );

CREATE POLICY "Users can create chat rooms" ON "ChatRoom"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "participantA" 
    OR auth.uid()::text = "participantB" 
    OR is_admin()
  );

-- ==========================================
-- G. ChatMessage Table Policies
-- ==========================================
CREATE POLICY "Users can view messages in rooms they participate in" ON "ChatMessage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ChatRoom" r
      WHERE r.id = "roomId" AND (
        r."participantA" = auth.uid()::text 
        OR r."participantB" = auth.uid()::text
      )
    )
    OR is_admin()
  );

CREATE POLICY "Users can send messages as themselves" ON "ChatMessage"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "senderId" 
    AND EXISTS (
      SELECT 1 FROM "ChatRoom" r
      WHERE r.id = "roomId" AND (
        r."participantA" = auth.uid()::text 
        OR r."participantB" = auth.uid()::text
      )
    )
  );

-- ==========================================
-- H. GovernmentScheme Table Policies
-- ==========================================
CREATE POLICY "Schemes are viewable by anyone" ON "GovernmentScheme"
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage schemes" ON "GovernmentScheme"
  FOR ALL USING (is_admin());

-- ==========================================
-- I. Payment Table Policies
-- ==========================================
CREATE POLICY "Related users can view payments" ON "Payment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND (
        o."buyerId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM "OrderItem" oi
          JOIN "CropListing" c ON oi."listingId" = c.id
          WHERE oi."orderId" = o.id AND c."farmerId" = auth.uid()::text
        )
      )
    )
    OR is_admin()
  );

CREATE POLICY "Related users can insert payments" ON "Payment"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND o."buyerId" = auth.uid()::text
    )
    OR is_admin()
  );

-- ==========================================
-- J. Transaction Table Policies
-- ==========================================
CREATE POLICY "Users can view their own transactions" ON "Transaction"
  FOR SELECT USING (auth.uid()::text = "userId" OR is_admin());

-- ==========================================
-- K. FarmerProfile Table Policies
-- ==========================================
CREATE POLICY "Farmer profiles are viewable by anyone" ON "FarmerProfile"
  FOR SELECT USING (true);

CREATE POLICY "Farmers can manage their own profiles" ON "FarmerProfile"
  FOR ALL USING (auth.uid()::text = "userId" OR is_admin());

-- ==========================================
-- L. BuyerProfile Table Policies
-- ==========================================
CREATE POLICY "Buyer profiles are viewable by anyone" ON "BuyerProfile"
  FOR SELECT USING (true);

CREATE POLICY "Buyers can manage their own profiles" ON "BuyerProfile"
  FOR ALL USING (auth.uid()::text = "userId" OR is_admin());

-- ==========================================
-- M. Notification Table Policies
-- ==========================================
CREATE POLICY "Users can view their own notifications" ON "Notification"
  FOR SELECT USING (auth.uid()::text = "userId" OR is_admin());

CREATE POLICY "Users can update/delete their own notifications" ON "Notification"
  FOR UPDATE USING (auth.uid()::text = "userId" OR is_admin());

CREATE POLICY "Users can delete their own notifications" ON "Notification"
  FOR DELETE USING (auth.uid()::text = "userId" OR is_admin());

-- ==========================================
-- N. OrderDispute Table Policies
-- ==========================================
CREATE POLICY "Buyers and farmers can view related disputes" ON "OrderDispute"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND (
        o."buyerId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM "OrderItem" oi
          JOIN "CropListing" c ON oi."listingId" = c.id
          WHERE oi."orderId" = o.id AND c."farmerId" = auth.uid()::text
        )
      )
    )
    OR is_admin()
  );

CREATE POLICY "Buyers and farmers can raise disputes" ON "OrderDispute"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "raisedById"
    AND EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o.id = "orderId" AND (
        o."buyerId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM "OrderItem" oi
          JOIN "CropListing" c ON oi."listingId" = c.id
          WHERE oi."orderId" = o.id AND c."farmerId" = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Admins can resolve disputes" ON "OrderDispute"
  FOR UPDATE USING (is_admin());

-- ==========================================
-- O. Bid Table Policies
-- ==========================================
CREATE POLICY "Bids are viewable by anyone" ON "Bid"
  FOR SELECT USING (true);

CREATE POLICY "Buyers can place bids" ON "Bid"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "bidderId"
    AND EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'BUYER')
  );
