import db from "../../models/index.js";
import { createImageResource } from "./common/imageResource.js";

const { Product } = db;

export const productResource = createImageResource({
  model: Product,
  imageField: "image",
  bucket: "products",
  label: "Products",

  // Определяем порядок полей при просмотре
  showProperties: [
    "title", // Сначала заголовок
    "image", // Потом изображение
    "description", // Затем описание
    "id",
    "categoriesId",
    "userId",
    "createdAt",
    "updatedAt",
  ],

  // Дополнительные настройки
  baseOptions: {
    // Можно добавить любые другие настройки для AdminJS
    listProperties: ["title", "image", "description", "createdAt"],
    filterProperties: ["title", "description", "categoriesId"],
    editProperties: [
      "title",
      "description",
      "uploadImage",
      "categoriesId",
      "userId",
    ],
  },

  // Настройки для загрузки изображений
  uploadOptions: {
    validation: {
      maxSize: 5 * 1024 * 1024, // 5MB
    },
  },

  // Дополнительные хуки
  afterUpload: (response, record) => {
    console.log("Файл загружен:", response);
    return response;
  },
});
