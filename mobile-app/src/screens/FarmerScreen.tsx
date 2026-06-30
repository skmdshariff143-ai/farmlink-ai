import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useMobileStore } from "../store/useStore";
import { mobileApiClient } from "../services/api";

export default function FarmerScreen() {
  const { currentUser } = useMobileStore();
  const [cropName, setCropName] = useState("");
  const [cropPrice, setCropPrice] = useState("");
  const [cropQty, setCropQty] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!cropName || !cropPrice || !cropQty) {
      Alert.alert("Error", "Please fill in all listing details");
      return;
    }

    setLoading(true);
    const success = await mobileApiClient.uploadCropListing({
      name: cropName,
      price: Number(cropPrice),
      quantity: Number(cropQty),
      description: "Harvested organically from local farms."
    });

    setLoading(false);
    if (success) {
      Alert.alert("Success", "Crop listing published to marketplace! 🎉");
      setCropName("");
      setCropPrice("");
      setCropQty("");
    } else {
      Alert.alert("Offline", "Action queued. We will sync when network returns.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Farmer Dashboard</Text>
      
      {/* Wallet Balance Card */}
      <View style={styles.card}>
        <Text style={styles.cardSub}>Escrow Wallet Balance</Text>
        <Text style={styles.cardVal}>₹{currentUser?.walletBalance.toLocaleString("en-IN")}</Text>
        <Text style={styles.cardFoot}>Secured buyer funds locked in escrow</Text>
      </View>

      {/* Upload Crop Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Publish New Crop Harvest</Text>
        
        <Text style={styles.label}>Crop Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Organic Basmati Rice"
          value={cropName}
          onChangeText={setCropName}
        />

        <View style={styles.row}>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Price (₹ per kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="65"
              keyboardType="numeric"
              value={cropPrice}
              onChangeText={setCropPrice}
            />
          </View>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Quantity (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="1000"
              keyboardType="numeric"
              value={cropQty}
              onChangeText={setCropQty}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleUpload} disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? "Publishing..." : "Publish Listing"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fcf9" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#1b3323", marginBottom: 20 },
  card: { backgroundColor: "#1e3a27", padding: 20, borderRadius: 24, marginBottom: 24 },
  cardSub: { fontSize: 10, fontWeight: "800", color: "#a5d6a7", textTransform: "uppercase" },
  cardVal: { fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 4 },
  cardFoot: { fontSize: 9, color: "#c8e6c9", marginTop: 8 },
  formCard: { backgroundColor: "#fff", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#e8ede9" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1b3323", marginBottom: 16 },
  label: { fontSize: 10, fontWeight: "700", color: "#687a6c", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#e8ede9", borderRadius: 12, padding: 10, fontSize: 12, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  flexHalf: { flex: 1 },
  btn: { backgroundColor: "#1e3a27", padding: 14, borderRadius: 16, alignItems: "center", marginTop: 8 },
  btnTxt: { color: "#fff", fontSize: 12, fontWeight: "800" }
});
