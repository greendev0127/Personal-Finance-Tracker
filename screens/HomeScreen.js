import React, {useContext} from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Button, Card, Surface  } from "react-native-paper";
import { TransactionContext } from "../context/TransactionContext";

export default function HomeScreen({ navigation }) {
	const {transactions}  = useContext(TransactionContext)

	// Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Personal Finance Tracker</Text>

      {/* Summary Section */}
      <Surface style={styles.summaryContainer} elevation={2}>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Balance</Text>
          <Text variant="titleLarge" style={{color: balance >= 0 ? '#388e3c' : '#d32f2f'}}>
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Income</Text>
          <Text style={{color: '#388e3c'}}>+${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Expense</Text>
          <Text style={{color: '#d32f2f'}}>- ${totalExpense.toFixed(2)}</Text>
        </View>
      </Surface>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Add Transaction')}
        style={styles.button}
      >
        Add Transaction
      </Button>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.category} ({item.type})</Text>
              <Text>Amount: ${item.amount}</Text>
              {item.note ? <Text>Note: {item.note}</Text> : null}
              <Text>Date: {new Date(item.date).toLocaleString()}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{marginTop: 30}}>No transactions yet.</Text>}
        style={{marginTop: 20}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { marginBottom: 20, textAlign: 'center' },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  summaryItem: { alignItems: 'center' },
  button: { marginBottom: 20 },
  card: { marginBottom: 10 },
});