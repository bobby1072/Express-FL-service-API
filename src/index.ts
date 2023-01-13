import { MongoConnector } from "./Utils/MongoConnectorClass";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
const cors = require("cors");
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { ConfigVars } from "./Utils/config-vars";
import { ITokenAccountObj, LoginUser } from "./UserClasses/LoginUserClass";
import { Token } from "./Utils/TokenClass";
import { MongoClient } from "mongodb";
import FishLoadOperations from "./FishClasses/FishLoadClass";
async function main(): Promise<void> {
  const app: Application = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  const configVars: ConfigVars = new ConfigVars();
  const mainTokenClass: Token = new Token(configVars);
  const client: MongoClient = await new MongoConnector(
    configVars
  ).connectToMongo();
  app.post("/register", async (req: Request, resp: Response) => {
    if (!req.body.email || !req.body.password) {
      resp.status(422);
      resp.send("Unprocessable body given");
    }
    const email: string = req.body.email;
    const pass: string = req.body.password;
    try {
      await new SubmitUser(email, pass, client).submitUser();
      resp.status(200);
      resp.send("Account created");
    } catch (e) {
      resp.status(501);
      resp.send("Failed to connect to database  or account already exists");
    }
  });
  app.post("/login", async (req: Request, resp: Response) => {
    if (!req.body.email || !req.body.password) {
      resp.status(422);
      resp.send("Unprocessable body given");
    }
    const email: string = req.body.email;
    const pass: string = req.body.password;
    try {
      const token: ITokenAccountObj | null = await new LoginUser(
        configVars,
        email,
        pass,
        client
      ).login();
      if (token) {
        resp.status(200);
        resp.send(token);
      } else {
        resp.status(500);
        resp.send("Password inncorect");
      }
    } catch (e) {
      resp.status(500);
      resp.send("Failed to connect to database or inncorrect email");
    }
  });
  app.post("/pullmycatches", async (req: Request, resp: Response) => {
    if (!req.body.token) {
      resp.status(422);
      resp.send("No token included");
    }
    const token: string = req.body.token;
    try {
      const tokenDetails = mainTokenClass.decodeToken(token);
      const myCatches = await new FishLoadOperations(
        configVars,
        client,
        tokenDetails.user
      ).getOwnCatches();
      resp.status(200);
      resp.send(myCatches);
    } catch (e) {
      resp.status(500);
      resp.send("Bad token given");
    }
  });
  //console.log(await new LoginUser(configVars, "yoi", "pass").login(client));
  //await new LoginUser(configVars, "yoi", "pass").deleteUser(client);
  const portVar: number = Number(process.env.PORT) || 5000;
  app.listen(portVar, "0.0.0.0", () =>
    console.log(`\n\nServer running on port: ${portVar}\n\n`)
  );
}
main();
