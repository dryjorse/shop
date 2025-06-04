import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";
dotenv.config();

const outputFile = "./swagger-output.json";
const routes = ["../app.js"];

const doc = {
  info: {
    title: "Swagger Express",
    description: "Описание API",
  },
  host: process.env.DOMEN || "localhost:4000",
  schemes: ["https"],
};

swaggerAutogen()(outputFile, routes, doc);
