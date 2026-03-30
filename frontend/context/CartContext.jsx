"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

const getItemId = (item) => item?.id || item?._id || item?.productId || null;

const normalizeQuantity = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

const normalizeCartItem = (item = {}) => {
  const id = getItemId(item);
  return {
    ...item,
    id,
    quantity: normalizeQuantity(item.quantity),
  };
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from local storage on init, optional but good practice
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        const normalized = Array.isArray(parsed)
          ? parsed.map((item) => normalizeCartItem(item)).filter((item) => item.id)
          : [];
        setCartItems(normalized);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const productId = getItemId(product);
      if (!productId) return prevItems;

      const existing = prevItems.find((item) => item.id === productId);
      const nextQty = normalizeQuantity(quantity);

      if (existing) {
        return prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: normalizeQuantity(item.quantity + nextQty) } : item
        );
      }
      return [...prevItems, normalizeCartItem({ ...product, id: productId, quantity: nextQty })];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: normalizeQuantity(item.quantity + 1) } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: normalizeQuantity(item.quantity - 1) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
