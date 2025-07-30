import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { differenceInDays, differenceInWeeks, differenceInMonths, addDays, addWeeks, addMonths } from 'date-fns';

export const TransactionContext = createContext();

const STORAGE_KEY = "transactions";

function generateRecurringTransactions(existingTransactions) {
  const now = new Date();
  let newTransactions = [...existingTransactions];

  existingTransactions.forEach(tx => {
    if (tx.isRecurring && tx.recurrenceType && tx.recurrenceStartDate) {
      let lastDate = new Date(tx.date);
      let startDate = new Date(tx.recurrenceStartDate);

      let intervalFn, diffFn;
      if (tx.recurrenceType === 'daily') {
        intervalFn = addDays;
        diffFn = differenceInDays;
      } else if (tx.recurrenceType === 'weekly') {
        intervalFn = addWeeks;
        diffFn = differenceInWeeks;
      } else if (tx.recurrenceType === 'monthly') {
        intervalFn = addMonths;
        diffFn = differenceInMonths;
      }

      let diff = diffFn(now, lastDate);
      for (let i = 1; i <= diff; i++) {
        let nextDate = intervalFn(lastDate, i);
        if (nextDate > now) break;
        // Only add if not already present
        if (!existingTransactions.find(t => t.isRecurring && t.recurrenceStartDate === tx.recurrenceStartDate && t.date === nextDate.toISOString())) {
          newTransactions.push({
            ...tx,
            id: Date.now().toString() + Math.random(),
            date: nextDate.toISOString(),
          });
        }
      }
    }
  });

  return newTransactions;
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          let loaded = JSON.parse(stored);
          loaded = generateRecurringTransactions(loaded);
          setTransactions(loaded);
        }
      } catch (e) {
        console.error('Failed to load transactions:', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function addTransaction(transaction) {
    setTransactions((prev) => [transaction, ...prev]);
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  function editTransaction(updatedTransaction) {
    setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)))
  }

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, editTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}
