import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const { isAdmin, adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    const resp = await adminLogin({ username, password });
    setProcessing(false);
    if (resp.success) {
      navigate('/admin');
    } else {
      setError(resp.message || 'Login failed');
    }
  };

  return (
    <form
      className="modal"
      style={{ margin: "4rem auto", maxWidth: 330 }}
      onSubmit={handleSubmit}
      aria-label="Admin Login"
    >
      <h2 style={{ textAlign: "center" }}>Admin Login</h2>
      <label>
        Username:
        <input
          autoFocus
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={processing}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={processing}
        />
      </label>
      {error && <div style={{ color: "red", margin: "1em 0" }}>{error}</div>}
      <button className="btn" style={{ width: "100%" }} disabled={processing}>
        {processing ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default AdminLogin;
