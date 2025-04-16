// src/app.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const productsRoutes = require("./routes/products");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use("/media", express.static(path.join(__dirname, "../media")));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productsRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("База данных подключена");
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  } catch (err) {
    console.error("Ошибка подключения к БД:", err);
  }
})();
