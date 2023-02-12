import { Db } from "mongodb";
import { PrimitiveUser } from "./PrimitiveUser";
import { compareSync } from "bcryptjs";
import { Token } from "../Utils/TokenClass";
import { ExceptionMessage } from "../Utils/ExceptionMessages";
export interface ITokenAccountObj {
  email: string;
  id: string;
  token: string;
}
export class LoginUser extends PrimitiveUser {
  public readonly password: string;
  constructor(mail: string, pass: string, mongoClient: Db) {
    super(mongoClient, mail);
    this.password = pass;
    return this;
  }
  public async login(): Promise<null | ITokenAccountObj> {
    const account = await this.checkUserExists(this.email);
    if (!account) throw new Error(ExceptionMessage.invalidUser);
    if (compareSync(this.password, account.password))
      return {
        email: account.email,
        id: account.uuid,
        token: Token.encodeToken(account.email),
      };
    else return null;
  }
  public async deleteUser(): Promise<void> {
    if ((await this.login()) === null)
      throw new Error(ExceptionMessage.invalidPassword);
    else {
      await this.client
        .collection("catch")
        .deleteMany({ "properties.Username": this.email });
      await this.client.collection("Accounts").deleteOne({ email: this.email });
    }
  }
}
