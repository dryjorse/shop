import express from "express";
import productController from "../controllers/productController.js";
import { upload } from "../controllers/productController.js";

const router = express.Router();

// Получить все продукты
router.get("/", productController.getAllProducts);

// Получить продукт по ID
router.get("/:id", productController.getProductById);

// Создать новый продукт
router.post("/", upload.single("image"), productController.createProduct);

// Обновить продукт
router.put("/:id", upload.single("image"), productController.updateProduct);

// Удалить продукт
router.delete("/:id", productController.deleteProduct);

// Добавить изображения в галерею
router.post(
  "/:id/gallery",
  upload.array("images", 10),
  productController.addGalleryImages
);

// Удалить изображение из галереи
router.delete("/:id/gallery", productController.removeGalleryImage);

export default router;
