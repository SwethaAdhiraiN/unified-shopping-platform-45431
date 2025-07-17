import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { adminFetchProducts, adminUpdateProduct } from '../../api/api';

function ProductEditModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...product }));

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(curr => ({ ...curr, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="modal"
        style={{ maxWidth: 390 }}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3>Edit Product</h3>
        <label>
          Name:
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Image URL:
          <input name="image" value={form.image} onChange={handleChange} />
        </label>
        <label>
          Price:
          <input type="number" name="price" value={form.price} step="0.01" min="0" onChange={handleChange} />
        </label>
        <label>
          Stock:
          <input type="number" name="stock" value={form.stock} min="0" onChange={handleChange} />
        </label>
        <label>
          Category:
          <input name="category" value={form.category} onChange={handleChange} />
        </label>
        <div style={{ marginTop: 15, display: "flex", gap: "12px" }}>
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminFetchProducts().then(d => {
      setProducts(d);
      setLoading(false);
    });
  }, []);

  const handleEdit = (product) => setEditing(product);

  const handleSave = async (updated) => {
    await adminUpdateProduct(updated); // Replace with real call
    setProducts(prev =>
      prev.map(p => (p.id === updated.id ? { ...updated } : p))
    );
    setEditing(null);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-content">
        <h2>Products</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: "100%", maxWidth: '680px', marginTop: 30 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>{prod.name}</td>
                  <td>${prod.price.toFixed(2)}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.category}</td>
                  <td>
                    <button className="btn secondary" onClick={() => handleEdit(prod)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {editing && (
          <ProductEditModal
            product={editing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        )}
      </section>
    </div>
  );
}

export default AdminProducts;
