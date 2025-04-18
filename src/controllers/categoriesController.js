import db from "../models/index.js";

const { Categories } = db;

const getCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Ошибка при получении категориев:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Необходимо указать title",
      });
    }

    const categoria = await Categories.create({
      title,
    });

    res.status(201).json(categoria);
  } catch (error) {
    console.error("Ошибка при создании категории:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export default { getCategories, createCategoria };
