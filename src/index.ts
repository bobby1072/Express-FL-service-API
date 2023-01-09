import { MongoConnector } from "./Utils/MongoConnectorClass";
import { PrimitiveUser } from "./UserClasses/PrimitiveUser";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import { ConfigVars } from "./Utils/config-vars";
import { LoginUser } from "./UserClasses/LoginUserClass";
const cors = require("cors");
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
async function main(): Promise<void> {
  const app: Application = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  const configVars = new ConfigVars();
  const client = await new MongoConnector(configVars).connectToMongo();
  app.post("/register", async (req: Request, resp: Response) => {
    if (!req.body.email || req.body.password) {
      resp.status(422);
      resp.send("Unprocessable body given");
      throw new Error("User gave an invalid body");
    }
    const email: string = req.body.email;
    const pass: string = req.body.password;
    try {
      await new SubmitUser(email, pass).submitUser(client);
      resp.status(200);
      resp.send("Account created");
    } catch (e) {
      resp.status(501);
      resp.send(e || "Failed to connect to database");
      throw new Error("Failed submit");
    }
  });
  console.log(await new LoginUser(configVars, "yoi", "pass").login(client));
  await new LoginUser(configVars, "yoi", "pass").deleteUser(client);
}
main();
