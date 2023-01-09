import { ConfigVars } from "../Utils/config-vars";
import { MongoClient } from "mongodb";
import { IUserMongoDB, PrimitiveUser } from "./PrimitiveUser";
import { compareSync } from "bcryptjs";
import { Token } from "../Utils/TokenClass";
export interface ITokenAccountObj {
  email: string;
  id: string;
  token: string;
}
export class LoginUser extends PrimitiveUser {
  public readonly configVars: ConfigVars;
  public readonly password: string;
  constructor(
    config: ConfigVars,
    mail: string,
    pass: string,
    mongoClient: MongoClient
  ) {
    super(mongoClient, mail);
    this.configVars = config;
    this.password = pass;
    return this;
  }
  public async login(): Promise<null | ITokenAccountObj> {
    const account = await this.checkUserExists(this.email);
    if (!account) throw new Error("User doesn't Exist");
    if (compareSync(this.password, account.password))
      return {
        email: account.email,
        id: account.uuid,
        token: new Token(this.configVars).encodeToken(account.email),
      };
    else return null;
  }
  public async deleteUser(): Promise<void> {
    if ((await this.login()) === null)
      throw new Error("User doesn't exist or password incorrect");
    else {
      await this.client
        .db("fish_base")
        .collection("Accounts")
        .deleteOne({ email: this.email });
    }
  }
}
