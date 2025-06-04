import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import tokens from "../utils/token.js";

const { User } = db;
const { generateAccessToken, generateRefreshToken } = tokens;

const register = async (req, res) => {
  /** @type {{ username: string, email: string, password: string, avatar: string }} */
  const { username, email, password, avatar } = req.body;

  // #swagger.tags = ['Auth']
  // #swagger.description = 'Get auth requests'

  /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $username: string,
        $email: string,
        $password: string,
        avatar: string
      }
  }
*/

  try {
    const existingEmail = await User.findOne({ where: { email } });
    const existingUsername = await User.findOne({ where: { username } });

    if (existingEmail)
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });

    if (existingUsername)
      return res.status(400).json({ message: "Имя пользователя уже занято" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash,
      avatar,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "Пользователь создан",
      token: {
        accessToken,
        refreshToken,
      },
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Ошибка регистрации", error: e.message });
  }
};

const login = async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'User login'

  /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $email: string,
        $password: string,
      }
  }
*/

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Пользователь не найден" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Неверный пароль" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: {
        accessToken,
        refreshToken,
      },
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Ошибка входа" });
  }
};

const refresh = async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Refresh token'

  /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $refreshToken: string,
      }
  }
*/

  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Токен отсутствует" });

  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) return res.status(403).json({ message: "Недопустимый токен" });

    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
          }
        );
      });

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      return res.status(403).json({ message: "Невалидный токен" });
    }
  } catch (e) {
    res.status(500).json({ message: "Ошибка обновления токена" });
  }
};

const logout = async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logout user'

  /*  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $refreshToken: string,
      }
  }
*/

  const { refreshToken } = req.body;
  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: "Выход выполнен" });
  } catch (e) {
    res.status(500).json({ message: "Ошибка при выходе" });
  }
};

export default { register, login, refresh, logout };
