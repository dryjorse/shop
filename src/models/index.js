const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
const UserModel = require("./user");
const ProductModel = require("./product");

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectModule: require("pg"),
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

module.exports = db;
