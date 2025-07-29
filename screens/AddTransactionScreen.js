import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import { TransactionContext } from "../context/TransactionContext";

export default function AddTransactionScreen({ navigation }) {
  const { addTransaction } = useContext(TransactionContext);

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit() {
    if (!amount || !category) {
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString(),
    };

    addTransaction(transaction);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Add Transaction</Text>
      <RadioButton.Group
        onValueChange={setType}
        value={type}
      >
				<View style={styles.radioRow}>
					<RadioButton value="expense"/>
					<Text>Expense</Text>
					<RadioButton value="income"/>
					<Text>Income</Text>
				</View>
			</RadioButton.Group>
			<TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
			<TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} />
			<TextInput label="Note (optional)" value={note} onChangeText={setNote} style={styles.input} />
			<Button mode="contained" onPress={handleSubmit} style={styles.button} >Add</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  input: { marginVertical: 8 },
  button: { marginTop: 20 },
});
