import productValidator from "../validators/productValidator.js";
import db from "../models/index.js";

const { updateProductSchema } = productValidator;
const { Product, Categoria } = db;

const getProducts = async (req, res) => {
  try {
    const { userId, categoriaId, page = 1, limit = 10 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (categoriaId) where.categoriaId = categoriaId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: results, count } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      results,
    });
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, categoriesId } = req.body;
    const userId = req.user.id;

    if (!title || !description || !userId || !categoriesId) {
      return res.status(400).json({
        error: "Необходимо указать title, categoriesId, description и userId",
      });
    }

    const categoria = await Categoria.findByPk(categoriesId);
    if (!categoria) {
      return res.status(404).json({ error: "Категория не найдена" });
    }

    const imagePath = req.file ? `/media/products/${req.file.filename}` : null;

    const product = await Product.create({
      image: imagePath,
      title,
      description,
      userId,
      categoriesId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Ошибка при создании продукта:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Продукт не найден" });
    }

    if (product.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Нет доступа к изменению этого продукта" });
    }

    // Обработка изображения отдельно
    if (req.file) {
      if (product.image) {
        const oldImagePath = `.${product.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = `/media/products/${req.file.filename}`;
    }

    // Валидация
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Обновить только те поля, которые были переданы
    Object.assign(product, value);

    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Ошибка при обновлении продукта:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// const deleteProduct = () => async (req, res) => {
//   try {
//     const productId = req.params.id;

//     // Ищем продукт
//     const product = await Product.findByPk(productId);

//     if (!product) {
//       return res.status(404).json({ error: "Продукт не найден" });
//     }

//     // Удаляем файл изображения, если он есть
//     if (product.image) {
//       const imagePath = path.join(__dirname, "../", product.image);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     // Удаляем продукт из базы
//     await product.destroy();

//     res.json({ message: "Продукт успешно удалён" });
//   } catch (error) {
//     console.error("Ошибка при удалении продукта:", error);
//     res.status(500).json({ error: "Ошибка сервера" });
//   }
// };

export default { getProducts, createProduct, editProduct };
