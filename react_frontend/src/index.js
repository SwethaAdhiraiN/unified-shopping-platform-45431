import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { StripeProvider } from "./context/StripeContext";

/**
 * Entry point: Bootstraps and mounts the React application into the HTML div#root.
 * React.StrictMode is used for highlighting potential problems.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StripeProvider>
      <App />
    </StripeProvider>
  </React.StrictMode>
);
