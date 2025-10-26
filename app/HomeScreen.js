import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Alert } from "react-native";
import { NativeModules } from "react-native";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";

const { AppManager } = NativeModules; // our native Kotlin module

export default function HomeScreen() {
  const [apps, setApps] = useState([]);
  const [selectedMiniApp, setSelectedMiniApp] = useState(null);

  // Load installed Android apps from native module
  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const list = await AppManager.getInstalledApps();
      setApps(list);
    } catch (e) {
      console.error("Error loading apps:", e);
    }
  }

  const launchApp = (pkg) => {
    AppManager.launchApp(pkg).catch((err) => Alert.alert("Launch Error", err.message));
  };

  // Mini apps list - bundled inside assets/www
  const miniApps = [
    { name: "Weather", file: "weather/index.html" },
    { name: "Notes", file: "notes/index.html" },
    { name: "Calculator", file: "calc/index.html" },
  ];

  if (selectedMiniApp) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedMiniApp(null)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <WebView
          originWhitelist={["*"]}
          source={{ uri: `${FileSystem.documentDirectory}${selectedMiniApp}` }}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Launcher</Text>

      <Text style={styles.section}>Mini Apps</Text>
      <FlatList
        data={miniApps}
        keyExtractor={(item) => item.name}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appIcon}
            onPress={() => setSelectedMiniApp(item.file)}
          >
            <Image source={require("../assets/htmlapp.png")} style={styles.iconImg} />
            <Text style={styles.iconText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.section}>Installed Apps</Text>
      <FlatList
        data={apps}
        numColumns={4}
        keyExtractor={(item) => item.package}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appIcon} onPress={() => launchApp(item.package)}>
            <Image
              source={{ uri: item.icon }}
              style={styles.iconImg}
              defaultSource={require("../assets/default.png")}
            />
            <Text style={styles.iconText} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    color: "#aaa",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  appIcon: {
    width: 70,
    alignItems: "center",
    margin: 6,
  },
  iconImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  iconText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  backBtn: {
    padding: 10,
    backgroundColor: "#111",
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
});
