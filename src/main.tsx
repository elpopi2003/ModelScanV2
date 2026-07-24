import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Theme is managed by ThemeProvider
const stored = localStorage.getItem('stashmates-theme');
if (!stored || stored === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
