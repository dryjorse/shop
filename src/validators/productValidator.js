const Joi = require("joi");

const updateProductSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().min(1).max(2000),
}).unknown(false); // запрет других полей

const createProductSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
}).unknown(false);

module.exports = {
  updateProductSchema,
  createProductSchema,
};
