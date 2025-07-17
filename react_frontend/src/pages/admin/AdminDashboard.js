import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { fetchOrders, adminFetchProducts } from '../../api/api';

/**
 * PUBLIC_INTERFACE
 * Admin dashboard showing metrics and overview cards.
 */
function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    revenueMonth: 0,
    revenueYear: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      const [orders, products] = await Promise.all([
        fetchOrders(),
        adminFetchProducts()
      ]);
      // Metrics calculation
      const totalOrders = orders.length;
      const now = new Date();
      const thisMonth = now.toISOString().slice(0, 7); // yyyy-mm
      const thisYear = now.getFullYear();

      let revenueMonth = 0, revenueYear = 0, totalRevenue = 0;
      const productSales = {}; // id: qty

      orders.forEach(o => {
        totalRevenue += o.total || 0;
        if ((o.created||"").startsWith(thisMonth)) revenueMonth += o.total || 0;
        if ((o.created||"").startsWith(thisYear + "-")) revenueYear += o.total || 0;
        (o.items || []).forEach(item => {
          productSales[item.name] = (productSales[item.name] || 0) + (item.qty || 0);
        });
      });

      // Top products, by quantity sold
      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, qty]) => ({ name, qty }));

      setMetrics({
        totalOrders,
        totalRevenue,
        revenueMonth,
        revenueYear,
        topProducts
      });
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h2>Welcome, Admin</h2>
        <div style={{ marginBottom: 33 }}>
          <p>Store overview and stats:</p>
          {loading ? (
            <div>Loading metrics…</div>
          ) : (
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{
                background: "#fff",
                border: "1.5px solid #ececec",
                borderRadius: 8,
                padding: "1.5em 2.2em",
                minWidth: 180,
                boxShadow: "0 2px 10px rgba(236,65,134,0.05)"
              }}>
                <div style={{ color: "#ec4186", fontWeight: 700, fontSize: "2.0em" }}>{metrics.totalOrders}</div>
                <div style={{ color: "#676780" }}>Total Orders</div>
              </div>
              <div style={{
                background: "#fff",
                border: "1.5px solid #ececec",
                borderRadius: 8,
                padding: "1.5em 2.2em",
                minWidth: 180,
                boxShadow: "0 2px 10px rgba(236,65,134,0.05)"
              }}>
                <div style={{ color: "#21ab37", fontWeight: 700, fontSize: "1.46em" }}>
                  ${metrics.revenueMonth.toFixed(2)}
                </div>
                <div style={{ color: "#676780" }}>Sales (This Month)</div>
              </div>
              <div style={{
                background: "#fff",
                border: "1.5px solid #ececec",
                borderRadius: 8,
                padding: "1.5em 2.2em",
                minWidth: 180,
                boxShadow: "0 2px 10px rgba(236,65,134,0.05)"
              }}>
                <div style={{ color: "#38124a", fontWeight: 700, fontSize: "1.46em" }}>
                  ${metrics.revenueYear.toFixed(2)}
                </div>
                <div style={{ color: "#676780" }}>Sales (This Year)</div>
              </div>
              <div style={{
                background: "#fff",
                border: "1.5px solid #ececec",
                borderRadius: 8,
                padding: "1.5em 2.2em",
                minWidth: 220,
                boxShadow: "0 2px 10px rgba(236,65,134,0.05)"
              }}>
                <div style={{ color: "#ec4186", fontWeight: 600, fontSize: "1.05em" }}>Top Products</div>
                {metrics.topProducts.length === 0 ? (
                  <div style={{ fontSize: "0.98em", color: "#bbb" }}>No sales data yet.</div>
                ) : (
                  <ol style={{ padding: "0 0 0 19px" }}>
                    {metrics.topProducts.map((p, i) => (
                      <li key={i}>{p.name} <span style={{ color: "#38124a", fontWeight: 500 }}>×{p.qty}</span></li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
        <p>Use the sidebar to manage products and orders.</p>
      </main>
    </div>
  );
}

export default AdminDashboard;
