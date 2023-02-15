import { MongoConnector } from "./Utils/MongoConnectorClass";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";

import { Db } from "mongodb";
import compression from "compression";
import { Routes } from "./Utils/Routes";
export interface IPullCatchReqBody {
  Species: string;
  Weight: number;
  Latitude: number;
  Longitude: number;
  Season: string;
  Date: string;
}
abstract class Program {
  private static readonly app: Application = express();
  public static async main(): Promise<void> {
    try {
      this.app.use(compression());
      this.app.use(cors());
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(bodyParser.json());
      const client: Db = await MongoConnector.connectToMongo();

      Routes.register(this.app, client);
      Routes.login(this.app, client);
      Routes.changePassword(this.app, client);
      Routes.deleteAccount(this.app, client);
      Routes.pullCatches(this.app, client);
      Routes.postCatch(this.app, client);
      Routes.deleteCatch(this.app, client);

      const portVar: number = Number(process.env.PORT) || 5000;
      this.app.listen(portVar, "0.0.0.0", () =>
        console.log(`\n\nServer running on port: ${portVar}\n\n`)
      );
    } catch (e) {}
  }
}
Program.main();
