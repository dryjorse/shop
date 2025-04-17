import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import tokens from "../utils/token.js";

const { User } = db;
const { generateAccessToken, generateRefreshToken } = tokens;

const register = async (req, res) => {
  const { username, email, password, avatar } = req.body;

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

    res.status(201).json({
      message: "Пользователь создан",
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
      accessToken,
      refreshToken,
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
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Токен отсутствует" });

  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) return res.status(403).json({ message: "Недопустимый токен" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.status(403).json({ message: "Невалидный токен" });

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
      }
    );
  } catch (e) {
    res.status(500).json({ message: "Ошибка обновления токена" });
  }
};

const logout = async (req, res) => {
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
