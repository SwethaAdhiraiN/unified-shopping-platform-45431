import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { fetchOrders } from '../../api/api';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-content">
        <h2>Orders</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: "100%", maxWidth: '700px', marginTop: 30 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminOrders;
