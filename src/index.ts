import { MongoConnector } from "./Utils/MongoConnectorClass";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { ConfigVars } from "./Utils/config-vars";
import { ITokenAccountObj, LoginUser } from "./UserClasses/LoginUserClass";
import { Token } from "./Utils/TokenClass";
import { Db, MongoClient } from "mongodb";
import FishLoadOperations from "./FishClasses/FishLoadClass";
import compression from "compression";
import { FishLogOperations } from "./FishClasses/FishLogClass";
export interface IPullCatchReqBody {
  Species: string;
  Weight: number;
  Latitude: number;
  Longitude: number;
  Season: string;
  Date: string;
}
async function main(): Promise<void> {
  try {
    const app: Application = express();
    app.use(compression());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    const configVars: ConfigVars = new ConfigVars();
    const mainTokenClass: Token = new Token(configVars);
    const mongoConnector: MongoConnector = new MongoConnector(configVars);
    const client: Db = await mongoConnector.connectToMongo();
    app.post("/register", async (req: Request, resp: Response) => {
      if (!req.body.email || !req.body.password) {
        resp.status(422);
        resp.send("Email or password not given");
      } else {
        const email: string = req.body.email;
        const pass: string = req.body.password;
        try {
          await new SubmitUser(email, pass, client).submitUser();
          resp.status(200);
          resp.send("Account created");
        } catch (e) {
          let message = "Internal server error";
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      }
    });
    app.post("/login", async (req: Request, resp: Response) => {
      if (!req.body.email || !req.body.password) {
        resp.status(422);
        resp.send("Email or password not given");
      } else {
        const email: string = req.body.email;
        const pass: string = req.body.password;
        try {
          const token: ITokenAccountObj | null = await new LoginUser(
            email,
            pass,
            client,
            mainTokenClass
          ).login();
          if (token) {
            resp.status(200);
            resp.send(token);
          } else {
            resp.status(500);
            resp.send("Password inncorect");
          }
        } catch (e) {
          let message = "Internal server error";
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      }
    });
    app.post("/deleteaccount", async (req: Request, resp: Response) => {
      if (!req.headers.authorization || !req.body.password) {
        resp.status(422);
        resp.send("No token/password included");
      } else {
        const token: string = req.headers.authorization;
        const password: string = req.body.password;
        try {
          const tokenDetails = mainTokenClass.decodeToken(token);
          try {
            await new LoginUser(
              tokenDetails.user,
              password,
              client,
              mainTokenClass
            ).deleteUser();
          } catch (e) {
            let message = "Internal server error";
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
    app.get("/pullmycatches", async (req: Request, resp: Response) => {
      if (!req.headers.authorization) {
        resp.status(498);
        resp.send("No token included");
      } else {
        const token: string = req.headers.authorization;
        try {
          const tokenDetails = mainTokenClass.decodeToken(token);
          try {
            const myCatches = await new FishLoadOperations(
              client,
              tokenDetails.user
            ).getOwnCatches();
            resp.status(200);
            resp.send(myCatches);
          } catch (e) {
            let message = "Internal server error";
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
    app.post("/postcatch", async (req: Request, resp: Response) => {
      if (!req.headers.authorization) {
        resp.status(498);
        resp.send("No token included");
      } else {
        const token = req.headers.authorization;
        try {
          const tokenDetails = mainTokenClass.decodeToken(token);
          try {
            await new FishLogOperations(
              tokenDetails.user,
              req.body,
              client
            ).submitCatch();
            resp.status(200);
            resp.send("Catch submitted.");
          } catch (e) {
            let message = "Internal server error";
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
    app.post("/deletecatches", async (req: Request, resp: Response) => {
      if (!req.headers.authorization) {
        resp.status(498);
        resp.send("No token included");
      } else {
        const token: string = req.headers.authorization;
        try {
          const tokenDetails = mainTokenClass.decodeToken(token);
          try {
            if (!Array.isArray(req.body))
              throw new Error("Please provide valid Array to delete");
            await Promise.all(
              req.body.map((ele) => {
                if (!("properties" in ele) || !("geometry" in ele))
                  throw new Error(
                    "Please provide valid GeoJson catches to delete"
                  );
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
            let message = "Internal server error";
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
    app.listen(portVar, "0.0.0.0", () =>
      console.log(`\n\nServer running on port: ${portVar}\n\n`)
    );
  } catch (e) {}
}
main();
