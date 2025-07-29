import React, { useContext, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  Button,
  Card,
  Surface,
  IconButton,
  Menu,
  TextInput,
  Avatar,
} from "react-native-paper";
import { TransactionContext } from "../context/TransactionContext";
import { categories as categoryList } from "../constants/categories";

export default function HomeScreen({ navigation }) {
  const { transactions, deleteTransaction } = useContext(TransactionContext);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  function getCategoryObj(name) {
    return (
      categoryList.find((c) => c.name === name) ||
      categoryList[categoryList.length - 1]
    );
  }

  const categories = [
    "All",
    ...Array.from(new Set(transactions.map((t) => t.category))),
  ];

  const filteredTransactions = transactions.filter((t) => {
    const categoryMatch =
      selectedCategory === "All" || t.category === selectedCategory;
    const dateMatch = !selectedDate || t.date.startsWith(selectedDate);
    return categoryMatch && dateMatch;
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.container}>
      {/* Summary Section */}
      <Surface style={styles.summaryContainer} elevation={2}>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Balance</Text>
          <Text
            variant="titleLarge"
            style={{ color: balance >= 0 ? "#388e3c" : "#d32f2f" }}
          >
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Income</Text>
          <Text style={{ color: "#388e3c" }}>+${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="titleSmall">Expense</Text>
          <Text style={{ color: "#d32f2f" }}>- ${totalExpense.toFixed(2)}</Text>
        </View>
      </Surface>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate("Statistics")}
        style={{ marginBottom: 10 }}
      >
        View Statistics
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Add Transaction")}
        style={styles.button}
      >
        Add Transaction
      </Button>

      <View style={styles.filterRow}>
        {/* Category Filter */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              {selectedCategory}
            </Button>
          }
        >
          {categories.map((cat) => (
            <Menu.Item
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                setMenuVisible(false);
              }}
              title={cat}
            />
          ))}
        </Menu>
        {/* Date Filter */}
        <TextInput
          label="YYYY-MM-DD"
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.filterInput}
          placeholder="Filter by date"
        />
        <Button
          mode="text"
          onPress={() => {
            setSelectedCategory("All");
            setSelectedDate("");
          }}
        >
          Reset
        </Button>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const catObj = getCategoryObj(item.category);
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar.Icon
                    size={36}
                    icon={catObj.icon}
                    style={{ backgroundColor: catObj.color, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">
                      {item.category} ({item.type})
                    </Text>
                    <Text>Amount: ${item.amount}</Text>
                    {item.note ? <Text>Note: {item.note}</Text> : null}
                    <Text>Date: {new Date(item.date).toLocaleString()}</Text>
                  </View>
                  <IconButton
                    icon="pencil"
                    iconColor="#1976d2"
                    size={24}
                    onPress={() =>
                      navigation.navigate("Add Transaction", {
                        transaction: item,
                      })
                    }
                  />
                  <IconButton
                    icon="delete"
                    iconColor="#d32f2f"
                    size={24}
                    onPress={() => deleteTransaction(item.id)}
                  />
                </View>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={{ marginTop: 30 }}>No transactions yet.</Text>
        }
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { marginBottom: 20, textAlign: "center" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  summaryItem: { alignItems: "center" },
  button: { marginBottom: 20 },
  card: { marginBottom: 10 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    marginRight: 8,
  },
  filterInput: {
    width: 120,
    marginRight: 8,
  },
});
