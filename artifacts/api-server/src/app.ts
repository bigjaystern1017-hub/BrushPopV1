import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import router from "./routes/index";

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api", router);

export default app;
