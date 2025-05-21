import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import swaggerUi from "swagger-ui-express";
import swaggerJson from "./swagger/swagger-output.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    cors({
      origin: 'http://34.151.247.165:4000/',
    })
  )

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../media")));
app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

export default app;
