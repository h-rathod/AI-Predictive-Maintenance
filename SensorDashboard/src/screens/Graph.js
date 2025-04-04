import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  Button,
  Card,
  Title,
  Divider,
  Modal,
  Portal,
  Provider,
} from "react-native-paper";
import { supabase } from "../utils/supabase";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CHART_CONFIG } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function Graph() {
  const { colors, isDarkMode } = useTheme();
  const route = useRoute();
  const { param } = route.params;
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [reducedData, setReducedData] = useState([]);
  const [stats, setStats] = useState({ average: 0, highest: 0, lowest: 0 });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to 1 week ago
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start");
  const [dataTimeframe, setDataTimeframe] = useState("1w"); // Default to 1 week
  const MAX_DISPLAY_POINTS = 15; // Maximum number of data points to display

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
      reduceDataPoints();
      calculateStats();
    }
  }, [filteredData]);

  // Fetch historical data from Supabase
  const fetchHistoricalData = async () => {
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
    } else {
      setHistoricalData(data || []);
    }
  };

  // Filter data based on selected date range
  const applyDateFilter = () => {
    // Adjust dates to include the full day
    const startDate = new Date(dateRange.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    const filtered = historicalData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });

    setFilteredData(filtered);
  };

  // Reduce the number of data points to prevent chart from being too crowded
  const reduceDataPoints = () => {
    if (filteredData.length <= MAX_DISPLAY_POINTS) {
      setReducedData(filteredData);
      return;
    }

    const step = Math.ceil(filteredData.length / MAX_DISPLAY_POINTS);
    let reduced = [];

    // Group data points and calculate averages
    for (let i = 0; i < filteredData.length; i += step) {
      const chunk = filteredData.slice(
        i,
        Math.min(i + step, filteredData.length)
      );

      if (chunk.length > 0) {
        const sum = chunk.reduce((acc, item) => acc + (item[param] || 0), 0);
        const avg = sum / chunk.length;

        // Use the timestamp from the middle of the chunk for better representation
        const middleIndex = Math.floor(chunk.length / 2);
        reduced.push({
          timestamp: chunk[middleIndex].timestamp,
          [param]: parseFloat(avg.toFixed(2)),
        });
      }
    }

    // Always include the first and last data point for accurate range representation
    if (reduced.length > 2 && filteredData.length > 2) {
      // Check if first and last elements are already included
      const firstTimestamp = filteredData[0].timestamp;
      const lastTimestamp = filteredData[filteredData.length - 1].timestamp;

      const hasFirst = reduced.some(
        (item) => item.timestamp === firstTimestamp
      );
      const hasLast = reduced.some((item) => item.timestamp === lastTimestamp);

      if (!hasFirst) {
        reduced.unshift(filteredData[0]);
      }

      if (!hasLast) {
        reduced.push(filteredData[filteredData.length - 1]);
      }
    }

    setReducedData(reduced);
  };

  // Calculate statistics from filtered data
  const calculateStats = () => {
    if (filteredData.length === 0) {
      setStats({ average: 0, highest: 0, lowest: 0 });
      return;
    }

    const values = filteredData.map((item) => item[param] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    setStats({
      average: parseFloat(average.toFixed(2)),
      highest: parseFloat(highest.toFixed(2)),
      lowest: parseFloat(lowest.toFixed(2)),
    });
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

  // Format date for display
  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return formatDate(date);
  };

  // Prepare chart data
  const getChartData = () => {
    if (reducedData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [0],
            color: () => colors.primary,
            strokeWidth: 2,
          },
        ],
        legend: ["No Data"],
      };
    }

    const labels = reducedData.map((item) => formatTimestamp(item.timestamp));
    const data = reducedData.map((item) => item[param] || 0);

    return {
      labels: getLimitedLabels(labels),
      datasets: [
        {
          data,
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
      legend: [formatParamName(param)],
    };
  };

  // Limit the number of labels shown on the X-axis to prevent overcrowding
  const getLimitedLabels = (allLabels) => {
    if (allLabels.length <= 5) return allLabels;

    const result = [];
    const step = Math.ceil(allLabels.length / 5);

    for (let i = 0; i < allLabels.length; i += step) {
      result.push(allLabels[i]);
    }

    // Always include the last label
    if (result[result.length - 1] !== allLabels[allLabels.length - 1]) {
      result.push(allLabels[allLabels.length - 1]);
    }

    return result;
  };

  // Apply custom chart config based on theme
  const themedChartConfig = {
    ...CHART_CONFIG,
    backgroundColor: colors.chartBackground,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    labelColor: (opacity = 1) =>
      `rgba(${isDarkMode ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    propsForBackgroundLines: {
      stroke: colors.chartGrid,
      strokeWidth: 1,
      strokeDasharray: "6, 6",
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: "bold",
      fill: colors.textSecondary,
    },
  };

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
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      margin: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
      textAlign: "center",
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#2A2A2A" : "#F1F5F9",
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 15,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    noDataText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginVertical: 20,
    },
  });

  return (
    <ScrollView style={themedStyles.container}>
      <Text style={themedStyles.paramTitle}>
        {formatParamName(param)} History
      </Text>
      <Text style={themedStyles.dateRangeText}>
        {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
      </Text>

      <View style={themedStyles.graphContainer}>
        {reducedData.length > 1 ? (
          <LineChart
            data={getChartData()}
            width={width - 50}
            height={220}
            chartConfig={themedChartConfig}
            bezier
            style={themedStyles.chart}
            withDots={reducedData.length < 10}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            fromZero={
              param === "gas_leakage_level" || param === "compressor_vibration"
            }
            yAxisInterval={5}
          />
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
