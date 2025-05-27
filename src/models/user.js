export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Product, {
      foreignKey: "userId",
      as: "products",
    });

    User.hasMany(models.CartItem, {
      foreignKey: "userId",
      as: "cartItems",
    });
  };

  return User;
};
