import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { mobileApiClient } from "../services/api";
import { useMobileSocket } from "../hooks/useSocket";

export default function BuyerScreen() {
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const { emitBid, bids } = useMobileSocket("mandi_lobby", "user_buyer_99");

  useEffect(() => {
    async function loadCrops() {
      const data = await mobileApiClient.getCrops();
      // Use fallback crop catalog if offline
      setCrops(data.length > 0 ? data : [
        { id: "c_1", name: "Premium Basmati Rice", price: 65, quantity: 1200, location: "Karnal, Haryana" },
        { id: "c_2", name: "Golden Sharbati Wheat", price: 32, quantity: 4500, location: "Sehore, MP" }
      ]);
    }
    loadCrops();
  }, []);

  const handlePlaceBid = () => {
    if (!selectedCrop || !bidAmount) return;

    emitBid(selectedCrop.id, selectedCrop.name, "Reliance Retail Mobile", Number(bidAmount));
    Alert.alert("Bid Transmitted", `Placed live bid of ₹${bidAmount}/kg for ${selectedCrop.name}`);
    setBidAmount("");
    setSelectedCrop(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer Marketplace</Text>

      {/* Live Bids Feed Ticker */}
      <View style={styles.tickerCard}>
        <Text style={styles.tickerTitle}>⚡ Live Mandi Auction Ticker</Text>
        <Text style={styles.tickerBody}>
          {bids.length > 0
            ? `${bids[0].bidderName} bid ₹${bids[0].bidAmount}/kg for ${bids[0].cropName}`
            : "Waiting for auction bid ticks..."}
        </Text>
      </View>

      <FlatList
        data={crops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cropCard}>
            <View>
              <Text style={styles.cropName}>{item.name}</Text>
              <Text style={styles.cropDetails}>Price: ₹{item.price}/kg • Stock: {item.quantity}kg</Text>
              <Text style={styles.cropLoc}>Location: {item.location}</Text>
            </View>
            <TouchableOpacity style={styles.bidBtn} onPress={() => setSelectedCrop(item)}>
              <Text style={styles.bidBtnTxt}>Negotiate</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bidding Negotiation Modal Simulation Overlay */}
      {selectedCrop && (
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Negotiate: {selectedCrop.name}</Text>
            <Text style={styles.modalSub}>Current: ₹{selectedCrop.price}/kg</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter bid amount (₹ per kg)"
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
            />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setSelectedCrop(null)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handlePlaceBid}>
                <Text style={styles.btnTxt}>Transmit Bid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fcf9", padding: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#1b3323", marginBottom: 20 },
  tickerCard: { backgroundColor: "#fffde7", borderLeftWidth: 4, borderLeftColor: "#fbc02d", padding: 12, borderRadius: 12, marginBottom: 16 },
  tickerTitle: { fontSize: 10, fontWeight: "800", color: "#f57f17" },
  tickerBody: { fontSize: 11, fontWeight: "700", color: "#5d4037", marginTop: 2 },
  cropCard: { backgroundColor: "#fff", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#e8ede9", marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cropName: { fontSize: 13, fontWeight: "800", color: "#1b3323" },
  cropDetails: { fontSize: 11, fontWeight: "700", color: "#687a6c", marginTop: 2 },
  cropLoc: { fontSize: 9, color: "#8a9a8d", marginTop: 4 },
  bidBtn: { backgroundColor: "#1e3a27", px: 12, py: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bidBtnTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  modalBg: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", width: "100%", padding: 20, borderRadius: 24, spaceY: 12 },
  modalTitle: { fontSize: 14, fontWeight: "800", color: "#1b3323", marginBottom: 4 },
  modalSub: { fontSize: 11, fontWeight: "700", color: "#687a6c", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#e8ede9", borderRadius: 12, padding: 10, fontSize: 12, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, backgroundColor: "#1e3a27", padding: 12, borderRadius: 12, alignItems: "center" },
  btnTxt: { color: "#fff", fontSize: 11, fontWeight: "800" },
  cancelBtn: { backgroundColor: "#f5f5f5" },
  cancelBtnTxt: { color: "#555", fontSize: 11, fontWeight: "800" }
});
