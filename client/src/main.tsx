import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling for initialization
try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  createRoot(root).render(<App />);
} catch (error) {
  console.error("Failed to initialize app:", error);
  
  // Fallback UI
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
          <h1>App Loading Error</h1>
          <p>Please check the console for details.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    `;
  }
}
