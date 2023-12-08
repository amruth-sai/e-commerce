import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const API_BASE_URL = "http://localhost:3031/carts";

  const updateCart = (newCart) => {
    setCart(newCart);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3031/carts/");
      updateCart(response.data.products);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  const handleInputChange = (productId, value) => {
    updateQuantity(productId, isNaN(value) ? undefined : value);
  };

  const updateQuantity = (productId, quantity) => {
    // console.log(quantity);
    updateQuantityParent(productId, quantity);
    if (quantity === "0") {
      removeFromCart(productId);
      return;
    }
    axios.put(`${API_BASE_URL}/${productId}`, { quantity });
  };
  const updateQuantityParent = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCartParent = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const removeFromCart = (productId) => {
    removeFromCartParent(productId);
    axios.delete(`${API_BASE_URL}/${productId}`);
  };

  return (
    <div className="container cart-container">
      <h2>Shopping Cart</h2>
      <div className="shopping-cart">
        {cart.length !== 0 &&
          cart.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="product-details">
                <div className="product-name">{item.productName}</div>
                <div className="product-price">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </div>
              </div>
              <div className="product-quantity">
                Quantity:
                <input
                  type="number"
                  className="quantity-input"
                  value={item.quantity}
                  onChange={(e) =>
                    handleInputChange(item.productId, e.target.value)
                  }
                />
              </div>
              <button
                className="remove-from-cart-btn"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Cart;
