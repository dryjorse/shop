import dotenv from "dotenv";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";

import app from "./app.js";
import db from "./models/index.js";
import productResource from "./admin/resources/product.resource.js";
import { componentLoader } from "./admin/componentLoader.js";

import bcrypt from "bcryptjs";

dotenv.config();

const { sequelize, User, Categories, CartItem } = db;
const PORT = process.env.PORT || 4000;

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
      options: {
        navigation: { name: "Management" },
        label: "Users",
        properties: {
          password: {
            isVisible: {
              edit: true,
              show: false,
              list: false,
              filter: false,
            },
            type: "password",
          },
          refreshToken: {
            isVisible: { edit: false, show: false, list: false, filter: false },
          },
        },
        actions: {
          new: {
            before: async (request, context) => {
              if (request.payload && request.payload.password) {
                request.payload.password = await bcrypt.hash(
                  request.payload.password,
                  10
                );
              }
              return request;
            },
          },
          edit: {
            before: async (request, context) => {
              if (request.payload && request.payload.password) {
                if (request.payload.password !== "") {
                  request.payload.password = await bcrypt.hash(
                    request.payload.password,
                    10
                  );
                } else {
                  delete request.payload.password;
                }
              }
              return request;
            },
          },
        },
      },
    },
    {
      resource: Categories,
      options: { navigation: { name: "Management" }, label: "Categories" },
    },
    {
      resource: CartItem,
      options: { navigation: { name: "Management" }, label: "CartItem" },
    },
  ],
};

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

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

    app.use(adminOptions.rootPath, adminRouter);

    console.log("База данных подключена");
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
  }
})();
