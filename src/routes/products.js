import express from "express";
import multer from "multer";
import fs from "fs";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import validateImage from "../middleware/validateImage.js";
import productController from "../controllers/productController.js";

const { getProducts, createProduct, editProduct } = productController;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "media/products";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/", getProducts);
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  // validateImage(true),
  createProduct
);

router.patch("/:id", authMiddleware, upload.single("image"), editProduct);

export default router;
