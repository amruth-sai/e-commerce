const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // Added cookie-parser
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const databaseUrl = process.env.DATABASE_URL;

const app = express();
const port = 3031;
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser middleware

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cartSchema = new mongoose.Schema({
  userId: String,
  products: [
    {
      productId: String,
      quantity: Number,
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

// Middleware to check if the user is authenticated
function authenticateToken(req, res, next) {
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  axios
    .get('http://authentication-service/validateToken', {
      headers: {
        Authorization: token,
      },
    })
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(401).json({ message: 'Unauthorized' });
    });
}

// API Endpoints
app.get("/carts",authenticateToken, async (req, res) => {
  try {
    const userId = req.cookies.userId || 1;
    // console.log(userId);
    const cart = await Cart.findOne({ userId });
    // console.log(cart);
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    // console.log(cart);
    // Fetch product details for each product in the cart from the Product-Service
    const productDetails = await Promise.all(
      cart.products.map(async (product) => {
        // console.log(product);
        const productResponse = await axios.get(
          `http://backend1:3001/products/${product.productId}`
        );
        // console.log(productResponse);
        return productResponse.data;
      })
    );

    // console.log(cart);
    // Combine product details with cart data
    const cartWithProductDetails = {
      userId: cart.userId,
      products: productDetails.map((product, index) => ({
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: cart.products[index].quantity,
      })),
    };

    res.send(cartWithProductDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/carts", async (req, res) => {
  try {
    const userId = req.cookies.userId || 1;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    console.log(cart);
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity }],
      });
    } else {
      const existingProductIndex = cart.products.findIndex(
        (product) => product.productId === productId
      );
      // console.log(cart);
      // console.log(cart.products);
      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex]["quantity"] += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();

    res.status(201).send(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.put("/carts/:productId", async (req, res) => {
  try {
    const userId = req.cookies.userId || 1;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      // If the cart doesn't exist, create a new cart
      cart = new Cart({
        userId: userId,
        products: [
          {
            productId: productId,
            quantity: quantity,
          },
        ],
      });
    } else {
      const product = cart.products.find(
        (product) => product.productId === productId
      );

      if (!product) {
        // If the product is not found, add a new product to the cart
        const newProduct = {
          productId: productId,
          quantity: quantity,
        };

        cart.products.push(newProduct);
      } else {
        if (quantity !== 1) {
          product.quantity = quantity;
        }
      }
    }

    await cart.save();
    res.send(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.delete("/carts/:productId", async (req, res) => {
  try {
    const userId = req.cookies.userId || 1;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    cart.products = cart.products.filter(
      (product) => product.productId !== productId
    );

    await cart.save();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Cart Service listening at http://localhost:${port}`);
});
