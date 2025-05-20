import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

// Используем абсолютный путь к компоненту без расширения
componentLoader.add("ImageShow", path.join(__dirname, "components/ImageShow"));

export { componentLoader };
