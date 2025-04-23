import path from "path";

import fsExtra from "fs-extra";
import { LocalProvider } from "@adminjs/upload";

export class LocalProvider2 extends LocalProvider {
  constructor(options) {
    super(options);
  }

  async upload(file, key) {
    const filePath =
      process.platform === "win32" ? this.path(key) : this.path(key).slice(1);
    await fsExtra.mkdir(path.dirname(filePath), { recursive: true });
    await fsExtra.move(file.path, filePath, { overwrite: true });
  }
}
