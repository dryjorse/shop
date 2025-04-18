import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import categoriesController from "../controllers/categoriesController.js";

const { getCategories, createCategoria } = categoriesController;

router.get("/", getCategories);
router.post("/create", authMiddleware, createCategoria);

export default router;
