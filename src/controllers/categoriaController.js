import db from "../models/index.js";

const { Categoria } = db;

const getCategories = async (req, res) => {
  try {
    const categories = await Categoria.findAll();
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

    const categoria = await Categoria.create({
      title,
    });

    res.status(201).json(categoria);
  } catch (error) {
    console.error("Ошибка при создании категории:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export default { getCategories, createCategoria };
