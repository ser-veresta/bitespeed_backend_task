import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import "reflect-metadata";
import { errorHandler } from "./middleware/errorHandler.middleware";
import idetntityRouter from "./routes/identity.route";

import { AppDataSource } from "./utils/dataSource";

const App = async () => {
  const app: Application = express();

  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use(morgan("dev"));

  //home routes
  app.get("/", (_: Request, res: Response) => {
    res.send("Home");
  });

  //database intitalization
  try {
    await AppDataSource.initialize();
    await AppDataSource.synchronize();
  } catch (err) {
    console.log(err);
  }

  app.use("/api/identity", idetntityRouter);

  //errorHandler
  app.use(errorHandler);

  //404 route
  //   app.use((_: Request, res: Response) => {
  //     res.send("404 Route Not Available");
  //   });

  const PORT = process.env.PORT || 8000;

  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
};

App().then(() =>
  console.log(`App started successfully in ${process.env.NODE_ENV}`)
);
