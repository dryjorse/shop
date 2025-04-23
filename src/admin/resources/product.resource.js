import uploadFeature from "@adminjs/upload";
import db from "../../models/index.js";
import path from "path";
import { componentLoader } from "../componentLoader.js";
import { fileURLToPath } from "url";
import { LocalProvider2 } from "../../utils/custom-local-provider.js";

const { Product } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaPath = path.join(__dirname, "../../../media/products");

export const productResource = {
  resource: Product,
  options: {
    properties: {
      image: {
        isVisible: {
          list: false,
          filter: false,
          show: false,
          edit: false,
        },
      },
      uploadImage: {
        isVisible: {
          list: false,
          filter: false,
          show: true,
          edit: true,
        },
      },
    },
  },
  features: [
    uploadFeature({
      provider: new LocalProvider2({
        bucket: mediaPath,
        baseUrl: "/products",
      }),
      componentLoader,
      validation: {
        mimeTypes: ["image/png", "image/jpeg"],
      },
      properties: {
        key: "image",
        file: "uploadImage",
      },
    }),
  ],
};
