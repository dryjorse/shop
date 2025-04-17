import productValidator from "../validators/productValidator.js";
import db from "../models/index.js";

const { updateProductSchema } = productValidator;
const { Product } = db;

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id; // если у тебя authMiddleware добавляет пользователя

    if (!title || !description || !userId) {
      return res
        .status(400)
        .json({ error: "Необходимо указать title, description и userId" });
    }

    const imagePath = req.file ? `/media/products/${req.file.filename}` : null;

    const product = await Product.create({
      image: imagePath,
      title,
      description,
      userId,
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
