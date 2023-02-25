import { MongoConnector } from "./Utils/MongoConnectorClass";
import cors from "cors";
import express, { Application } from "express";
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
      Program.app.use(compression());
      Program.app.use(cors());
      Program.app.use(bodyParser.urlencoded({ extended: true }));
      Program.app.use(bodyParser.json());
      const client: Db = await MongoConnector.connectToMongo();

      Routes.register(Program.app, client);
      Routes.login(Program.app, client);
      Routes.changePassword(Program.app, client);
      Routes.deleteAccount(Program.app, client);
      Routes.pullCatches(Program.app, client);
      Routes.postCatch(Program.app, client);
      Routes.deleteCatch(Program.app, client);

      Routes.updateUserAdmin(Program.app, client);
      Routes.deleteAllUserCatchesAdmin(Program.app, client);
      Routes.deleteUserAdmin(Program.app, client);
      Routes.pullAllUserDetails(Program.app, client);

      const portVar: number = Number(process.env.PORT) || 5000;
      Program.app.listen(portVar, "0.0.0.0", () =>
        console.log(`\n\nServer running on port: ${portVar}\n\n`)
      );
    } catch (e) {}
  }
}
Program.main();
