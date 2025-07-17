import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

/**
 * Customer authentication page (login/signup) with JWT, social login.
 * Props:
 *   - redirectTo: string to redirect if already logged in.
 */
function CustomerAuth({ redirectTo = "/" }) {
  const { isAuthenticated, login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Login or signup handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    let resp;
    if (mode === "login") {
      resp = await login({ email: form.email, password: form.password });
    } else {
      resp = await signup({ name: form.name, email: form.email, password: form.password });
    }
    setProcessing(false);
    if (resp.success) {
      navigate(redirectTo);
    } else {
      setError(resp.message || `Failed to ${mode}`);
    }
  };

  // Google OAuth mock (real apps should launch Google button/popup)
  const handleGoogle = async () => {
    setProcessing(true);
    setError("");
    // Simulate Google credential (should use Google lib in live)
    const resp = await loginWithGoogle("mock-google-credential");
    setProcessing(false);
    if (resp.success) {
      navigate(redirectTo);
    } else {
      setError(resp.message || "Google login failed");
    }
  };

  return (
    <form
      className="modal form-auth"
      onSubmit={handleSubmit}
      aria-label={mode === "login" ? "Customer Login" : "Sign up"}
    >
      <h2 className="auth-title">{mode === "login" ? "Login to Shop" : "Create Account"}</h2>
      <div className="form-fields">
        {mode === "signup" && (
          <div className="form-control">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              value={form.name}
              disabled={processing}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
        )}
        <div className="form-control">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus={mode === "login"}
            autoComplete="username"
            value={form.email}
            disabled={processing}
            onChange={handleChange}
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={form.password}
            disabled={processing}
            onChange={handleChange}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>
      <button className="btn btn-block" type="submit" disabled={processing}>
        {processing
          ? mode === "login"
            ? "Signing in..."
            : "Signing up..."
          : mode === "login"
            ? "Sign In"
            : "Sign Up"}
      </button>
      <div className="auth-divider"><span>or</span></div>
      <button
        type="button"
        className="btn secondary btn-block google-btn"
        onClick={handleGoogle}
        disabled={processing}
        aria-label="Sign in with Google"
      >
        <span role="img" aria-label="Google" style={{ marginRight: 8 }}>🔒</span>
        Continue with Google
      </button>
      <div className="toggle-auth-link">
        {mode === "login" ? (
          <>
            New?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setMode("login"); setError(""); }}
            >
              Login
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export default CustomerAuth;
