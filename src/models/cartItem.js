export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define("CartItem", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    CartItem.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return CartItem;
};
