import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LineGraph } from "react-native-graph";
import { Card, Title, Portal, Provider } from "react-native-paper";
import { supabase } from "../utils/supabase";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../utils/ThemeContext";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Graph() {
  const { colors, isDarkMode } = useTheme();
  const route = useRoute();
  const { param } = route.params;
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState({ average: 0, highest: 0, lowest: 0 });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to 1 week ago
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start");
  const [dataTimeframe, setDataTimeframe] = useState("1w"); // Default to 1 week

  // New state for point selection
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    fetchHistoricalData();
  }, [param]);

  useEffect(() => {
    if (historicalData.length > 0) {
      applyDateFilter();
    }
  }, [historicalData, dateRange]);

  useEffect(() => {
    if (filteredData.length > 0) {
      calculateStats();
    }
  }, [filteredData]);

  // Fetch historical data from Supabase
  const fetchHistoricalData = async () => {
    try {
      // Get data from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("sensor_data")
        .select(`timestamp, ${param}`)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching historical data:", error);
        return;
      }

      // Ensure data is valid and has the required fields
      const validData = (data || []).filter(
        (item) =>
          item &&
          item.timestamp &&
          item[param] !== undefined &&
          item[param] !== null
      );

      setHistoricalData(validData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setHistoricalData([]);
    }
  };

  // Filter data based on selected date range
  const applyDateFilter = () => {
    try {
      // Adjust dates to include the full day
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      const filtered = historicalData.filter((item) => {
        if (!item || !item.timestamp) return false;

        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });

      setFilteredData(filtered);
    } catch (err) {
      console.error("Error filtering data:", err);
      setFilteredData([]);
    }
  };

  // Calculate statistics from filtered data
  const calculateStats = () => {
    if (filteredData.length === 0) {
      setStats({ average: 0, highest: 0, lowest: 0 });
      return;
    }

    try {
      const values = filteredData
        .filter(
          (item) => item && item[param] !== undefined && item[param] !== null
        )
        .map((item) => parseFloat(item[param]) || 0);

      if (values.length === 0) {
        setStats({ average: 0, highest: 0, lowest: 0 });
        return;
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const highest = Math.max(...values);
      const lowest = Math.min(...values);

      setStats({
        average: parseFloat(average.toFixed(2)),
        highest: parseFloat(highest.toFixed(2)),
        lowest: parseFloat(lowest.toFixed(2)),
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
      setStats({ average: 0, highest: 0, lowest: 0 });
    }
  };

  // Set the time frame for displaying data
  const setTimeframe = (timeframe) => {
    setDataTimeframe(timeframe);
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case "1d":
        startDate.setDate(now.getDate() - 1);
        break;
      case "1w":
        startDate.setDate(now.getDate() - 7);
        break;
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return; // For custom, don't change the date range
    }

    setDateRange({
      startDate,
      endDate: now,
    });
  };

  // Handle date selection in date picker
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (datePickerType === "start") {
        // Check if selected start date is before end date
        if (selectedDate <= dateRange.endDate) {
          setDateRange((prev) => ({
            ...prev,
            startDate: selectedDate,
          }));
          if (Platform.OS === "ios") {
            setDatePickerType("end");
          } else {
            // For Android, show the end date picker after selecting start date
            setTimeout(() => {
              showDatePickerModal("end");
            }, 300);
          }
        } else {
          // If selected start date is after end date, adjust end date
          setDateRange({
            startDate: selectedDate,
            endDate: new Date(selectedDate.getTime() + 86400000), // next day
          });
        }
      } else {
        // Check if selected end date is after start date
        if (selectedDate >= dateRange.startDate) {
          setDateRange((prev) => ({
            ...prev,
            endDate: selectedDate,
          }));
        } else {
          // If selected end date is before start date, adjust start date
          setDateRange({
            startDate: new Date(selectedDate.getTime() - 86400000), // previous day
            endDate: selectedDate,
          });
        }
        if (Platform.OS === "ios") {
          setShowDatePicker(false);
        }
      }
    }
  };

  // Show date picker modal
  const showDatePickerModal = (type) => {
    setDatePickerType(type);
    setShowDatePicker(true);
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

  // Format parameter name for display
  const formatParamName = (param) => {
    return param
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date for display based on timeframe
  const formatDate = (date, timeframe = dataTimeframe) => {
    if (!date) return "";

    try {
      switch (timeframe) {
        case "1d":
          return format(date, "h:mm a"); // Hour:Minute AM/PM
        case "1w":
          return format(date, "EEE, MMM d"); // Tue, Jun 7
        case "1m":
        case "3m":
          return format(date, "MMM d"); // Jun 7
        default:
          return format(date, "MMM d, yyyy"); // Jun 7, 2023
      }
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === undefined || value === null) return "-";
    return value.toFixed(1);
  };

  // Prepare points for LineGraph
  const points = useMemo(() => {
    if (!filteredData.length) return [];

    try {
      const validPoints = filteredData
        .filter(
          (item) =>
            item &&
            item.timestamp &&
            item[param] !== undefined &&
            item[param] !== null
        )
        .map((item) => {
          const timestamp = new Date(item.timestamp);

          if (isNaN(timestamp.getTime())) {
            // Skip invalid timestamps
            return null;
          }

          return {
            x: timestamp.getTime(),
            y: parseFloat(item[param]) || 0,
            timestamp: item.timestamp,
            value: parseFloat(item[param]) || 0,
          };
        })
        .filter((point) => point !== null); // Remove any nulls

      return validPoints;
    } catch (err) {
      console.error("Error preparing points:", err);
      return [];
    }
  }, [filteredData, param]);

  // Find max and min points for axis labels
  const { maxPoint, minPoint } = useMemo(() => {
    if (!points.length) return { maxPoint: null, minPoint: null };

    try {
      let max = points[0];
      let min = points[0];

      points.forEach((point) => {
        if (!point) return;

        if (point.y > max.y) max = point;
        if (point.y < min.y) min = point;
      });

      return { maxPoint: max, minPoint: min };
    } catch (err) {
      console.error("Error finding max/min points:", err);
      return { maxPoint: null, minPoint: null };
    }
  }, [points]);

  // Handle point selection during pan gesture
  const handlePointSelected = useCallback((point) => {
    if (point && point.x && !isNaN(point.x)) {
      setSelectedPoint(point);
    }
  }, []);

  // Reset selected point when gesture ends
  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 12,
      paddingBottom: 80, // Add extra padding at the bottom to avoid navbar overlap
    },
    graphContainer: {
      marginTop: 10,
      marginBottom: 20,
      borderRadius: 16,
      padding: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      height: 280, // Fixed height for the graph
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 5,
      marginBottom: 15,
    },
    timeframeButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
    },
    timeframeButtonActive: {
      backgroundColor: colors.primary,
    },
    timeframeButtonInactive: {
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeframeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    timeframeTextActive: {
      color: "white",
    },
    timeframeTextInactive: {
      color: colors.text,
    },
    customDateButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      borderWidth: 1,
      borderColor: colors.border,
    },
    customDateText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 5,
    },
    stats: {
      marginBottom: 20,
      padding: 15,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    paramTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
      textAlign: "center",
    },
    dateRangeText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 10,
    },
    selectedPointContainer: {
      position: "absolute",
      top: 10,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 15,
    },
    selectedPointValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
    },
    selectedPointDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    axisLabel: {
      position: "absolute",
      backgroundColor: isDarkMode
        ? "rgba(30, 30, 30, 0.8)"
        : "rgba(255, 255, 255, 0.8)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topAxisLabel: {
      top: 5,
      right: 10,
    },
    bottomAxisLabel: {
      bottom: 5,
      left: 10,
    },
    axisLabelText: {
      fontSize: 10,
      fontWeight: "bold",
      color: colors.text,
    },
    axisValueText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.primary,
    },
    noDataText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginVertical: 20,
    },
  });

  // Axis label component
  const AxisLabel = ({ position, value, timestamp }) => {
    if (!timestamp) return null;

    return (
      <View
        style={[
          themedStyles.axisLabel,
          position === "top"
            ? themedStyles.topAxisLabel
            : themedStyles.bottomAxisLabel,
        ]}
      >
        <Text style={themedStyles.axisValueText}>
          {formatValue(value)} {getUnit(param)}
        </Text>
        <Text style={themedStyles.axisLabelText}>
          {formatDate(new Date(timestamp))}
        </Text>
      </View>
    );
  };

  // Custom selection dot component
  const SelectionDot = () => (
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.primary,
      }}
    />
  );

  return (
    <ScrollView style={themedStyles.container}>
      <Text style={themedStyles.paramTitle}>
        {formatParamName(param)} History
      </Text>
      <Text style={themedStyles.dateRangeText}>
        {formatDate(dateRange.startDate, "custom")} -{" "}
        {formatDate(dateRange.endDate, "custom")}
      </Text>

      <View style={themedStyles.graphContainer}>
        {points.length > 1 ? (
          <>
            <LineGraph
              points={points}
              animated={true}
              color={colors.primary}
              style={{ width: width - 40, height: 220 }}
              enablePanGesture={true}
              onPointSelected={handlePointSelected}
              onGestureEnd={handleGestureEnd}
              SelectionDot={SelectionDot}
              TopAxisLabel={
                maxPoint && maxPoint.timestamp
                  ? () => (
                      <AxisLabel
                        position="top"
                        value={maxPoint.y}
                        timestamp={maxPoint.timestamp}
                      />
                    )
                  : undefined
              }
              BottomAxisLabel={
                minPoint && minPoint.timestamp
                  ? () => (
                      <AxisLabel
                        position="bottom"
                        value={minPoint.y}
                        timestamp={minPoint.timestamp}
                      />
                    )
                  : undefined
              }
            />

            {selectedPoint && (
              <View style={themedStyles.selectedPointContainer}>
                <View>
                  <Text style={themedStyles.selectedPointValue}>
                    {formatValue(selectedPoint.y)} {getUnit(param)}
                  </Text>
                </View>
                <View>
                  <Text style={themedStyles.selectedPointDate}>
                    {formatDate(new Date(selectedPoint.x))}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={themedStyles.noDataText}>
            No data available for the selected time period
          </Text>
        )}
      </View>

      <View style={themedStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["1d", "1w", "1m", "3m"].map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                themedStyles.timeframeButton,
                dataTimeframe === timeframe
                  ? themedStyles.timeframeButtonActive
                  : themedStyles.timeframeButtonInactive,
              ]}
              onPress={() => setTimeframe(timeframe)}
            >
              <Text
                style={[
                  themedStyles.timeframeText,
                  dataTimeframe === timeframe
                    ? themedStyles.timeframeTextActive
                    : themedStyles.timeframeTextInactive,
                ]}
              >
                {timeframe === "1d"
                  ? "1 Day"
                  : timeframe === "1w"
                  ? "1 Week"
                  : timeframe === "1m"
                  ? "1 Month"
                  : "3 Months"}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={themedStyles.customDateButton}
            onPress={() => showDatePickerModal("start")}
          >
            <Ionicons name="calendar-outline" size={14} color={colors.text} />
            <Text style={themedStyles.customDateText}>Custom Range</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={themedStyles.stats}>
        <View style={themedStyles.statsRow}>
          <Text style={themedStyles.statLabel}>Average</Text>
          <Text style={themedStyles.statValue}>
            {stats.average} {getUnit(param)}
          </Text>
        </View>
        <View style={themedStyles.statsRow}>
          <Text style={themedStyles.statLabel}>Highest</Text>
          <Text style={themedStyles.statValue}>
            {stats.highest} {getUnit(param)}
          </Text>
        </View>
        <View style={themedStyles.statsRow}>
          <Text style={themedStyles.statLabel}>Lowest</Text>
          <Text style={themedStyles.statValue}>
            {stats.lowest} {getUnit(param)}
          </Text>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={
            datePickerType === "start" ? dateRange.startDate : dateRange.endDate
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          style={{ backgroundColor: colors.card }}
          textColor={colors.text}
        />
      )}
    </ScrollView>
  );
}
