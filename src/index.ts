import { MongoConnector } from "./Utils/MongoConnectorClass";
import { SubmitUser } from "./UserClasses/SubmitUserClass";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { ITokenAccountObj, LoginUser } from "./UserClasses/LoginUserClass";
import { Token } from "./Utils/TokenClass";
import { Db } from "mongodb";
import FishLoadOperations from "./FishClasses/FishLoadClass";
import compression from "compression";
import {
  FishLogOperations,
  FishOpErrors,
  Ifish,
} from "./FishClasses/FishLogClass";
import { ExceptionMessage } from "./Utils/ExceptionMessages";
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
      this.app.post("/changepassword", async (req: Request, resp: Response) => {
        if (
          !req.headers.authorization ||
          !req.body.password ||
          !req.body.new_password
        ) {
          resp.status(422);
          resp.send("No token/password included");
        } else {
          const token: string = req.headers.authorization;
          const password: string = req.body.password;
          const newPassword: string = req.body.new_password;
          try {
            const tokenDetails = Token.decodeToken(token);
            try {
              await new LoginUser(
                tokenDetails.user,
                password,
                client
              ).updatePassword(newPassword);
              resp.status(200);
              resp.send("Password changed");
            } catch (e) {
              let message = ExceptionMessage.internalServerError;
              if (e instanceof Error) message = e.message;
              resp.status(500);
              resp.send(message);
            }
          } catch (e) {
            resp.status(498);
            resp.send("Bad token given");
          }
        }
      });
      this.app.post("/deleteaccount", async (req: Request, resp: Response) => {
        if (!req.headers.authorization || !req.body.password) {
          resp.status(422);
          resp.send("No token/password included");
        } else {
          const token: string = req.headers.authorization;
          const password: string = req.body.password;
          try {
            const tokenDetails = Token.decodeToken(token);
            try {
              await new LoginUser(
                tokenDetails.user,
                password,
                client
              ).deleteUser();
              resp.status(200);
              resp.send("Account deleted");
            } catch (e) {
              let message = ExceptionMessage.internalServerError;
              if (e instanceof Error) message = e.message;
              resp.status(500);
              resp.send(message);
            }
          } catch (e) {
            resp.status(498);
            resp.send("Bad token given");
          }
        }
      });
      this.app.post("/pullcatches", async (req: Request, resp: Response) => {
        if (!req.headers.authorization) {
          resp.status(498);
          resp.send("No token included");
        } else {
          const token: string = req.headers.authorization;
          try {
            const tokenDetails = Token.decodeToken(token);
            try {
              const myCatches = await new FishLoadOperations(
                client,
                tokenDetails.user
              ).getCatches(
                Object.keys(req.body).length !== 0 &&
                  typeof req.body === "object" &&
                  req.body
              );
              resp.status(200);
              resp.send(myCatches);
            } catch (e) {
              let message = ExceptionMessage.internalServerError;
              if (e instanceof Error) message = e.message;
              resp.status(500);
              resp.send(message);
            }
          } catch (e) {
            resp.status(498);
            resp.send("Bad token given");
          }
        }
      });
      this.app.post("/postcatch", async (req: Request, resp: Response) => {
        if (!req.headers.authorization) {
          resp.status(498);
          resp.send("No token included");
        } else {
          const token = req.headers.authorization;
          try {
            const tokenDetails = Token.decodeToken(token);
            try {
              await new FishLogOperations(
                tokenDetails.user,
                req.body,
                client
              ).submitCatch();
              resp.status(200);
              resp.send("Catch submitted.");
            } catch (e) {
              let message = ExceptionMessage.internalServerError;
              if (e instanceof FishOpErrors) {
                message = e.message;
                if (e.similarFish && e.similarFish.length > 0) {
                  resp.status(500);
                  resp.send(
                    `${message}. Did you mean ${e.similarFish
                      .map((ele: Ifish) => ele.english_name)
                      .join(" or ")}`
                  );
                }
              }
              resp.status(500);
              resp.send(message);
            }
          } catch (e) {
            resp.status(498);
            resp.send("Bad token given");
          }
        }
      });
      this.app.post("/deletecatches", async (req: Request, resp: Response) => {
        if (!req.headers.authorization) {
          resp.status(498);
          resp.send("No token included");
        } else {
          const token: string = req.headers.authorization;
          try {
            const tokenDetails = Token.decodeToken(token);
            try {
              if (!Array.isArray(req.body))
                throw new Error(ExceptionMessage.invalidDeleteArray);
              await Promise.all(
                req.body.map((ele) => {
                  if (!("properties" in ele) || !("geometry" in ele))
                    throw new Error(ExceptionMessage.invalidGeoJson);
                  const newEle = ele.properties;
                  newEle.Latitude = ele.geometry.coordinates[0];
                  newEle.Longitude = ele.geometry.coordinates[1];
                  return new FishLogOperations(
                    tokenDetails.user,
                    newEle,
                    client
                  ).deleteCatch();
                })
              );
              resp.status(200);
              resp.send("Catches deleted");
            } catch (e) {
              let message = ExceptionMessage.internalServerError;
              if (e instanceof Error) message = e.message;
              resp.status(500);
              resp.send(message);
            }
          } catch (e) {
            resp.status(498);
            resp.send("Bad token given");
          }
        }
      });
      const portVar: number = Number(process.env.PORT) || 5000;
      this.app.listen(portVar, "0.0.0.0", () =>
        console.log(`\n\nServer running on port: ${portVar}\n\n`)
      );
    } catch (e) {}
  }
}
Program.main();
