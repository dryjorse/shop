import uploadFeature from "@adminjs/upload";
import db from "../../models/index.js";
import AdminJS from "adminjs";
import { componentLoader } from "../componentLoader.js";

const { Product } = db;

export const productResource = {
  resource: Product,
  features: [
    uploadFeature({
      componentLoader,
      provider: {
        local: {
          bucket: "public/uploads", // папка, куда сохраняются изображения
        },
      },
      properties: {
        key: "image", // в это текстовое поле будет сохраняться путь
        file: "uploadImage", // это временное поле загрузки
      },
      uploadPath: (record, filename) => `products/${record.id}/${filename}`,
    }),
  ],
};
