const express = require("express");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validateImage = require("../middleware/validateImage");
const {
  getProducts,
  createProducts,
  editProducts,
} = require("../controllers/productController");

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
  validateImage(true),
  createProducts
);

router.patch("/:id", authMiddleware, upload.single("image"), editProducts);

module.exports = router;
