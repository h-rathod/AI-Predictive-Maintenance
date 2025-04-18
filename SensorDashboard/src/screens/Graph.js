import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper";
import { supabase } from "../utils/supabase";
import { useTheme } from "../utils/ThemeContext";
import { format, subDays, subWeeks, subMonths } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export default function Graph() {
  const { colors, isDarkMode } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { param } = route.params;

  // State variables
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("1w");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [stats, setStats] = useState({ average: 0, max: 0, min: 0 });
  const [dateRange, setDateRange] = useState({
    startDate: subWeeks(new Date(), 1),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start");
  const [touchCoordinates, setTouchCoordinates] = useState(null);

  // Fetch data when component mounts or param changes
  useEffect(() => {
    fetchData();
  }, [param]);

  // Filter data when date range changes
  useEffect(() => {
    if (data.length > 0) {
      filterDataByDateRange();
    }
  }, [data, dateRange]);

  // Calculate stats when filtered data changes
  useEffect(() => {
    calculateStats();
  }, [filteredData]);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Get data from the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data: responseData, error } = await supabase
        .from("sensor_data")
        .select(`timestamp, ${param}`)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        return;
      }

      // Validate data
      const validData = (responseData || [])
        .filter(
          (item) =>
            item &&
            item.timestamp &&
            item[param] !== undefined &&
            item[param] !== null
        )
        .map((item) => {
          try {
            return {
              timestamp: new Date(item.timestamp),
              value: parseFloat(item[param]) || 0,
              originalTimestamp: item.timestamp,
            };
          } catch (err) {
            console.warn("Error processing data item:", err);
            return null;
          }
        })
        .filter((item) => item !== null);

      console.log(`Fetched ${validData.length} valid data points`);
      setData(validData);

      // Set initial timeframe
      handleTimeframeChange(timeframe);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setData([]);
      setIsLoading(false);
    }
  };

  // Filter data by date range
  const filterDataByDateRange = () => {
    try {
      // Adjust dates to include the full day
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      const filtered = data.filter((item) => {
        try {
          return item.timestamp >= startDate && item.timestamp <= endDate;
        } catch (err) {
          return false;
        }
      });

      console.log(`Filtered to ${filtered.length} data points`);
      setFilteredData(filtered);
    } catch (err) {
      console.error("Error filtering data:", err);
      setFilteredData([]);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!filteredData || filteredData.length === 0) {
      setStats({ average: 0, max: 0, min: 0 });
      return;
    }

    try {
      const values = filteredData.map((item) => item.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      setStats({
        average: parseFloat(average.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
      setStats({ average: 0, max: 0, min: 0 });
    }
  };

  // Handle timeframe button press
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setSelectedPoint(null);

    const now = new Date();
    let startDate;

    switch (newTimeframe) {
      case "1d":
        startDate = subDays(now, 1);
        break;
      case "1w":
        startDate = subWeeks(now, 1);
        break;
      case "1m":
        startDate = subMonths(now, 1);
        break;
      default:
        return;
    }

    setDateRange({
      startDate,
      endDate: now,
    });
  };

  // Format date based on timeframe
  const formatDate = (date, customTimeframe = timeframe) => {
    if (!date) return "";

    try {
      switch (customTimeframe) {
        case "1d":
          return format(date, "h:mm a");
        case "1w":
          return format(date, "EEE, MMM d");
        case "1m":
          return format(date, "MMM d");
        default:
          return format(date, "MMM d, yyyy");
      }
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  };

  // Get unit for the parameter
  const getUnit = (paramName) => {
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
    return units[paramName] || "";
  };

  // Format parameter name for display
  const formatParamName = (paramName) => {
    return paramName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle date picker
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (datePickerType === "start") {
        setDateRange((prev) => ({
          ...prev,
          startDate:
            selectedDate <= prev.endDate ? selectedDate : prev.startDate,
        }));

        if (Platform.OS === "ios") {
          setDatePickerType("end");
        } else {
          setTimeout(() => {
            showDatePickerModal("end");
          }, 300);
        }
      } else {
        setDateRange((prev) => ({
          ...prev,
          endDate: selectedDate >= prev.startDate ? selectedDate : prev.endDate,
        }));

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

  // Format value with unit
  const formatValue = (value) => {
    if (value === undefined || value === null) return "-";
    return `${value.toFixed(1)} ${getUnit(param)}`;
  };

  // Prepare chart data in chart-kit format
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length < 2) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    try {
      // For large datasets, limit to a reasonable number of data points for processing
      let dataToUse = filteredData;

      // A reasonable limit for number of points to plot
      const maxDataPoints = 100;

      if (filteredData.length > maxDataPoints) {
        const step = Math.ceil(filteredData.length / maxDataPoints);
        dataToUse = [];

        for (let i = 0; i < filteredData.length; i += step) {
          if (i < filteredData.length) {
            dataToUse.push(filteredData[i]);
          }
        }

        // Always include the last point
        if (
          dataToUse.length > 0 &&
          dataToUse[dataToUse.length - 1] !==
            filteredData[filteredData.length - 1]
        ) {
          dataToUse.push(filteredData[filteredData.length - 1]);
        }
      }

      // Now, limit the number of labels on the x-axis
      // We'll show only a few labels based on the timeframe
      let labelIndices = [];
      const maxLabels = timeframe === "1d" ? 4 : timeframe === "1w" ? 5 : 6;

      if (dataToUse.length <= maxLabels) {
        // Show all labels if we have fewer data points than maxLabels
        labelIndices = dataToUse.map((_, index) => index);
      } else {
        // Calculate indices for the labels we want to show
        const step = Math.floor(dataToUse.length / (maxLabels - 1));

        // Always show the first and last label
        labelIndices.push(0);

        // Add evenly spaced labels in between
        for (let i = step; i < dataToUse.length - 1; i += step) {
          if (labelIndices.length < maxLabels - 1) {
            labelIndices.push(i);
          }
        }

        // Add the last index
        labelIndices.push(dataToUse.length - 1);
      }

      // Create labels array with empty strings for positions we don't want to show
      const labels = dataToUse.map((_, index) =>
        labelIndices.includes(index)
          ? formatDate(dataToUse[index].timestamp)
          : ""
      );

      return {
        labels,
        datasets: [
          {
            data: dataToUse.map((item) => item.value),
            color: () => `rgba(0, 156, 255, 1)`, // Line color
            strokeWidth: 2,
          },
        ],
        // Store the raw data for reference
        rawData: dataToUse,
      };
    } catch (err) {
      console.error("Error preparing chart data:", err);
      return { labels: [], datasets: [{ data: [] }] };
    }
  }, [filteredData, timeframe]);

  // Component to show when no data is available
  const NoDataView = () => (
    <View style={styles.noDataContainer}>
      <Ionicons
        name="analytics-outline"
        size={64}
        color={colors.textSecondary}
        style={styles.noDataIcon}
      />
      <Text style={styles.noDataTitle}>No Data Available</Text>
      <Text style={styles.noDataText}>
        There's no data available for the selected time period. Try selecting a
        different time range.
      </Text>
    </View>
  );

  // Handle touch events on chart
  const handleChartTouch = (data) => {
    if (data && data.index !== undefined && chartData.rawData) {
      const pointData = chartData.rawData[data.index];
      if (pointData) {
        setSelectedPoint({
          value: pointData.value,
          timestamp: pointData.timestamp,
          index: data.index,
          x: data.x,
          y: data.y,
        });

        // Set touch coordinates to show tooltip
        setTouchCoordinates({
          x: data.x,
          y: data.y,
        });
      }
    }
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: isDarkMode ? "#001B36" : colors.background,
    backgroundGradientTo: isDarkMode ? "#000814" : colors.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 156, 255, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid lines
      stroke: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)", // Very subtle grid lines
      strokeWidth: 1,
    },
    propsForDots: {
      r: selectedPoint ? "4" : "0", // Show dots when a point is selected
      strokeWidth: "0",
    },
    fillShadowGradient: "rgba(0, 156, 255, 1)",
    fillShadowGradientOpacity: 0.6,
    fillShadowGradientFrom: "rgba(0, 156, 255, 0)",
    fillShadowGradientTo: "rgba(0, 156, 255, 0.6)",
    useShadowColorFromDataset: false,
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: StatusBar.currentHeight || 12,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? colors.card : "rgba(0, 0, 0, 0.05)",
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      marginVertical: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    dateRange: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    chartCard: {
      backgroundColor: "transparent",
      borderRadius: 16,
      marginVertical: 16,
      overflow: "hidden",
    },
    selectedPointContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    selectedPointValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    selectedPointDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    timeframeContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 12,
    },
    timeframeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 4,
    },
    timeframeButtonActive: {
      backgroundColor: colors.primary,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
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
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      borderWidth: 1,
      borderColor: colors.border,
      marginLeft: 4,
    },
    customDateText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 4,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsLastRow: {
      borderBottomWidth: 0,
    },
    statsLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    statsValue: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 14,
    },
    loaderContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: 250,
    },
    noDataContainer: {
      height: 250,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    noDataIcon: {
      marginBottom: 12,
    },
    noDataTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    noDataText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    chartWrapper: {
      borderRadius: 16,
      overflow: "hidden",
    },
    tooltipContainer: {
      position: "absolute",
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
    },
    tooltipText: {
      color: colors.text,
      fontSize: 12,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{formatParamName(param)}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.dateRange}>
            {formatDate(dateRange.startDate, "custom")} -{" "}
            {formatDate(dateRange.endDate, "custom")}
          </Text>
        </View>

        <View style={styles.timeframeContainer}>
          {["1d", "1w", "1m"].map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf
                  ? styles.timeframeButtonActive
                  : styles.timeframeButtonInactive,
              ]}
              onPress={() => handleTimeframeChange(tf)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.timeframeText,
                  timeframe === tf
                    ? styles.timeframeTextActive
                    : styles.timeframeTextInactive,
                ]}
              >
                {tf === "1d" ? "1 Day" : tf === "1w" ? "1 Week" : "1 Month"}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.customDateButton}
            onPress={() => showDatePickerModal("start")}
            disabled={isLoading}
          >
            <Ionicons name="calendar-outline" size={14} color={colors.text} />
            <Text style={styles.customDateText}>Custom</Text>
          </TouchableOpacity>
        </View>

        {selectedPoint && (
          <View style={styles.selectedPointContainer}>
            <Text style={styles.selectedPointValue}>
              {formatValue(selectedPoint.value)}
            </Text>
            <Text style={styles.selectedPointDate}>
              {formatDate(selectedPoint.timestamp)}
            </Text>
          </View>
        )}

        <View style={styles.chartCard}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : chartData.datasets[0].data.length < 2 ? (
            <NoDataView />
          ) : (
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={width - 32}
                height={260}
                chartConfig={chartConfig}
                bezier
                style={{
                  borderRadius: 16,
                }}
                withShadow={true}
                withDots={false}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                yAxisLabel=""
                yAxisSuffix={` ${getUnit(param)}`}
                onDataPointClick={handleChartTouch}
                fromZero={false}
                segments={5}
                formatYLabel={(value) => parseFloat(value).toFixed(1)}
                renderDotContent={({ x, y, index }) => {
                  if (selectedPoint && selectedPoint.index === index) {
                    return (
                      <View
                        key={index}
                        style={{
                          position: "absolute",
                          left: x - 4,
                          top: y - 4,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary,
                        }}
                      />
                    );
                  }
                  return null;
                }}
              />

              {touchCoordinates && selectedPoint && (
                <View
                  style={[
                    styles.tooltipContainer,
                    {
                      left: Math.min(
                        Math.max(touchCoordinates.x - 50, 10),
                        width - 130
                      ),
                      top: Math.min(touchCoordinates.y - 40, 220),
                    },
                  ]}
                >
                  <Text style={styles.tooltipText}>
                    {formatValue(selectedPoint.value)}
                  </Text>
                  <Text style={styles.tooltipText}>
                    {formatDate(selectedPoint.timestamp)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Card style={styles.card}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average</Text>
            <Text style={styles.statsValue}>
              {isLoading ? "..." : `${stats.average} ${getUnit(param)}`}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Highest</Text>
            <Text style={styles.statsValue}>
              {isLoading ? "..." : `${stats.max} ${getUnit(param)}`}
            </Text>
          </View>
          <View style={[styles.statsRow, styles.statsLastRow]}>
            <Text style={styles.statsLabel}>Lowest</Text>
            <Text style={styles.statsValue}>
              {isLoading ? "..." : `${stats.min} ${getUnit(param)}`}
            </Text>
          </View>
        </Card>

        {showDatePicker && (
          <DateTimePicker
            value={
              datePickerType === "start"
                ? dateRange.startDate
                : dateRange.endDate
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            style={{ backgroundColor: colors.card }}
            textColor={colors.text}
          />
        )}
      </ScrollView>
    </View>
  );
}
