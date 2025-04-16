const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./user");
require("dotenv").config();

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectModule: require("pg"),
});

const User = UserModel(sequelize, DataTypes);

module.exports = {
  sequelize,
  User,
};
