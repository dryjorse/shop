import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import cartController from "../controllers/cartController.js";

const { addToCart, getCart } = cartController;

router.post("/cart", authMiddleware, addToCart);
router.get("/cart", authMiddleware, getCart);

export default router;
