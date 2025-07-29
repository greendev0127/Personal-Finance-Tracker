import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TransactionContext = createContext();

const STORAGE_KEY = "transactions";

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setTransactions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load transactions:", e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function addTransaction(transaction) {
    setTransactions((prev) => [transaction, ...prev]);
  }

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}
