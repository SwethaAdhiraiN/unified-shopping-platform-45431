import React, { createContext, useState, useContext, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Authentication context: supports JWT-based customer login/signup, admin login, Google login, and role-based state.
 *
 * Provides:
 *   - user (object|null): { id, name, email, role }
 *   - token (JWT string|null)
 *   - login, signup, loginWithGoogle, logout functions
 *   - isAuthenticated (bool), isCustomer (bool), isAdmin (bool)
 */
export const AuthContext = createContext();

const LOCAL_TOKEN_KEY = "jwt_token";
const LOCAL_USER_KEY = "auth_user";
const ADMIN_TOKEN_KEY = "admin_token"; // legacy for admin login

const API_BASE =
  process.env.REACT_APP_API_URL || "https://mock.api.endpoint/v1";

/**
 * Try to parse JSON safely.
 */
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  // State: user is { id, name, email, role }, null if not logged in
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem(LOCAL_USER_KEY);
    return u ? safeParse(u) : null;
  });
  // JWT token for customer, null if not logged in
  const [token, setToken] = useState(() => localStorage.getItem(LOCAL_TOKEN_KEY));
  // Admin mode (separate/unified with customer)
  const [isAdmin, setIsAdmin] = useState(
    Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
  );

  // On mount, sync admin/customer mode from storage
  useEffect(() => {
    // If admin token exists, prioritize admin context for all /admin pages
    if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
      setIsAdmin(true);
      setUser(null);
      setToken(null);
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * JWT customer login. Accepts { email, password }
   * Calls /auth/login backend endpoint.
   * On success: stores JWT and sets user.
   */
  const login = async ({ email, password }) => {
    // Mock: Allow "customer@example.com" / "demo123", but replace with real fetch
    if (email === "customer@example.com" && password === "demo123") {
      const fakeUser = {
        id: 99,
        name: "Demo Customer",
        email,
        role: "customer",
      };
      const fakeJWT = "mocked-jwt-token-customer";
      localStorage.setItem(LOCAL_TOKEN_KEY, fakeJWT);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
      setToken(fakeJWT);
      setIsAdmin(false);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return { success: true };
    }
    // Real fetch (uncomment when backend ready)
    // try {
    //   const r = await fetch(`${API_BASE}/auth/login/`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   if (!r.ok) throw new Error("Invalid login");
    //   const data = await r.json();
    //   localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
    //   localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
    //   setUser(data.user);
    //   setToken(data.token);
    //   setIsAdmin(false);
    //   localStorage.removeItem(ADMIN_TOKEN_KEY);
    //   return { success: true };
    // } catch (e) {
    //   return { success: false, message: "Login failed" };
    // }
    return { success: false, message: "Invalid customer credentials" };
  };

  /**
   * PUBLIC_INTERFACE
   * Signup for customers. Accepts { name, email, password }
   * Calls /auth/signup backend endpoint.
   * On success: stores JWT and sets user.
   */
  const signup = async ({ name, email, password }) => {
    // Mock: Accept any new email (except "customer@example.com")
    if (email !== "customer@example.com") {
      const fakeUser = {
        id: Math.floor(Math.random() * 100000),
        name,
        email,
        role: "customer",
      };
      const fakeJWT = "mocked-jwt-token-customer";
      localStorage.setItem(LOCAL_TOKEN_KEY, fakeJWT);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
      setToken(fakeJWT);
      setIsAdmin(false);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return { success: true };
    }
    // Real fetch (uncomment when backend ready)
    // try {
    //   const r = await fetch(`${API_BASE}/auth/signup/`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ name, email, password }),
    //   });
    //   if (!r.ok) throw new Error("Signup failed");
    //   const data = await r.json();
    //   localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
    //   localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
    //   setUser(data.user);
    //   setToken(data.token);
    //   setIsAdmin(false);
    //   localStorage.removeItem(ADMIN_TOKEN_KEY);
    //   return { success: true };
    // } catch (e) {
    //   return { success: false, message: "Signup failed" };
    // }
    return { success: false, message: "Email in use" };
  };

  /**
   * PUBLIC_INTERFACE
   * Google login for customers. Accepts Google credential response.
   * Calls /auth/google backend endpoint.
   * On success: sets JWT token and user.
   */
  const loginWithGoogle = async (googleCredential = undefined) => {
    // TODO: Integrate Google OAuth popup -- use client library/script
    // For now, mock as if Google returned successful profile:
    if (googleCredential) {
      const fakeUser = {
        id: Math.floor(Math.random() * 100000),
        name: "Google User",
        email: "googleuser@demo.com",
        role: "customer",
      };
      const fakeJWT = "mocked-jwt-token-google";
      localStorage.setItem(LOCAL_TOKEN_KEY, fakeJWT);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
      setToken(fakeJWT);
      setIsAdmin(false);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return { success: true };
    }
    return { success: false, message: "Google login failed (simulated)" };
  };

  /**
   * PUBLIC_INTERFACE
   * Admin login for /admin section. (Legacy fallback)
   * Accepts { username, password }
   * Only allows pre-defined admin for demo.
   */
  const adminLogin = async ({ username, password }) => {
    if (
      (username === "admin" && password === "adminpw") ||
      (username === "root" && password === "toor")
    ) {
      localStorage.setItem(ADMIN_TOKEN_KEY, "token-admin");
      setIsAdmin(true);
      setUser(null);
      setToken(null);
      return { success: true };
    }
    return { success: false, message: "Invalid credentials" };
  };

  /**
   * PUBLIC_INTERFACE
   * Logs out both customer and admin.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  // State helpers:
  const isAuthenticated = Boolean(user && token);
  const isCustomer = isAuthenticated && user.role === "customer";
  // For admin-only pages:
  // isAdmin (bool) is separate. Only used for legacy /admin login. (Eventually unify roles.)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isCustomer,
        isAdmin,
        login,
        signup,
        loginWithGoogle,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
