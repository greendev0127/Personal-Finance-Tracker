import React, { useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { TransactionContext } from '../context/TransactionContext';

export default function StatisticsScreen() {
  const { transactions } = useContext(TransactionContext);

  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense');

  // Group by category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // Prepare data for PieChart
  const chartData = Object.keys(categoryTotals).map((cat, idx) => ({
    name: cat,
    amount: categoryTotals[cat],
    color: chartColors[idx % chartColors.length],
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={{marginBottom: 20}}>Expense Breakdown</Text>
      {chartData.length > 0 ? (
        <PieChart
          data={chartData.map(d => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: d.legendFontColor,
            legendFontSize: d.legendFontSize,
          }))}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
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
  '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#f67019', '#f53794'
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
});