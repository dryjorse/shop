export default (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
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
      try {
        // Парсим JSON строку в массив

        console.log(values.image);

        let image =
          values.image[0] === "[" ? JSON.parse(values.image) : values.image;

        if (!(Array.isArray(image) ? image[0] : image).includes("http")) {
          image = `${
            process.env.BASE_URL || "http://localhost:4000"
          }/products/${Array.isArray(image) ? image[0] : image}`;
        }

        values.image = image;
      } catch (e) {
        console.error("Ошибка при обработке поля image:", e);
        values.image = null;
      }
    }

    // Обработка множественных изображений
    if (values.images) {
      try {
        const imagesArray = Array.isArray(values.images)
          ? values.images
          : JSON.parse(values.images || "[]");

        console.log(values.images);

        // Формируем массив URL изображений
        values.images = imagesArray.map((img) => {
          if (img.includes("http")) return img;
          return `${
            process.env.BASE_URL || "http://localhost:4000"
          }/products-gallery/${img}`;
        });
      } catch (e) {
        console.error("Ошибка при обработке поля images:", e);
        values.images = [];
      }
    }

    return values;
  };

  return Product;
};
