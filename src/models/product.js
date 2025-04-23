export default (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    Product.belongsTo(models.Categories, {
      foreignKey: "categoriesId",
      as: "categories",
    });
  };

  Product.prototype.toJSON = function () {
    const values = { ...this.get() };

    if (values.image) {
      values.image = `${
        process.env.BASE_URL || "http://localhost:4000"
      }/products/${values.image}`;
    }

    return values;
  };

  return Product;
};
