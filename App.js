import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { TransactionProvider } from "./context/TransactionContext";

export default function App() {
  return (
    <PaperProvider>
      <TransactionProvider>
        <AppNavigator />
      </TransactionProvider>
    </PaperProvider>
  );
}
