import db from "../models/index.js";

const { CartItem } = db;

const addToCart = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, quantity } = req.body;

  // #swagger.tags = ['Cart']
  // #swagger.description = 'Get cart requests'

  try {
    const [item, created] = await CartItem.findOrCreate({
      where: { userId, productId },
      defaults: { quantity },
    });

    if (!created) {
      item.quantity += quantity;
      await item.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при добавлении в корзину" });
  }
};

const getCart = async (req, res) => {
  const { id: userId } = req.user;

  // #swagger.tags = ['Cart']
  // #swagger.description = 'Get cart requests'

  try {
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          as: "product",
        },
      ],
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении корзины" });
  }
};

export default { addToCart, getCart };
