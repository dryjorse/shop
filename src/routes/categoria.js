import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import categoriaController from "../controllers/categoriaController.js";

const { getCategories, createCategoria } = categoriaController;

router.get("/", getCategories);
router.post("/create", authMiddleware, createCategoria);

export default router;
