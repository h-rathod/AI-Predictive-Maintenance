import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CARD_STYLE } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

export default function Dashboard() {
  const { colors } = useTheme();
  const [sensorData, setSensorData] = useState({});
  const [previousData, setPreviousData] = useState({});
  const navigation = useNavigation();

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 12,
    },
    headerContainer: {
      marginBottom: 20,
      paddingHorizontal: 5,
      paddingTop: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    cardContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: cardWidth,
      height: 140,
      marginBottom: 12,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    cardContent: {
      flex: 1,
      justifyContent: "space-between",
    },
    paramName: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    valueContainer: {
      flex: 1,
      justifyContent: "center",
    },
    valueText: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
    },
    unitText: {
      fontSize: 16,
      fontWeight: "normal",
      color: colors.textSecondary,
    },
    trendContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    trendIconUp: {
      marginRight: 4,
    },
    trendIconDown: {
      marginRight: 4,
    },
    trendIconStable: {
      marginRight: 4,
    },
    diffText: {
      fontSize: 12,
    },
  });

  useEffect(() => {
    const fetchLatestData = async () => {
      // Get the latest two records to calculate differences
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(2);

      if (error) {
        console.error("Error fetching initial data:", error.message);
      } else if (data && data.length > 0) {
        setSensorData(data[0] || {});
        if (data.length > 1) {
          setPreviousData(data[1] || {});
        }
      }
    };

    fetchLatestData();

    const subscription = supabase
      .channel("sensor-data-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          // When new data comes in, current data becomes previous data
          setPreviousData(sensorData);
          setSensorData(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const parameters = [
    "evaporator_coil_temperature",
    "freezer_temperature",
    "fridge_temperature",
    "air_temperature",
    "humidity",
    "compressor_vibration",
    "compressor_current",
    "input_voltage",
    "gas_leakage_level",
    "power_consumption",
    "temperature_diff",
  ];

  // Format parameter name for display
  const formatParamName = (param) => {
    return param
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get the appropriate unit for a parameter
  const getUnit = (param) => {
    const units = {
      evaporator_coil_temperature: "°C",
      freezer_temperature: "°C",
      fridge_temperature: "°C",
      air_temperature: "°C",
      humidity: "%",
      compressor_vibration: "mm/s",
      compressor_vibration_x: "mm/s",
      compressor_vibration_y: "mm/s",
      compressor_vibration_z: "mm/s",
      compressor_current: "A",
      input_voltage: "V",
      power_consumption: "W",
      gas_leakage_level: "ppm",
      temperature_diff: "°C",
    };
    return units[param] || "";
  };

  // Calculate the difference between current and previous values
  const calculateDifference = (param) => {
    if (
      sensorData &&
      previousData &&
      sensorData[param] !== undefined &&
      previousData[param] !== undefined
    ) {
      return sensorData[param] - previousData[param];
    }
    return 0;
  };

  // Determine the trend icon and color based on the difference
  const getTrendInfo = (param) => {
    const diff = calculateDifference(param);

    // For these parameters, decreasing is better
    const decreasingIsBetter = [
      "compressor_vibration",
      "gas_leakage_level",
      "power_consumption",
    ];
    const isDecreasingBetter = decreasingIsBetter.includes(param);

    if (Math.abs(diff) < 0.001) {
      return {
        icon: "remove-outline",
        color: colors.stable,
        iconStyle: themedStyles.trendIconStable,
      };
    }

    if ((diff > 0 && !isDecreasingBetter) || (diff < 0 && isDecreasingBetter)) {
      return {
        icon: "arrow-up-outline",
        color: colors.increasing,
        iconStyle: themedStyles.trendIconUp,
      };
    }

    return {
      icon: "arrow-down-outline",
      color: colors.decreasing,
      iconStyle: themedStyles.trendIconDown,
    };
  };

  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: 90 }} // Add bottom padding to scroll content
    >
      <View style={themedStyles.headerContainer}>
        <Text style={themedStyles.headerTitle}>Dashboard</Text>
        <Text style={themedStyles.headerSubtitle}>
          Last updated:{" "}
          {new Date(sensorData.timestamp || Date.now()).toLocaleString()}
        </Text>
      </View>

      <View style={themedStyles.cardContainer}>
        {parameters.map((param) => {
          const trendInfo = getTrendInfo(param);
          const diff = calculateDifference(param);
          const diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
          const value = sensorData[param];
          const formattedValue = value !== undefined ? value.toFixed(1) : "N/A";

          return (
            <TouchableOpacity
              key={param}
              style={themedStyles.card}
              onPress={() => navigation.navigate("Graph", { param })}
            >
              <View style={themedStyles.cardContent}>
                <Text style={themedStyles.paramName}>
                  {formatParamName(param)}
                </Text>
                <View style={themedStyles.valueContainer}>
                  <Text style={themedStyles.valueText}>
                    {formattedValue}
                    <Text style={themedStyles.unitText}>{getUnit(param)}</Text>
                  </Text>
                </View>
                <View style={themedStyles.trendContainer}>
                  <Ionicons
                    name={trendInfo.icon}
                    size={16}
                    color={trendInfo.color}
                    style={trendInfo.iconStyle}
                  />
                  <Text
                    style={[themedStyles.diffText, { color: trendInfo.color }]}
                  >
                    {diffText} {getUnit(param)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
