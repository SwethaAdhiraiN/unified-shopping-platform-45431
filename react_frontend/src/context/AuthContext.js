import React, { createContext, useState, useContext } from 'react';

// PUBLIC_INTERFACE
export const AuthContext = createContext();

/**
 * PUBLIC_INTERFACE
 * Provides authentication and simple admin state.
 */
export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    Boolean(localStorage.getItem('admin_token'))
  );

  // PUBLIC_INTERFACE
  const login = async ({ username, password }) => {
    // Simulate a mock login for demonstration.
    // Replace with real backend check if available.
    if (
      (username === 'admin' && password === 'adminpw') ||
      (username === 'root' && password === 'toor')
    ) {
      localStorage.setItem('admin_token', 'token-admin');
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
