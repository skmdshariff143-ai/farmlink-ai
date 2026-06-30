import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { mobileApiClient } from "../services/api";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleCaptureAndScan = async () => {
    setScanning(true);
    setScanResult(null);

    // Simulate capturing and uploading
    const result = await mobileApiClient.runDiseaseScan("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500");
    setScanning(false);
    
    if (result) {
      setScanResult(result);
    } else {
      Alert.alert("Error", "Foliage scan failed. Please check your connectivity.");
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Crop Health Scanner</Text>
      
      {/* Expo Camera View Finder Simulation */}
      <View style={styles.cameraBox}>
        <CameraView style={styles.camera} facing="back">
          <View style={styles.overlay}>
            <View style={styles.focusFrame} />
          </View>
        </CameraView>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={handleCaptureAndScan} disabled={scanning}>
        <Text style={styles.scanBtnTxt}>{scanning ? "Analyzing Foliage..." : "Capture & Run Diagnosis"}</Text>
      </TouchableOpacity>

      {scanning && <ActivityIndicator size="large" color="#1e3a27" style={styles.spinner} />}

      {scanResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>📋 Diagnostic Scan Results</Text>
          <Text style={styles.resultItem}><strong>Pathogen:</strong> {scanResult.condition}</Text>
          <Text style={styles.resultItem}><strong>Severity:</strong> {scanResult.severity}</Text>
          <Text style={styles.resultItem}><strong>Remedy:</strong> {scanResult.remedy}</Text>
          <Text style={styles.resultItem}><strong>Confidence:</strong> {scanResult.confidence}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fcf9", padding: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#1b3323", marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraBox: { height: 300, width: "100%", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#e8ede9" },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.15)" },
  focusFrame: { width: 180, height: 180, borderWidth: 2, borderColor: "#a5d6a7", borderStyle: "dashed", borderRadius: 16 },
  scanBtn: { backgroundColor: "#1e3a27", padding: 16, borderRadius: 20, alignItems: "center", marginTop: 20 },
  scanBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  spinner: { marginTop: 16 },
  resultCard: { backgroundColor: "#fff", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e8ede9", marginTop: 16, gap: 4 },
  resultTitle: { fontSize: 12, fontWeight: "800", color: "#1b3323", marginBottom: 6 },
  resultItem: { fontSize: 10, color: "#687a6c", lineHeight: 14 }
});
