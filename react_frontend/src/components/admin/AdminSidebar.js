import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Admin sidebar navigation for dashboard, products, and orders.
 */
function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <NavLink end to="/admin" className={({ isActive }) => 'admin-sidebar-link' + (isActive ? ' active' : '')}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/products" className={({ isActive }) => 'admin-sidebar-link' + (isActive ? ' active' : '')}>
        Products
      </NavLink>
      <NavLink to="/admin/orders" className={({ isActive }) => 'admin-sidebar-link' + (isActive ? ' active' : '')}>
        Orders
      </NavLink>
    </aside>
  );
}

export default AdminSidebar;
