export default (required = true) => {
  return (req, res, next) => {
    const file = req.file;

    if (!file && required) {
      return res.status(400).json({ error: "Изображение обязательно" });
    }

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: "Недопустимый формат изображения (только JPEG, PNG, WEBP)",
        });
      }

      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: `Файл слишком большой (максимум ${maxSizeMB}MB)` });
      }
    }

    next();
  };
};
