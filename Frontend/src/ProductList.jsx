// ProductList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css"; // Import the CSS file

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const addToCart = (product) => {
    const button = document.getElementById(`add-to-cart-btn-${product._id}`);
    button.classList.add("added-to-cart", "added-to-cart-animation");
    setTimeout(() => {
      button.classList.remove("added-to-cart", "added-to-cart-animation");
    }, 1000);
    try {
      axios.put(`http://127.0.0.1:3031/carts/${product._id}`, {
        quantity: 1,
      });
    } catch (error) {
      console.error("Error while adding to cart:", error);
    }
  };

  return (
    <div className="container">
      <h2>Product List</h2>
      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-title">{product.name}</div>
            <div className="product-description">{product.description}</div>
            <div className="product-price">${product.price}</div>
            {product.quantity <= 0 ? (
              <p className="out-of-stock-message">Out of Stock</p>
            ) : (
              <button
                id={`add-to-cart-btn-${product._id}`}
                className={`add-to-cart-btn`}
                onClick={() => addToCart(product)}
              >
                {"Add to Cart"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
