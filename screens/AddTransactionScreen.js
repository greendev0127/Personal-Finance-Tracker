import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Menu,
  IconButton,
  Avatar,
} from "react-native-paper";

import { TransactionContext } from "../context/TransactionContext";
import { categories } from "../constants/categories";

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction, editTransaction } = useContext(TransactionContext);

  const editing = route.params && route.params.transaction;

  const [type, setType] = useState(
    editing ? route.params.transaction.type : "expense"
  );
  const [amount, setAmount] = useState(
    editing ? String(route.params.transaction.amount) : ""
  );
  const [category, setCategory] = useState(
    editing ? route.params.transaction.category : ""
  );
  const [note, setNote] = useState(
    editing ? route.params.transaction.note : ""
  );
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  function getCategoryObj(name) {
    return (
      categories.find((c) => c.name === name) ||
      categories[categories.length - 1]
    );
  }

  function handleSubmit() {
    if (!amount || !category) {
      return;
    }

    const transaction = {
      id: editing ? route.params.transaction.id : Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      note,
      date: editing ? route.params.transaction.date : new Date().toISOString(),
    };

    if (editing) {
      editTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">
        {editing ? "Edit Transaction" : "Add Transaction"}
      </Text>
      <RadioButton.Group onValueChange={setType} value={type}>
        <View style={styles.radioRow}>
          <RadioButton value="expense" />
          <Text>Expense</Text>
          <RadioButton value="income" />
          <Text>Income</Text>
        </View>
      </RadioButton.Group>
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Text style={{ marginTop: 10, marginBottom: 4 }}>Category</Text>
      <Menu
        visible={categoryMenuVisible}
        onDismiss={() => setCategoryMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            icon={getCategoryObj(category).icon}
            onPress={() => setCategoryMenuVisible(true)}
            style={{ marginBottom: 8 }}
          >
            {category || "Select Category"}
          </Button>
        }
      >
        {categories.map((cat) => (
          <Menu.Item
            key={cat.name}
            onPress={() => {
              setCategory(cat.name);
              setCategoryMenuVisible(false);
            }}
            title={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar.Icon
                  size={24}
                  icon={cat.icon}
                  style={{ backgroundColor: cat.color, marginRight: 8 }}
                />
                <Text>{cat.name}</Text>
              </View>
            }
          />
        ))}
      </Menu>
      <TextInput
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        {editing ? "Save Changes" : "Add"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  input: { marginVertical: 8 },
  button: { marginTop: 20 },
});
