import { ConfigVars } from "../Utils/config-vars";
import { MongoClient } from "mongodb";
import { IUserMongoDB, PrimitiveUser } from "./PrimitiveUser";
import { compareSync } from "bcryptjs";
export class LoginUser extends PrimitiveUser {
  public readonly configVars: ConfigVars;
  public readonly email: string;
  public readonly password: string;
  constructor(config: ConfigVars, mail: string, pass: string) {
    super();
    this.email = mail;
    this.password = pass;
    this.configVars = config;
    return this;
  }
  public async login(client: MongoClient): Promise<null | IUserMongoDB> {
    const account = (await client
      .db("fish_base")
      .collection("Accounts")
      .findOne({ email: this.email })) as IUserMongoDB;
    if (compareSync(this.password, account.password)) return account;
    else return null;
  }
  public async deleteUser(client: MongoClient): Promise<void> {
    if ((await this.login(client)) === null)
      throw new Error("User doesn't exist");
    else {
      await client
        .db("fish_base")
        .collection("Accounts")
        .deleteOne({ email: this.email });
    }
  }
}
