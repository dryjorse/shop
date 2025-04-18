process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import db from "./models/index.js";
import dotenv from "dotenv";
import path from "path";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import * as AdminJSSequelize from "@adminjs/sequelize";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import productsRoutes from "./routes/products.js";
import categoriaRoutes from "./routes/categoria.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sequelize, Product, User, Categoria } = db;

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

app.use(bodyParser.json());
app.use("/media", express.static(path.join(__dirname, "../media")));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriaRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const adminOptions = {
      resources: [Product, User, Categoria],
    };

    const admin = new AdminJS(adminOptions);

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
      authenticate: async (email, password) => {
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { email };
        }
        return null;
      },
      cookieName: "adminjs",
      cookiePassword: "some-secret-password",
    });

    app.use(admin.options.rootPath || "/admin", adminRouter);

    console.log("База данных подключена");
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
  }
})();
