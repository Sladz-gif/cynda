import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { supabase } from "./lib/supabase";
import { useIndustryStore } from "./lib/industry-store";

// Silence deprecated findDOMNode warning from react-quill
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
    return;
  }
  originalError(...args);
};

// Initialize auth listener
const initializeAuth = async () => {
  // Check initial session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (session) {
    useIndustryStore.getState().setAuthenticated(true);
    // Set a basic admin profile based on session user email
    useIndustryStore.getState().setAdminProfile({
      name: session.user.email?.split('@')[0] || "User",
      email: session.user.email || "",
      role: "Director"
    });
    useIndustryStore.getState().setOnboarded(true);
  }
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      useIndustryStore.getState().setAuthenticated(true);
      useIndustryStore.getState().setAdminProfile({
        name: session.user.email?.split('@')[0] || "User",
        email: session.user.email || "",
        role: "Director"
      });
      useIndustryStore.getState().setOnboarded(true);
    } else {
      useIndustryStore.getState().setAuthenticated(false);
      useIndustryStore.getState().setAdminProfile(null);
    }
  });
};

initializeAuth();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("No root element found");
}
