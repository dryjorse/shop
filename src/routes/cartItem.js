import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import cartController from "../controllers/cartController.js";

const { addToCart, getCart, removeFromCart } = cartController;

router.post("/cart", authMiddleware, addToCart);
router.delete("/cart/:productId", authMiddleware, removeFromCart);
router.get("/cart", authMiddleware, getCart);

export default router;
