import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import {
  Text,
  Button,
  Card,
  IconButton,
  Menu,
  TextInput,
  Avatar,
  useTheme,
} from "react-native-paper";
import { TransactionContext } from "../context/TransactionContext";
import { categories as categoryList } from "../constants/categories";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { transactions, addTransaction, deleteTransaction } =
    useContext(TransactionContext);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const scrollY = new Animated.Value(0);

  // Calculate header height animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 120],
    extrapolate: "clamp",
  });

  function getCategoryObj(name) {
    return (
      categoryList.find((c) => c.name === name) ||
      categoryList[categoryList.length - 1]
    );
  }

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDateObj(date);
      // Format as YYYY-MM-DD to match your existing format
      const formattedDate = date.toISOString().split("T")[0];
      setSelectedDate(formattedDate);
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDateObj(null);
    setSelectedDate("");
  };

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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.gradient}
        >
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>
              ${Math.abs(balance).toFixed(2)}
              <Text style={styles.balanceCurrency}> USD</Text>
            </Text>
            <View style={styles.incomeExpenseContainer}>
              <View style={styles.incomeContainer}>
                <MaterialCommunityIcons
                  name="arrow-down"
                  size={18}
                  color="#4CAF50"
                />
                <Text style={styles.incomeText}>${totalIncome.toFixed(2)}</Text>
              </View>
              <View style={styles.expenseContainer}>
                <MaterialCommunityIcons
                  name="arrow-up"
                  size={18}
                  color="#F44336"
                />
                <Text style={styles.expenseText}>
                  ${totalExpense.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Add Transaction")}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Statistics")}
            >
              <MaterialCommunityIcons name="chart-bar" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Stats</Text>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setMenuVisible(true)}
                >
                  <Text style={styles.filterButtonText}>
                    {selectedCategory}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
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
                  titleStyle={{ color: theme.colors.text }}
                />
              ))}
            </Menu>

            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#666" />
              <Text style={styles.dateFilterText}>
                {selectedDateObj
                  ? selectedDateObj.toLocaleDateString()
                  : "Select date"}
              </Text>
              {selectedDate && (
                <TouchableOpacity onPress={clearDateFilter}>
                  <MaterialCommunityIcons name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory("All");
                setSelectedDate("");
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDateObj || new Date()}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )}

          {/* Transactions List */}
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={48}
                color="#aaa"
              />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Add Transaction")}
                style={styles.addFirstButton}
              >
                Add Your First Transaction
              </Button>
            </View>
          ) : (
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const catObj = getCategoryObj(item.category);
                return (
                  <TouchableOpacity
                    style={styles.transactionCard}
                    onPress={() =>
                      navigation.navigate("Add Transaction", {
                        transaction: item,
                      })
                    }
                  >
                    <View style={styles.transactionLeft}>
                      <Avatar.Icon
                        size={40}
                        icon={catObj.icon}
                        style={{
                          backgroundColor: catObj.color,
                          marginRight: 16,
                        }}
                      />
                      <View>
                        <Text style={styles.transactionCategory}>
                          {item.category}
                        </Text>
                        <Text style={styles.transactionNote}>
                          {item.note || "No description"}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(item.date).toLocaleDateString()}
                          {item.isRecurring && (
                            <Text style={styles.recurringTag}>
                              • {item.recurrenceType}
                            </Text>
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          item.type === "income"
                            ? styles.incomeAmount
                            : styles.expenseAmount,
                        ]}
                      >
                        {item.type === "income" ? "+" : "-"}$
                        {item.amount.toFixed(2)}
                      </Text>
                      <View style={styles.transactionActions}>
                        <IconButton
                          icon="pencil"
                          size={18}
                          onPress={() =>
                            navigation.navigate("Add Transaction", {
                              transaction: item,
                            })
                          }
                          style={styles.editButton}
                        />
                        <IconButton
                          icon="delete"
                          size={18}
                          onPress={() => deleteTransaction(item.id)}
                          style={styles.deleteButton}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Add Transaction")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  balanceContainer: {
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: "400",
    opacity: 0.8,
  },
  incomeExpenseContainer: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-around",
    width: "80%",
  },
  incomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expenseContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  incomeText: {
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "600",
  },
  expenseText: {
    color: "#F44336",
    marginLeft: 4,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: 80, // Initial header height - adjust as needed
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    marginTop: -40,
  },
  actionButton: {
    backgroundColor: "#3b5998",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  actionButtonText: {
    color: "#fff",
    marginTop: 4,
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: "row",
    display: "flex",
    width: "100%",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterButtonText: {
    flex: 1,
    color: "#333",
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
  },
  
  dateFilterText: {
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
    color: '#333',
  },
  resetButton: {
    padding: 10,
  },
  resetButtonText: {
    color: "#3b5998",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
    color: "#333",
  },
  transactionNote: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
  },
  recurringTag: {
    color: "#3b5998",
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  incomeAmount: {
    color: "#4CAF50",
  },
  expenseAmount: {
    color: "#F44336",
  },
  transactionActions: {
    flexDirection: "row",
  },
  editButton: {
    margin: 0,
    marginRight: -8,
  },
  deleteButton: {
    margin: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstButton: {
    width: "100%",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b5998",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
