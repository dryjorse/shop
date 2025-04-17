import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

import UserModel from "./user.js";
import ProductModel from "./product.js";
import pg from "pg";

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectModule: pg,
});

const db = {};

// Инициализация моделей
db.User = UserModel(sequelize, DataTypes);
db.Product = ProductModel(sequelize, DataTypes);

// Установка ассоциаций
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
