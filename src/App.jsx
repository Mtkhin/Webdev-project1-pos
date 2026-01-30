import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import SalesJournal from "./pages/SalesJournal";
import shopIcon from "./assets/shop.png";

const THEME_KEY = "pos_theme"; // "light" | "dark"

function App() {
  const [page, setPage] = useState("dashboard");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const t = saved === "dark" ? "dark" : "light";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  // Apply theme when changed
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
        <img src={shopIcon} alt="Shop Logo" className="logoImg" />
          <div>
            <h1 className="title">MH POS System</h1>
            <p className="subtitle">by MayThuKhin & HsuShweYaung</p>
          </div>
        </div>

        <div className="navRight">
          <div className="nav">
            <button
              className={`btn ${page === "dashboard" ? "btnActive" : "btnGhost"}`}
              onClick={() => setPage("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`btn ${page === "journal" ? "btnActive" : "btnGhost"}`}
              onClick={() => setPage("journal")}
            >
              Sales Journal
            </button>
          </div>

          <button
            className="btn btnGhost"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      <div className="main">
        {page === "dashboard" ? <Dashboard /> : <SalesJournal />}
      </div>
    </div>
  );
}

export default App;