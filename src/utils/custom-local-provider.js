import path from "path";
import fsExtra from "fs-extra";
import { LocalProvider } from "@adminjs/upload";

export class LocalProvider2 extends LocalProvider {
  constructor(options) {
    super(options);
  }

  async upload(file, key) {
    console.log("Upload key:", key); // Отладка: что передается в key
    const filePath =
      process.platform === "win32" ? this.path(key) : this.path(key).slice(1);
    console.log("Generated filePath:", filePath); // Отладка: сформированный путь
    await fsExtra.mkdir(path.dirname(filePath), { recursive: true });
    await fsExtra.move(file.path, filePath, { overwrite: true });
    return filePath; // Возвращаем путь для отладки
  }
}
