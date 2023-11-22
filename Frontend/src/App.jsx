import React from "react";
import axios from "axios";
import ProductList from "./ProductList";
import Cart from "./Cart";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css"; // Import your CSS file

const App = () => {
  return (
    <div className="app-container">
      <Router>
        <div>
          <nav className="nav-bar">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/cart" className="nav-link">
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          {/* Define Routes using Routes instead of Switch */}
          <Routes>
            <Route path="/" element={<ProductList />} />

            {/* Cart Route */}
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
