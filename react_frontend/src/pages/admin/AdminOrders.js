import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { fetchOrders } from '../../api/api';
import { downloadOrderPDF } from './AdminUtils';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced search/filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [allStatuses, setAllStatuses] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchOrders().then(data => {
      setOrders(data);
      setLoading(false);
      setAllStatuses(["", ...new Set(data.map((o) => o.status))]);
    });
  }, []);

  const filtered = orders.filter(o =>
    (!search ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search.trim()) ||
      (o.items || []).some(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    ) && (!status || o.status === status)
  );

  const handlePDF = (order, type) => {
    downloadOrderPDF(order, type || "invoice");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-content">
        <h2>Orders</h2>
        <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
          <input
            type="search"
            placeholder="Search by customer, order #, product"
            value={search}
            style={{ minWidth: 190, maxWidth: 250 }}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {allStatuses.map((s, i) => (
              <option key={i} value={s}>{s ? s : "All Statuses"}</option>
            ))}
          </select>
          <button className="btn" onClick={() => { setSearch(""); setStatus(""); }}>Clear</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: "100%", maxWidth: '700px', marginTop: 13 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th style={{ minWidth: 80 }}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <ul style={{ paddingLeft: 10 }}>
                      {order.items.map((item, idx) =>
                        <li key={idx}>
                          {item.qty} × {item.name}&nbsp;@${item.price.toFixed(2)}
                        </li>
                      )}
                    </ul>
                  </td>
                  <td><strong style={{ color: "var(--primary)" }}>${order.total.toFixed(2)}</strong></td>
                  <td>{order.status}</td>
                  <td>{order.created}</td>
                  <td>
                    <button
                      className="btn secondary"
                      title="Download Invoice PDF"
                      style={{ padding: "0.4em 1em", marginRight: "0.3em" }}
                      onClick={() => handlePDF(order, "invoice")}
                    >Invoice</button>
                    <button
                      className="btn secondary"
                      title="Download Receipt PDF"
                      style={{ padding: "0.4em 0.95em"}}
                      onClick={() => handlePDF(order, "receipt")}
                    >Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ color: "#888", margin: "23px 0" }}>No matching orders.</div>
        )}
      </section>
    </div>
  );
}

export default AdminOrders;
