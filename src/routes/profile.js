import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import db from "../models/index.js";

const { User } = db;

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "refreshToken"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка получения профиля", error: error.message });
  }
});

export default router;
