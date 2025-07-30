import React, { useState, useContext } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Avatar,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TransactionContext } from "../context/TransactionContext";
import { categories } from "../constants/categories";

export default function AddTransactionScreen({ navigation, route }) {
  const theme = useTheme();
  const { addTransaction, editTransaction } = useContext(TransactionContext);

  const editing = route.params?.transaction;
  const [type, setType] = useState(editing?.type || "expense");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [category, setCategory] = useState(editing?.category || "");
  const [note, setNote] = useState(editing?.note || "");
  const [isRecurring, setIsRecurring] = useState(editing?.isRecurring || false);
  const [recurrenceType, setRecurrenceType] = useState(editing?.recurrenceType || "monthly");
  const [date, setDate] = useState(editing?.date ? new Date(editing.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);

  function getCategoryObj(name) {
    return categories.find((c) => c.name === name) || categories[categories.length - 1];
  }

  function handleSubmit() {
    if (!amount || !category) {
      return;
    }

    const transaction = {
      id: editing?.id || Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      note,
      date: date.toISOString(),
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceStartDate: isRecurring ? (editing?.recurrenceStartDate || new Date().toISOString()) : null,
    };

    if (editing) {
      editTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
    navigation.goBack();
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineSmall" style={styles.title}>
          {editing ? "Edit Transaction" : "Add Transaction"}
        </Text>

        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
              { borderColor: theme.colors.primary }
            ]}
            onPress={() => setType('expense')}
          >
            <MaterialCommunityIcons 
              name="arrow-up" 
              size={24} 
              color={type === 'expense' ? '#fff' : '#F44336'} 
            />
            <Text 
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActive
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
              { borderColor: theme.colors.primary }
            ]}
            onPress={() => setType('income')}
          >
            <MaterialCommunityIcons 
              name="arrow-down" 
              size={24} 
              color={type === 'income' ? '#fff' : '#4CAF50'} 
            />
            <Text 
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Affix text="$" />}
          theme={{
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.surface,
            }
          }}
        />

        {/* Date Picker */}
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}

        {/* Category Picker */}
        <TouchableOpacity 
          style={styles.categoryPickerButton}
          onPress={() => setShowCategoryPicker(true)}
        >
          {category ? (
            <View style={styles.categorySelected}>
              <Avatar.Icon
                size={36}
                icon={getCategoryObj(category).icon}
                style={{ 
                  backgroundColor: getCategoryObj(category).color,
                  marginRight: 12
                }}
              />
              <Text style={styles.categorySelectedText}>{category}</Text>
            </View>
          ) : (
            <Text style={styles.categoryPlaceholder}>Select Category</Text>
          )}
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={styles.categoryOption}
                    onPress={() => {
                      setCategory(cat.name);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Avatar.Icon
                      size={40}
                      icon={cat.icon}
                      style={{ backgroundColor: cat.color, marginRight: 16 }}
                    />
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button 
                onPress={() => setShowCategoryPicker(false)}
                style={styles.modalCloseButton}
              >
                Close
              </Button>
            </View>
          </View>
        )}

        {/* Note Input */}
        <TextInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          theme={{
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.surface,
            }
          }}
        />

        {/* Recurring Transaction */}
        <View style={styles.recurringContainer}>
          <TouchableOpacity
            style={styles.recurringCheckbox}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={[
              styles.checkbox,
              isRecurring && styles.checkboxChecked,
              { borderColor: theme.colors.primary }
            ]}>
              {isRecurring && (
                <MaterialCommunityIcons 
                  name="check" 
                  size={20} 
                  color={theme.colors.primary} 
                />
              )}
            </View>
            <Text style={styles.recurringText}>Recurring Transaction</Text>
          </TouchableOpacity>

          {isRecurring && (
            <TouchableOpacity
              style={styles.recurrencePickerButton}
              onPress={() => setShowRecurrencePicker(true)}
            >
              <Text style={styles.recurrenceText}>
                {recurrenceType.charAt(0).toUpperCase() + recurrenceType.slice(1)}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Recurrence Picker Modal */}
        {showRecurrencePicker && (
          <View style={styles.recurrenceModal}>
            <View style={styles.recurrenceModalContent}>
              <Text style={styles.modalTitle}>Recurrence</Text>
              {['daily', 'weekly', 'monthly'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.recurrenceOption}
                  onPress={() => {
                    setRecurrenceType(type);
                    setShowRecurrencePicker(false);
                  }}
                >
                  <Text style={styles.recurrenceOptionText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  {recurrenceType === type && (
                    <MaterialCommunityIcons 
                      name="check" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
              <Button 
                onPress={() => setShowRecurrencePicker(false)}
                style={styles.modalCloseButton}
              >
                Close
              </Button>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.submitButton}
          labelStyle={styles.submitButtonText}
        >
          {editing ? "Save Changes" : "Add Transaction"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3b5998',
    borderColor: '#3b5998',
  },
  typeButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateText: {
    marginLeft: 8,
    flex: 1,
  },
  categoryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  categorySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categorySelectedText: {
    marginLeft: 8,
  },
  categoryPlaceholder: {
    flex: 1,
    color: '#999',
  },
  categoryModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  categoryModalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '70%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
  },
  recurringContainer: {
    marginBottom: 24,
  },
  recurringCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#e3f2fd',
  },
  recurringText: {
    fontSize: 16,
  },
  recurrencePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recurrenceText: {
    flex: 1,
  },
  recurrenceModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  recurrenceModalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  recurrenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recurrenceOptionText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b5998',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});