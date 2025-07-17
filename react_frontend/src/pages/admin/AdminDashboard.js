import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminDashboard() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <h2>Welcome, Admin</h2>
        <p>Use the sidebar to manage products and orders.</p>
      </main>
    </div>
  );
}

export default AdminDashboard;
