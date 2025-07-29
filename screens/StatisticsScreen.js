import React, { useContext, useState } from "react";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TransactionContext } from "../context/TransactionContext";

export default function StatisticsScreen() {
  const { transactions } = useContext(TransactionContext);

  // Date range state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Filter transactions by date range
  const filteredExpenses = transactions.filter((t) => {
    if (t.type !== "expense") return false;
    const txDate = new Date(t.date);
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });

  // Group by category
  const categoryTotals = filteredExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map((cat, idx) => ({
    name: cat,
    amount: categoryTotals[cat],
    color: chartColors[idx % chartColors.length],
    legendFontColor: "#333",
    legendFontSize: 14,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
        Expense Breakdown
      </Text>
      <View
        style={{ flexDirection: "row", marginBottom: 16, alignItems: "center" }}
      >
        <Button
          mode="outlined"
          onPress={() => setShowStartPicker(true)}
          style={{ marginRight: 8 }}
        >
          {startDate ? startDate.toLocaleDateString() : "Start Date"}
        </Button>
        <Button mode="outlined" onPress={() => setShowEndPicker(true)}>
          {endDate ? endDate.toLocaleDateString() : "End Date"}
        </Button>
        {(startDate || endDate) && (
          <Button
            mode="text"
            onPress={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Reset
          </Button>
        )}
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
      {/* PieChart code, but use filteredExpenses */}
      {chartData.length > 0 ? (
        <PieChart
          data={chartData.map((d) => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: d.legendFontColor,
            legendFontSize: d.legendFontSize,
          }))}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text>No expense data to show.</Text>
      )}
    </ScrollView>
  );
}

const chartColors = [
  "#ff6384",
  "#36a2eb",
  "#ffce56",
  "#4bc0c0",
  "#9966ff",
  "#f67019",
  "#f53794",
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
  },
});
