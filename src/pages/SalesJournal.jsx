import { useEffect, useMemo, useState } from "react";
import products from "../data/product-item.json";

const STORAGE_KEY = "pos_transactions";

function SalesJournal() {
  const [selectedName, setSelectedName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState("");

  // ✅ NEW: allow extra category not in list
  const [customCategory, setCustomCategory] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load first
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setTransactions(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save only after loaded
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, loaded]);

  const total = useMemo(() => {
    if (!selectedProduct) return 0;
    return Number(selectedProduct.unitPrice) * Number(qty || 0);
  }, [selectedProduct, qty]);

  function handleAddSale() {
    if (!selectedProduct) return alert("Please select a product.");
    if (!date) return alert("Please select a date.");
    if (!qty || qty <= 0) return alert("Quantity must be at least 1.");

    // ✅ If customCategory is typed, use it. Otherwise use product category.
    const finalCategory =
      customCategory.trim() !== ""
        ? customCategory.trim()
        : (selectedProduct.category || "Uncategorized");

    const newTx = {
      id: String(Date.now()),
      date,
      itemName: selectedProduct.itemName,
      category: finalCategory,
      unitPrice: Number(selectedProduct.unitPrice),
      qty: Number(qty),
      total: Number(selectedProduct.unitPrice) * Number(qty),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // reset form
    setSelectedName("");
    setSelectedProduct(null);
    setQty(1);
    setDate("");
    setCustomCategory("");
  }

  function handleDelete(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 className="h2">Sales Journal</h2>
        <p className="muted">Use this form to record daily sales transactions.</p>

        <div className="hr" />

        <div className="formStack">
          <div className="field">
            <label>Product</label>
            <select
              className="input selectWide"
              value={selectedName}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedName(name);
                const product = products.find((p) => p.itemName === name) || null;
                setSelectedProduct(product);

                // ✅ reset custom category when selecting a product (optional)
                setCustomCategory("");
              }}
            >
              <option value="">Select product</option>
              {products.map((p, idx) => (
                <option key={idx} value={p.itemName}>
                  {p.itemName} — {p.unitPrice}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Date</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Quantity</label>
            <input
              className="input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>

          {/* ✅ NEW: Custom category field */}
          <div className="field">
            <label>
              Category (Optional)
              {selectedProduct?.category ? (
                <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>
                  default: {selectedProduct.category}
                </span>
              ) : null}
            </label>
            <input
              className="input"
              type="text"
              placeholder="Type a custom category (e.g. drinks, gifts, seasonal)"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>

          <div className="totalBox">
            <div className="label">Total</div>
            <div className="value">{total.toLocaleString()}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              {selectedProduct ? `${selectedProduct.unitPrice} × ${qty}` : "Select a product"}
            </div>
          </div>

          <button className="btn btnPrimary" type="button" onClick={handleAddSale}>
            Add Sale
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="h3">Transactions</h3>
        <p className="muted">Review and manage recorded sales transactions.</p>

        <div className="hr" />

        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.itemName}</td>
                    <td>{t.category}</td>
                    <td>{Number(t.unitPrice).toLocaleString()}</td>
                    <td>{t.qty}</td>
                    <td>{Number(t.total).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btnDanger"
                        type="button"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesJournal;