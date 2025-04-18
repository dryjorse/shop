export default (sequelize, DataTypes) => {
  const Categories = sequelize.define("Categories", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Categories.associate = (models) => {
    Categories.hasMany(models.Product, {
      foreignKey: "categoriesId",
      as: "products",
    });
  };

  return Categories;
};
