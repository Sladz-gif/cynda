import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Silence deprecated findDOMNode warning from react-quill
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
    return;
  }
  originalError(...args);
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("No root element found");
}
