import express, { Application, Request, Response } from "express";
import { Db } from "mongodb";
import { ITokenAccountObj, LoginUser } from "../UserClasses/LoginUserClass";
import { SubmitUser } from "../UserClasses/SubmitUserClass";
import { ExceptionMessage } from "./ExceptionMessages";

export abstract class Routes {
  public static async register(app: Application, client: Db): Promise<void> {
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
          let message = ExceptionMessage.internalServerError;
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      }
    });
  }

  public static async login(app: Application, client: Db): Promise<void> {
    app.post("/login", async (req: Request, resp: Response) => {
      if (!req.body.email || !req.body.password) {
        resp.status(422);
        resp.send("Email or password not given");
      } else {
        const email: string = req.body.email;
        const pass: string = req.body.password;
        try {
          const token: ITokenAccountObj | undefined = await new LoginUser(
            email,
            pass,
            client
          ).login();
          if (token) {
            resp.status(200);
            resp.json(token);
          } else {
            resp.status(500);
            resp.send("Password inncorect");
          }
        } catch (e) {
          let message = ExceptionMessage.internalServerError;
          if (e instanceof Error) message = e.message;
          resp.status(500);
          resp.send(message);
        }
      }
    });
  }
}
