import db from "../models/index.js";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const { Product } = db;

// Настройки для хранения файлов
const mediaPath = path.resolve(process.cwd(), "media");
const productsPath = path.join(mediaPath, "products");
const galleryPath = path.join(mediaPath, "products-gallery");

// Конфигурация Multer для загрузки файлов
// Конфигурация Multer для загрузки файлов
// Конфигурация Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const isMultiple =
      req.path.includes("gallery") || req.query.type === "gallery";
    const uploadPath = isMultiple ? galleryPath : productsPath;

    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);

    // Формируем имя файла в формате UUID.jpg
    const fileName = `${id}${ext}`;

    // Сохраняем путь файла
    req.filePath = fileName;

    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Неподдерживаемый тип файла"));
    }
  },
});

// Контроллер продукта
class ProductController {
  async getAllProducts(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Get Products'
    try {
      const products = await Product.findAll({
        include: ["categories", "user"],
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error("Ошибка получения продуктов:", error);
      return res.status(500).json({ error: "Ошибка получения продуктов" });
    }
  }

  // Получить продукт по ID
  async getProductById(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Get Products by Id'
    const { id } = req.params;

    try {
      const product = await Product.findByPk(id, {
        include: ["categories", "user"],
      });

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Ошибка получения продукта:", error);
      return res.status(500).json({ error: "Ошибка получения продукта" });
    }
  }

  // Создать новый продукт
  async createProduct(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Create Product'

    /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $title: string,
        $description: string,
        $categoriesId: string,
      }
  }
*/
    const { title, description, categoriesId } = req.body;

    try {
      // Создаем объект продукта
      const productData = {
        title,
        description,
        categoriesId,
      };

      // Если есть основное изображение
      if (req.file) {
        productData.image = JSON.stringify([req.filePath]);
      }

      // Создаем продукт
      const product = await Product.create(productData);

      return res.status(201).json(product);
    } catch (error) {
      console.error("Ошибка создания продукта:", error);
      return res.status(500).json({ error: "Ошибка создания продукта" });
    }
  }

  // Обновить продукт
  async updateProduct(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Update Product'

    /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $title: string,
        $description: string,
        $categoriesId: string,
        $userId: string,
      }
  }
*/
    const { id } = req.params;
    const { title, description, categoriesId, userId } = req.body;

    try {
      // Ищем продукт
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      // Обновляем данные продукта
      const updateData = {};

      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (categoriesId) updateData.categoriesId = categoriesId;
      if (userId) updateData.userId = userId;
      // Если есть основное изображение
      if (req.file) {
        updateData.image = JSON.stringify([req.filePath]);
      }

      // Обновляем продукт
      await product.update(updateData);

      // Получаем обновленный продукт для ответа
      const updatedProduct = await Product.findByPk(id, {
        include: ["categories", "user"],
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Ошибка обновления продукта:", error);
      return res.status(500).json({ error: "Ошибка обновления продукта" });
    }
  }

  // Удалить продукт
  async deleteProduct(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Delete Product'
    const { id } = req.params;

    try {
      // Ищем продукт
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      // Удаляем файлы изображений
      try {
        // Удаление основного изображения
        const image = JSON.parse(product.image || "[]");
        if (image.length > 0) {
          const imagePath = path.join(productsPath, image[0]);
          await fs.unlink(imagePath).catch(() => {});

          // Удаляем директорию, если она пуста
          const imageDir = path.dirname(imagePath);
          await fs.rmdir(imageDir).catch(() => {});
        }

        // Удаление галереи изображений
        const images = JSON.parse(product.images || "[]");
        for (const img of images) {
          const imagePath = path.join(galleryPath, img);
          await fs.unlink(imagePath).catch(() => {});

          // Удаляем директорию, если она пуста
          const imageDir = path.dirname(imagePath);
          await fs.rmdir(imageDir).catch(() => {});
        }
      } catch (error) {
        console.error("Ошибка при удалении файлов:", error);
      }

      // Удаляем продукт
      await product.destroy();

      return res.status(200).json({ message: "Продукт успешно удален" });
    } catch (error) {
      console.error("Ошибка удаления продукта:", error);
      return res.status(500).json({ error: "Ошибка удаления продукта" });
    }
  }

  async addGalleryImages(req, res) {
    const { id } = req.params;

    try {
      // Ищем продукт
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      // Получаем текущие изображения из галереи с корректной обработкой ошибок
      let currentImages = [];

      try {
        if (product.images) {
          // Пробуем разобрать JSON

          console.log(product.images);

          // Проверяем, что получили массив
          if (Array.isArray(currentImages)) {
            currentImages = JSON.parse(product.images);
          } else {
            currentImages = [];
          }
        }
      } catch (e) {
        console.error("Ошибка при парсинге JSON поля images:", e);
        currentImages = [];
      }

      // Проверяем, что загруженные файлы существуют
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "Изображения не загружены" });
      }

      // Получаем пути к новым файлам
      const newImages = req.files.map((file) => file.filename);

      // Обновляем продукт
      await product.update({
        images: JSON.stringify([...currentImages, ...newImages]),
      });

      // Получаем обновленный продукт для ответа
      const updatedProduct = await Product.findByPk(id, {
        include: ["categories", "user"],
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Ошибка добавления изображений в галерею:", error);
      return res
        .status(500)
        .json({ error: "Ошибка добавления изображений в галерею" });
    }
  }
  // Удалить изображение из галереи
  async removeGalleryImage(req, res) {
    // #swagger.tags = ['Products']
    // #swagger.description = 'Remove Product Images'

    /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $imageIndex: number,
      }
  }
*/
    const { id } = req.params;
    const { imageIndex } = req.body;
    try {
      // Ищем продукт
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      // Получаем текущие изображения из галереи
      let currentImages = JSON.parse(product.images || "[]");

      // Проверяем, существует ли указанный индекс
      if (imageIndex < 0 || imageIndex >= currentImages.length) {
        return res.status(400).json({ error: "Неверный индекс изображения" });
      }

      // Получаем путь к изображению для удаления
      const imageToRemove = currentImages[imageIndex];

      // Удаляем изображение из массива
      currentImages.splice(imageIndex, 1);

      // Обновляем продукт
      await product.update({
        images: JSON.stringify(currentImages),
      });

      // Удаляем файл изображения
      try {
        const imagePath = path.join(galleryPath, imageToRemove);
        await fs.unlink(imagePath).catch(() => {});

        // Удаляем директорию, если она пуста
        const imageDir = path.dirname(imagePath);
        await fs.rmdir(imageDir).catch(() => {});
      } catch (error) {
        console.error("Ошибка при удалении файла изображения:", error);
      }

      // Получаем обновленный продукт для ответа
      const updatedProduct = await Product.findByPk(id, {
        include: ["categories", "user"],
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Ошибка удаления изображения из галереи:", error);
      return res
        .status(500)
        .json({ error: "Ошибка удаления изображения из галереи" });
    }
  }
}

export default new ProductController();
