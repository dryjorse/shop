export default (sequelize, DataTypes) => {
  const Categoria = sequelize.define("Categoria", {
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

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Product, {
      foreignKey: "categoriaId",
      as: "products",
    });
  };

  return Categoria;
};
