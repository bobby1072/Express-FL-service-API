import { MongoConnector } from "./Utils/MongoConnectorClass";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { ConfigVars } from "./Utils/config-vars";
import { ITokenAccountObj, LoginUser } from "./UserClasses/LoginUserClass";
import { Token } from "./Utils/TokenClass";
import { MongoClient } from "mongodb";
import FishLoadOperations from "./FishClasses/FishLoadClass";
import compression from "compression";
async function main(): Promise<void> {
  const app: Application = express();
  app.use(compression());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  const configVars: ConfigVars = new ConfigVars();
  const mainTokenClass: Token = new Token(configVars);
  const mongoConnector: MongoConnector = new MongoConnector(configVars);
  const client: MongoClient = await mongoConnector.connectToMongo();
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
        let message =
          "Failed to connect to database  or account already exists";
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
          configVars,
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
        let message = "Failed to connect to database or inncorrect email";
        if (e instanceof Error) message = e.message;
        resp.status(500);
        resp.send(message);
      }
    }
  });
  app.post("/pullmycatches", async (req: Request, resp: Response) => {
    if (!req.body.token) {
      resp.status(422);
      resp.send("No token included");
    } else {
      const token: string = req.body.token;
      try {
        const tokenDetails = mainTokenClass.decodeToken(token);
        try {
          const myCatches = await new FishLoadOperations(
            configVars,
            client,
            tokenDetails.user
          ).getOwnCatches();
          resp.status(200);
          resp.send(myCatches);
        } catch (e) {
          let message = "Can't connect to database";
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      } catch (e) {
        resp.status(500);
        resp.send("Bad token given");
      }
    }
  });
  app.post("/deleteaccount", async (req: Request, resp: Response) => {
    if (!req.body.token || !req.body.password) {
      resp.status(422);
      resp.send("No token/password included");
    } else {
      const token: string = req.body.token;
      const password: string = req.body.password;
      try {
        const tokenDetails = mainTokenClass.decodeToken(token);
        try {
          await new LoginUser(
            configVars,
            tokenDetails.user,
            password,
            client,
            mainTokenClass
          ).deleteUser();
        } catch (e) {
          let message = "Can't connect to database";
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      } catch (e) {
        let message = "Bad token given";
        if (e instanceof Error) message = e.message;
        resp.status(500);
        resp.send(message);
      }
    }
  });
  const portVar: number = Number(process.env.PORT) || 5000;
  app.listen(portVar, "0.0.0.0", () =>
    console.log(`\n\nServer running on port: ${portVar}\n\n`)
  );
}
main();
