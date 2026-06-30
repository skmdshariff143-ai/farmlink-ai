import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import FarmerScreen from "./src/screens/FarmerScreen";
import BuyerScreen from "./src/screens/BuyerScreen";
import CameraScreen from "./src/screens/CameraScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: "#1e3a27",
              tabBarInactiveTintColor: "#8a9a8d",
              tabBarStyle: {
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#e8ede9",
                paddingBottom: 6,
                paddingTop: 6,
                height: 60
              },
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: "700"
              }
            }}
          >
            <Tab.Screen
              name="Farmer Portal"
              component={FarmerScreen}
              options={{
                tabBarLabel: "Farmer"
              }}
            />
            <Tab.Screen
              name="Buyer Portal"
              component={BuyerScreen}
              options={{
                tabBarLabel: "Buyer"
              }}
            />
            <Tab.Screen
              name="Leaf Scanner"
              component={CameraScreen}
              options={{
                tabBarLabel: "AI Scanner"
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
