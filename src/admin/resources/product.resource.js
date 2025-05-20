import db from "../../models/index.js";
import uploadFeature from "@adminjs/upload";
import path from "path";
import { fileURLToPath } from "url";
import { LocalProvider2 } from "../../utils/custom-local-provider.js";
import { componentLoader } from "../componentLoader.js";
import { v4 as uuidv4 } from "uuid";

const { Product } = db;

// Настройки путей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaPath = path.join(__dirname, "../../../media");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

export const productResource = {
  resource: Product,
  options: {
    navigation: { name: "Content" },
    label: "Products",

    properties: {
      // Настройки для основного изображения
      image: {
        isVisible: { list: true, filter: false, show: true, edit: false },
        type: "mixed",
        components: {
          show: "ImageShow",
          list: false,
        },
        formatValue: (value) => {
          if (!value) return "";
          try {
            const images = Array.isArray(value)
              ? value
              : JSON.parse(value || "[]");
            return images.map((img) => `${baseUrl}/products/${img}`).join(", ");
          } catch (e) {
            return value;
          }
        },
      },
      uploadImage: {
        isVisible: { list: false, filter: false, show: false, edit: true },
        type: "mixed",
      },

      // Настройки для множественных изображений
      images: {
        isVisible: { list: true, filter: false, show: true, edit: false },
        type: "mixed",
        components: {
          show: "ImageShow",
          list: false,
        },
        formatValue: (value) => {
          if (!value) return "";
          try {
            const images = Array.isArray(value)
              ? value
              : JSON.parse(value || "[]");
            return images
              .map((img) => `${baseUrl}/products-gallery/${img}`)
              .join(", ");
          } catch (e) {
            return value;
          }
        },
      },
      uploadImages: {
        isVisible: { list: false, filter: false, show: false, edit: true },
        type: "mixed",
      },
    },

    showProperties: [
      "title",
      "image",
      "images",
      "description",
      "id",
      "categoriesId",
      "userId",
      "createdAt",
      "updatedAt",
    ],

    listProperties: ["title", "image", "images", "description", "createdAt"],
    filterProperties: ["title", "description", "categoriesId"],
    editProperties: [
      "title",
      "description",
      "uploadImage",
      "uploadImages",
      "categoriesId",
      "userId",
    ],

    actions: {
      // Действия для удаления изображений при удалении записи
      delete: {
        after: async (response, request, context) => {
          const { record } = context;
          if (record && record.params) {
            // Удаление основного изображения
            const mainImageUrls = [];
            for (let i = 0; ; i++) {
              const imageKey = `image.${i}`;
              if (!(imageKey in record.params)) break;
              const imageUrl = record.params[imageKey];
              if (imageUrl) mainImageUrls.push(imageUrl);
            }

            // Удаление множественных изображений
            const galleryImageUrls = [];
            for (let i = 0; ; i++) {
              const imageKey = `images.${i}`;
              if (!(imageKey in record.params)) break;
              const imageUrl = record.params[imageKey];
              if (imageUrl) galleryImageUrls.push(imageUrl);
            }

            // Обработка удаления файлов (код удаления файлов)
          }
          return response;
        },
      },
    },
  },
  features: [
    // Feature для основного изображения
    uploadFeature({
      provider: new LocalProvider2({
        bucket: path.join(mediaPath, "products"),
        baseUrl: "/products",
      }),
      componentLoader,
      validation: {
        mimeTypes: ["image/png", "image/jpeg", "image/gif"],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
      properties: {
        key: "image",
        file: "uploadImage",
        filePath: "imageFilePath", // Уникальный ключ
        filesToDelete: "imageFilesToDelete", // Уникальный ключ
      },

      uploadPath: (_, filename) => {
        const id = uuidv4();
        return `${id}/${filename}`;
      },
      multiple: false,
    }),

    // Feature для множественных изображений
    uploadFeature({
      provider: new LocalProvider2({
        bucket: path.join(mediaPath, "products-gallery"),
        baseUrl: "/products-gallery",
      }),
      componentLoader,
      validation: {
        mimeTypes: ["image/png", "image/jpeg", "image/gif"],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
      properties: {
        key: "images",
        file: "uploadImages",
        filePath: "imagesFilePath", // Уникальный ключ
        filesToDelete: "imagesFilesToDelete", // Уникальный ключ
      },
      uploadPath: (_, filename) => {
        const id = uuidv4();
        return `${id}/${filename}`;
      },
      multiple: true,
    }),
  ],
};

export default productResource;
