import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Keyboard } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Provider as PaperProvider,
  DefaultTheme as PaperTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

// Screens
import Dashboard from "./src/screens/Dashboard";
import Graph from "./src/screens/Graph";
import Chatbot from "./src/screens/Chatbot";
import Settings from "./src/screens/Settings";

// Theme
import { COLORS } from "./src/utils/theme";
import { ThemeProvider, useTheme } from "./src/utils/ThemeContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Dashboard stack navigator
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Graph"
        component={Graph}
        options={({ route }) => ({
          title: "Sensor Data",
        })}
      />
    </Stack.Navigator>
  );
}

// Main app navigation component with theme awareness
function MainAppNavigation() {
  const { isDarkMode, colors } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Custom navigation theme based on current colors
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  // Custom Paper theme based on current colors
  const paperTheme = {
    ...PaperTheme,
    dark: isDarkMode,
    colors: {
      ...PaperTheme.colors,
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.card,
      text: colors.text,
      disabled: colors.textSecondary,
      placeholder: colors.textSecondary,
      backdrop: colors.background,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <StatusBar
            barStyle={isDarkMode ? "light-content" : "dark-content"}
            backgroundColor={colors.background}
          />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home") {
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "Chatbot") {
                  iconName = focused ? "chatbubble" : "chatbubble-outline";
                } else if (route.name === "Settings") {
                  iconName = focused ? "settings" : "settings-outline";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingBottom: 10,
                paddingTop: 5,
                height: 60,
                elevation: 0,
                shadowOpacity: 0,
                display: isKeyboardVisible ? "none" : "flex",
              },
              headerStyle: {
                backgroundColor: colors.background,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
              headerTintColor: colors.text,
            })}
          >
            <Tab.Screen
              name="Home"
              component={DashboardStack}
              options={{ headerShown: false }}
            />
            <Tab.Screen name="Chatbot" component={Chatbot} />
            <Tab.Screen name="Settings" component={Settings} />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Root app component with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <MainAppNavigation />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
