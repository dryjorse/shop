process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import * as AdminJSSequelize from "@adminjs/sequelize";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";

import db from "./models/index.js";
import { productResource } from "./admin/resources/product.resource.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sequelize, User, Categories } = db;
import { componentLoader } from "./admin/componentLoader.js";

app.use(express.static(path.join(__dirname, "../media")));

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const adminOptions = {
  componentLoader,
  rootPath: "/admin",
  branding: {
    companyName: "Admin Panel",
    logo: "",
    softwareBrothers: false,
  },
  resources: [
    productResource,
    {
      resource: User,
      options: { navigation: { name: "Management" }, label: "Users" },
    },
    {
      resource: Categories,
      options: { navigation: { name: "Management" }, label: "Categories" },
    },
  ],
};

app.use(bodyParser.json());
app.use("/media", express.static(path.join(__dirname, "media")));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const admin = new AdminJS(adminOptions);

    admin.watch();

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

    // const adminRouter = AdminJSExpress.buildRouter(admin);

    app.use(adminOptions.rootPath, adminRouter);

    console.log("База данных подключена");
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
  }
})();
