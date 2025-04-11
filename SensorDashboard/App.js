import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Keyboard } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "./src/utils/supabase";

// Screens
import Dashboard from "./src/screens/Dashboard";
import Graph from "./src/screens/Graph";
import Chatbot from "./src/screens/Chatbot";
import Settings from "./src/screens/Settings";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Theme
import { COLORS } from "./src/utils/theme";
import { ThemeProvider, useTheme } from "./src/utils/ThemeContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// Auth stack
function AuthNavigation() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Dashboard stack
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

// Main app with tab navigation
function MainAppNavigation() {
  const { isDarkMode, colors } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
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
            if (route.name === "Home")
              iconName = focused ? "home" : "home-outline";
            else if (route.name === "Chatbot")
              iconName = focused ? "chatbubble" : "chatbubble-outline";
            else if (route.name === "Settings")
              iconName = focused ? "settings" : "settings-outline";
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
  );
}

// Root component
export default function App() {
  // For testing purposes, we'll set a mock user
  const [user, setUser] = useState({
    id: "test-user",
    email: "test@example.com",
    email_confirmed_at: new Date().toISOString()
  });

  // Comment out the actual auth logic for now
  /*
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user?.email_confirmed_at) {
        setUser(user);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;

        if (user?.email_confirmed_at) {
          setUser(user);

          // Check and insert user into 'users' table if not already added
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

          if (!existingUser && !error) {
            await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null); // block login if email not verified
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);
  */

  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          {/* Always show MainAppNavigation for testing */}
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainAppNavigation} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true }}
            />
          </Stack.Navigator>
          
          {/* Comment out the conditional rendering for now */}
          {/* {user ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={MainAppNavigation} />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: true }}
              />
            </Stack.Navigator>
          ) : (
            <AuthNavigation />
          )} */}
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
