import { Application, Request, Response } from "express";
import { Db } from "mongodb";
import FishLoadOperations from "../FishClasses/FishLoadClass";
import {
  FishLogOperations,
  FishOpErrors,
  Ifish,
} from "../FishClasses/FishLogClass";
import { ITokenAccountObj, LoginUser } from "../UserClasses/LoginUserClass";
import { SubmitUser } from "../UserClasses/SubmitUserClass";
import { ExceptionMessage } from "../Common/ExceptionMessages";
import { Token } from "./TokenClass";
import { AdminUser } from "../UserClasses/AdminUserClass";
import { IUserMongoDB } from "../UserClasses/PrimitiveUser";

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

  public static async changePassword(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("/changepassword", async (req: Request, resp: Response) => {
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
  }

  public static async deleteAccount(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("/deleteaccount", async (req: Request, resp: Response) => {
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
  }

  public static async pullCatches(app: Application, client: Db) {
    app.post("/pullcatches", async (req: Request, resp: Response) => {
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
  }

  public static async postCatch(app: Application, client: Db): Promise<void> {
    app.post("/postcatch", async (req: Request, resp: Response) => {
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
            resp.send("Catch submitted");
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
  }

  public static async deleteCatch(app: Application, client: Db): Promise<void> {
    app.post("/deletecatches", async (req: Request, resp: Response) => {
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
  }

  public static async pullAllUserDetails(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("/pullallusers", async (req: Request, resp: Response) => {
      if (!req.headers.authorization || !req.body.password) {
        resp.status(422);
        resp.send("No token/password included");
      } else {
        const token: string = req.headers.authorization;
        const password: string = req.body.password;
        try {
          const tokenDetails = Token.decodeToken(token);
          try {
            const allUsers: IUserMongoDB[] = await new AdminUser(
              tokenDetails.user,
              password,
              client,
              tokenDetails.role
            ).pullBackAllUsers();
            resp.status(200);
            resp.json(allUsers);
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
  }

  public static async deleteUserAdmin(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("deleteuseradmin", async (req: Request, resp: Response) => {
      if (!req.headers.authorization || !req.body.password) {
        resp.status(422);
        resp.send("No token/password included");
      } else if (!req.body.target) {
        resp.status(422);
        resp.send("No target included");
      } else {
        const token: string = req.headers.authorization;
        const password: string = req.body.password;
        const target: string = req.body.target;
        try {
          const tokenDetails = Token.decodeToken(token);
          try {
            await new AdminUser(
              tokenDetails.user,
              password,
              client,
              tokenDetails.role,
              target
            ).deleteUserAdmin();
            resp.status(200);
            resp.send("User deleted");
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
  }

  public static async deleteAllUserCatchesAdmin(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("/deleteusercatches", async (req: Request, resp: Response) => {
      if (!req.headers.authorization || !req.body.password) {
        resp.status(422);
        resp.send("No token/password included");
      } else if (!req.body.target) {
        resp.status(422);
        resp.send("No target included");
      } else {
        const token: string = req.headers.authorization;
        const password: string = req.body.password;
        const target: string = req.body.target;
        try {
          const tokenDetails = Token.decodeToken(token);
          try {
            await new AdminUser(
              tokenDetails.user,
              password,
              client,
              tokenDetails.role,
              target
            ).deleteAllUserCatchesAdmin();
            resp.status(200);
            resp.send("User deleted");
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
  }

  public static async updateUserAdmin(
    app: Application,
    client: Db
  ): Promise<void> {
    app.post("/updateuser", async (req: Request, resp: Response) => {
      if (!req.headers.authorization || !req.body.password) {
        resp.status(422);
        resp.send("No token/password included");
      } else if (!req.body.target || !req.body.new_value || !req.body.option) {
        resp.status(422);
        resp.send("No target/option/new_value included");
      } else {
        const token: string = req.headers.authorization;
        const password: string = req.body.password;
        const target: string = req.body.target;
        const option: string = req.body.option;
        const newValue: string = req.body.new_value;
        try {
          const tokenDetails = Token.decodeToken(token);
          try {
            await new AdminUser(
              tokenDetails.user,
              password,
              client,
              tokenDetails.role,
              target
            ).updateUser(option, newValue);
            resp.status(200);
            resp.send("User updated");
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
  }
}
