import { useEffect, useState } from "react";
import "./App.css";
import Questions from "./pages/Questions";

const THEME_STORAGE_KEY = "app_theme";

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
};

function App() {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`App theme-${theme}`}>
      <Questions theme={theme} onToggleTheme={handleToggleTheme} />
    </div>
  );
}

export default App;
