import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const STORAGE_KEY = "pos_transactions";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        setTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setTransactions([]);
      }
    };

    load();
    const id = setInterval(load, 400);
    return () => clearInterval(id);
  }, []);

  function isInPeriod(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();

    if (period === "daily") return d.toDateString() === now.toDateString();
    if (period === "weekly") return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    if (period === "monthly")
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    return false;
  }

  const totalSales = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.total || 0), 0),
    [transactions]
  );

  const summaryTotal = useMemo(
    () =>
      transactions
        .filter((t) => isInPeriod(t.date))
        .reduce((sum, t) => sum + Number(t.total || 0), 0),
    [transactions, period]
  );

  const top5Items = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const name = t.itemName || "Unknown";
      map[name] = (map[name] || 0) + Number(t.qty || 0);
    }
    return Object.entries(map)
      .map(([itemName, qty]) => ({ itemName, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transactions]);

  const salesByProduct = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const name = t.itemName || "Unknown";
      if (!map[name]) map[name] = { itemName: name, qty: 0, revenue: 0 };
      map[name].qty += Number(t.qty || 0);
      map[name].revenue += Number(t.total || 0);
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  const salesOverTimeData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const date = t.date || "Unknown";
      map[date] = (map[date] || 0) + Number(t.total || 0);
    }
    return Object.entries(map)
      .map(([date, total]) => ({ date, total }))
      .filter((row) => row.date !== "Unknown")
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [transactions]);

  const salesByCategoryData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const cat = t.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + Number(t.total || 0);
    }
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  return (
    <div className="grid">
      <div className="card">
        <h2 className="h2">Dashboard</h2>
        <p className="muted">Overview of sales performance from localStorage transactions.</p>

        <div className="hr" />

        <div className="kpis">
          <div className="kpi">
            <div className="label">Total Sales (All Time)</div>
            <div className="value">{totalSales.toLocaleString()}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Sum of all transaction totals
            </div>
          </div>

          <div className="kpi">
            <div className="label">Sales Summary</div>
            <div className="value">{summaryTotal.toLocaleString()}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              {period === "daily" ? "Today" : period === "weekly" ? "Last 7 days" : "This month"}
            </div>
          </div>

          <div className="kpi">
            <div className="label">Transactions</div>
            <div className="value">{transactions.length}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Total records
            </div>
          </div>
        </div>

        <div className="hr" />

        <h3 className="h3">Sales Summary Period</h3>
        <div className="pills">
          <button className={`pill ${period === "daily" ? "pillActive" : ""}`} onClick={() => setPeriod("daily")}>
            Daily
          </button>
          <button className={`pill ${period === "weekly" ? "pillActive" : ""}`} onClick={() => setPeriod("weekly")}>
            Weekly
          </button>
          <button className={`pill ${period === "monthly" ? "pillActive" : ""}`} onClick={() => setPeriod("monthly")}>
            Monthly
          </button>
        </div>

        <div className="hr" />

        <h3 className="h3">Top 5 Selling Items</h3>
        {top5Items.length === 0 ? (
          <p className="muted">No sales data yet.</p>
        ) : (
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {top5Items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                <strong>{item.itemName}</strong>{" "}
                <span className="muted">— {item.qty} sold</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card">
        <h3 className="h3">Sales by Product</h3>
        <p className="muted">Total quantity and revenue per product.</p>

        <div className="hr" />

        {salesByProduct.length === 0 ? (
          <p className="muted">No sales data yet.</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Qty</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesByProduct.map((p) => (
                  <tr key={p.itemName}>
                    <td>{p.itemName}</td>
                    <td>{p.qty}</td>
                    <td>{Number(p.revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="hr" />

        <h3 className="h3">Charts</h3>

        <div style={{ marginTop: 10 }}>
          <div className="muted" style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
            Sales Over Time (Line)
          </div>

          <div style={{ width: "100%", height: 260 }}>
            {salesOverTimeData.length === 0 ? (
              <p className="muted">No chart data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.08)" />
                  <XAxis dataKey="date" stroke="rgba(0,0,0,.55)" />
                  <YAxis stroke="rgba(0,0,0,.55)" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="muted" style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
            Sales by Category (Bar)
          </div>

          <div style={{ width: "100%", height: 260 }}>
            {salesByCategoryData.length === 0 ? (
              <p className="muted">No chart data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.08)" />
                  <XAxis dataKey="category" stroke="rgba(0,0,0,.55)" />
                  <YAxis stroke="rgba(0,0,0,.55)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;