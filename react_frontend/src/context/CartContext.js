import React, { createContext, useContext, useReducer, useEffect } from "react";

// cart reducer actions
const ADD = "ADD";
const REMOVE = "REMOVE";
const UPDATE = "UPDATE";
const CLEAR = "CLEAR";

const LS_CART_KEY = "cart_data";

const CartContext = createContext();

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case ADD: {
      // If item exists, increment qty
      const idx = state.findIndex((item) => item.id === action.product.id);
      if (idx > -1) {
        const updated = [...state];
        updated[idx].qty += action.qty;
        return updated;
      }
      return [...state, { ...action.product, qty: action.qty }];
    }
    case UPDATE: {
      return state.map((item) =>
        item.id === action.id ? { ...item, qty: action.qty } : item
      );
    }
    case REMOVE: {
      return state.filter((item) => item.id !== action.id);
    }
    case CLEAR:
      return [];
    default:
      return state;
  }
}

// Load initial cart from localStorage
function loadCart() {
  const stored = localStorage.getItem(LS_CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) || [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    // Persist cart in localStorage
    localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // PUBLIC_INTERFACE
  const addToCart = (product, qty = 1) => {
    dispatch({ type: ADD, product, qty });
  };
  // PUBLIC_INTERFACE
  const removeFromCart = (id) => {
    dispatch({ type: REMOVE, id });
  };

  // PUBLIC_INTERFACE
  const updateQty = (id, qty) => {
    if (qty < 1) return;
    dispatch({ type: UPDATE, id, qty });
  };

  // PUBLIC_INTERFACE
  const clearCart = () => {
    dispatch({ type: CLEAR });
  };

  // Sum computations
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useCart() {
  return useContext(CartContext);
}

// Wishlist Context (new)
const WishlistContext = createContext();

const LS_WISHLIST_KEY = "wishlist_data";

function wishlistReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      if (state.some((item) => item.id === action.product.id)) return state;
      return [...state, { ...action.product }];
    }
    case "REMOVE": {
      return state.filter((item) => item.id !== action.id);
    }
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function loadWishlist() {
  const stored = localStorage.getItem(LS_WISHLIST_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) || [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function WishlistProvider({ children }) {
  const [wishlist, dispatch] = React.useReducer(wishlistReducer, [], loadWishlist);

  useEffect(() => {
    localStorage.setItem(LS_WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // PUBLIC_INTERFACE
  const addToWishlist = (product) => {
    dispatch({ type: "ADD", product });
  };
  // PUBLIC_INTERFACE
  const removeFromWishlist = (id) => {
    dispatch({ type: "REMOVE", id });
  };
  // PUBLIC_INTERFACE
  const clearWishlist = () => {
    dispatch({ type: "CLEAR" });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useWishlist() {
  return useContext(WishlistContext);
}
