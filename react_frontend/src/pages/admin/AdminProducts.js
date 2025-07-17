import React, { useEffect, useState, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { adminFetchProducts, adminUpdateProduct } from '../../api/api';
import { parseInventoryCSV } from './AdminUtils';

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

// Bulk CSV Upload Modal
function BulkUploadModal({ onImport, onClose }) {
  const [csv, setCSV] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef();

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCSV(ev.target.result);
    reader.readAsText(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const products = parseInventoryCSV(csv);
      if (!products.length) {
        setError("No valid products found in CSV.");
        return;
      }
      onImport(products);
    } catch (err) {
      setError(err.message || "Invalid CSV format.");
    }
  }

  // CSV header note
  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Bulk Upload Inventory (CSV)</h3>
        <div style={{ fontSize: ".98em", color: "#888", marginBottom: 9 }}>
          CSV columns: <b>name,price,stock,category,image</b>
        </div>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} ref={fileInput} />
        <textarea
          rows={7}
          placeholder="Paste CSV here…"
          value={csv}
          onChange={e => setCSV(e.target.value)}
          style={{ width: "100%", margin: "10px 0", fontFamily: "monospace" }}
        />
        {error && <div style={{ color: "#e62c2c", marginBottom: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn" type="submit">Import</button>
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
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Advanced search/filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    adminFetchProducts().then(d => {
      setProducts(d);
      setLoading(false);
      setAllCategories([
        "",
        ...Array.from(new Set(d.map((p) => p.category).filter(Boolean)))
      ]);
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

  function handleBulkImport(arr) {
    // For demo, just append to list with mock ids. In real app: send to API!
    setProducts(prev => [
      ...prev,
      ...arr.map((p, i) => ({
        ...p,
        id: prev.length + i + 1000 // mock new id
      }))
    ]);
    setShowBulkUpload(false);
    // Optionally: show notification here.
  }

  // Filtering products
  const filtered = products.filter(p =>
    (!search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()))
    && (!category || p.category === category)
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-content">
        <h2>Products</h2>
        <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
          <input
            type="search"
            placeholder="Search by name/category"
            value={search}
            style={{ minWidth: 170, maxWidth: 230 }}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat ? cat : "All Categories"}</option>
            ))}
          </select>
          <button className="btn" onClick={() => { setSearch(""); setCategory(""); }}>Clear</button>
          <button className="btn secondary" onClick={() => setShowBulkUpload(true)} style={{marginLeft: "auto"}}>
            Bulk Upload (CSV)
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: "100%", maxWidth: '680px', marginTop: 10 }}>
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
              {filtered.map(prod => (
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
        {!loading && filtered.length === 0 && (
          <div style={{ color: "#888", margin: "23px 0" }}>No matching products.</div>
        )}
        {editing && (
          <ProductEditModal
            product={editing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        )}
        {showBulkUpload && (
          <BulkUploadModal
            onImport={handleBulkImport}
            onClose={() => setShowBulkUpload(false)}
          />
        )}
      </section>
    </div>
  );
}

export default AdminProducts;
