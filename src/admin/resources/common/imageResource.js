import uploadFeature from "@adminjs/upload";
import path from "path";
import { fileURLToPath } from "url";
import { LocalProvider2 } from "../../../utils/custom-local-provider.js";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { componentLoader } from "../../componentLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaPath = path.join(__dirname, "../../../../media");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

/**
 * Создает ресурс для AdminJS с поддержкой загрузки изображений
 * @param {Object} params Параметры конфигурации
 * @param {Object} params.model - Модель Sequelize
 * @param {string} params.imageField - Имя поля для хранения пути к изображению
 * @param {boolean} params.multiple - Поддержка множественной загрузки
 * @param {string} params.bucket - Имя директории для хранения файлов
 * @param {string} params.navigation - Название раздела навигации
 * @param {string} params.label - Название ресурса
 * @param {Object} params.componentLoader - Загрузчик компонентов AdminJS
 * @param {Object} params.baseOptions - Дополнительные базовые настройки ресурса
 * @param {Object} params.showProperties - Порядок и список отображаемых полей
 * @param {Object} params.uploadOptions - Дополнительные настройки для uploadFeature
 * @param {Function} params.afterUpload - Функция, вызываемая после загрузки
 * @param {Function} params.beforeUpload - Функция, вызываемая перед загрузкой
 * @returns {Object} Конфигурация ресурса AdminJS
 */
export const createImageResource = ({
  model,
  imageField = "image",
  multiple = false,
  bucket = "products",
  navigation = "Content",
  label,

  baseOptions = {},
  showProperties = [],
  uploadOptions = {},
  afterUpload,
  beforeUpload,
}) => {
  const bucketPath = path.join(mediaPath, bucket);
  const resourceBaseUrl = `${baseUrl}/${bucket}`;

  // Базовая конфигурация для поля изображения
  const imageProperties = {
    [imageField]: {
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
          return images.map((img) => `${resourceBaseUrl}/${img}`).join(", ");
        } catch (e) {
          return value;
        }
      },
    },
    [`upload${imageField.charAt(0).toUpperCase() + imageField.slice(1)}`]: {
      isVisible: { list: false, filter: false, show: false, edit: true },
      type: "mixed",
    },
  };

  // Стандартная функция удаления изображений при удалении записи
  const deleteImageAction = {
    after: async (response, request, context) => {
      const { record } = context;
      if (record && record.params) {
        const imageUrls = [];
        for (let i = 0; ; i++) {
          const imageKey = `${imageField}.${i}`;
          if (!(imageKey in record.params)) break;
          const imageUrl = record.params[imageKey];
          if (imageUrl) imageUrls.push(imageUrl);
        }
        if (imageUrls.length === 0) return response;

        const processedDirs = new Set();
        for (const imageUrl of imageUrls) {
          if (!imageUrl) continue;
          const filePath = path.join(bucketPath, imageUrl);
          const dirPath = path.dirname(filePath);
          processedDirs.add(dirPath);
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
          } catch (error) {}
        }
        for (const dirPath of processedDirs) {
          try {
            const filesInDir = await fs.readdir(dirPath);
            if (filesInDir.length === 0) {
              await fs.rm(dirPath, { recursive: true, force: true });
            }
          } catch (error) {}
        }
      }
      return response;
    },
  };

  // Настройки для uploadFeature
  const uploadConfig = {
    provider: new LocalProvider2({
      bucket: bucketPath,
      baseUrl: `/${bucket}`,
    }),
    componentLoader,
    validation: {
      mimeTypes: ["image/png", "image/jpeg", "image/gif"],
      ...uploadOptions.validation,
    },
    properties: {
      key: imageField,
      file: `upload${imageField.charAt(0).toUpperCase() + imageField.slice(1)}`,
      ...uploadOptions.properties,
    },
    uploadPath: (_, filename) => {
      const id = uuidv4();
      return `${id}/${filename}`;
    },
    multiple,
    ...(afterUpload ? { afterUpload } : {}),
    ...(beforeUpload ? { beforeUpload } : {}),
    ...uploadOptions,
  };

  // Объединение базовых настроек с пользовательскими
  const options = {
    navigation: { name: navigation },
    label: label || model.name,
    properties: {
      ...imageProperties,
      ...(baseOptions.properties || {}),
    },
    actions: {
      delete: deleteImageAction,
      ...(baseOptions.actions || {}),
    },
    ...(showProperties.length > 0 ? { showProperties } : {}),
    ...baseOptions,
  };

  return {
    resource: model,
    options,
    features: [uploadFeature(uploadConfig)],
  };
};
