import { ExpoRoot } from "expo-router";
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { Provider } from "react-redux";
import { store } from "./store"; // Adjust the path if your store is located elsewhere

// Import the require context for ExpoRoot
const ctx = (require as any).context("./app"); // Or (require as NodeRequire & { context: Function }).context("./app");

export default function App() {
  return (
    <Provider store={store}>
      <ExpoRoot context={ctx} />
      <StatusBar style="auto" />
    </Provider>
  );
}