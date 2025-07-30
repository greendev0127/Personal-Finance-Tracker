import React, { useContext, useState } from "react";
import { View, Dimensions, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { PieChart, BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionContext } from "../context/TransactionContext";
import { LinearGradient } from 'expo-linear-gradient';

export default function StatisticsScreen() {
  const theme = useTheme();
  const { transactions } = useContext(TransactionContext);

  // Date range state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'income'

  // Filter transactions by date range and type
  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });

  const filteredExpenses = filteredTransactions.filter(t => t.type === "expense");
  const filteredIncome = filteredTransactions.filter(t => t.type === "income");

  // Group by category
  const expenseTotals = filteredExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const incomeTotals = filteredIncome.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // Prepare chart data
  const expenseChartData = Object.keys(expenseTotals).map((cat, idx) => ({
    name: cat,
    amount: expenseTotals[cat],
    color: expenseColors[idx % expenseColors.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  const incomeChartData = Object.keys(incomeTotals).map((cat, idx) => ({
    name: cat,
    amount: incomeTotals[cat],
    color: incomeColors[idx % incomeColors.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, t) => sum + t.amount, 0);

  const handleDateChange = (date, setDate, setShowPicker) => {
    setShowPicker(false);
    if (date) setDate(date);
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Financial Statistics</Text>
        
        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <MaterialCommunityIcons name="calendar-start" size={18} color="#fff" />
            <Text style={styles.dateButtonText}>
              {startDate ? startDate.toLocaleDateString() : "Start Date"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.dateRangeSeparator}>to</Text>
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <MaterialCommunityIcons name="calendar-end" size={18} color="#fff" />
            <Text style={styles.dateButtonText}>
              {endDate ? endDate.toLocaleDateString() : "End Date"}
            </Text>
          </TouchableOpacity>
          
          {(startDate || endDate) && (
            <TouchableOpacity onPress={clearDateFilters}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="spinner"
          onChange={(_, date) => handleDateChange(date, setStartDate, setShowStartPicker)}
          maximumDate={endDate || new Date()}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="spinner"
          onChange={(_, date) => handleDateChange(date, setEndDate, setShowEndPicker)}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <TouchableOpacity 
            style={[
              styles.summaryCard, 
              activeTab === 'income' && styles.activeSummaryCard
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.incomeAmount}>${totalIncome.toFixed(2)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.summaryCard, 
              activeTab === 'expenses' && styles.activeSummaryCard
            ]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.expenseAmount}>${totalExpenses.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'expenses' ? (
          <>
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            
            {expenseChartData.length > 0 ? (
              <>
                <PieChart
                  data={expenseChartData}
                  width={Dimensions.get("window").width - 32}
                  height={200}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.chart}
                />
                
                <BarChart
                  data={{
                    labels: expenseChartData.map(item => item.name),
                    datasets: [{
                      data: expenseChartData.map(item => item.amount)
                    }]
                  }}
                  width={Dimensions.get("window").width - 32}
                  height={220}
                  yAxisLabel="$"
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="chart-pie" size={48} color="#aaa" />
                <Text style={styles.emptyStateText}>No expense data available</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Income Breakdown</Text>
            
            {incomeChartData.length > 0 ? (
              <>
                <PieChart
                  data={incomeChartData}
                  width={Dimensions.get("window").width - 32}
                  height={200}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.chart}
                />
                
                <BarChart
                  data={{
                    labels: incomeChartData.map(item => item.name),
                    datasets: [{
                      data: incomeChartData.map(item => item.amount)
                    }]
                  }}
                  width={Dimensions.get("window").width - 32}
                  height={220}
                  yAxisLabel="$"
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="chart-bar" size={48} color="#aaa" />
                <Text style={styles.emptyStateText}>No income data available</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const expenseColors = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#673AB7", // Deep Purple
  "#E91E63", // Pink
  "#795548", // Brown
  "#9E9E9E", // Grey
  "#00BCD4", // Cyan
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFC107", // Amber
  "#FF5722", // Deep Orange
  "#9C27B0", // Purple
];

const incomeColors = [
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#00BCD4", // Cyan
  "#2196F3", // Blue
  "#3F51B5", // Indigo
  "#673AB7", // Deep Purple
  "#009688", // Teal
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#AED581", // Light Green 2
  "#81C784", // Green 2
  "#4DB6AC", // Teal 2
  "#64B5F6", // Blue 2
  "#9575CD", // Deep Purple 2
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  dateButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  dateRangeSeparator: {
    color: '#fff',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
  },
  activeSummaryCard: {
    borderWidth: 2,
    borderColor: '#3b5998',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#333',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});