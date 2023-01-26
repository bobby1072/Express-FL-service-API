import { Db } from "mongodb";
import { PrimitiveUser } from "./PrimitiveUser";
import { compareSync } from "bcryptjs";
import { Token } from "../Utils/TokenClass";
export interface ITokenAccountObj {
  email: string;
  id: string;
  token: string;
}
export class LoginUser extends PrimitiveUser {
  public readonly password: string;
  public readonly token: Token;
  constructor(mail: string, pass: string, mongoClient: Db, tokenClass: Token) {
    super(mongoClient, mail);
    this.password = pass;
    this.token = tokenClass;
    return this;
  }
  public async login(): Promise<null | ITokenAccountObj> {
    const account = await this.checkUserExists(this.email);
    if (!account) throw new Error("User doesn't Exist");
    if (compareSync(this.password, account.password))
      return {
        email: account.email,
        id: account.uuid,
        token: this.token.encodeToken(account.email),
      };
    else return null;
  }
  public async deleteUser(): Promise<void> {
    if ((await this.login()) === null)
      throw new Error("User doesn't exist or password incorrect");
    else {
      await this.client
        .collection("catch")
        .deleteMany({ "properties.Username": this.email });
      await this.client.collection("Accounts").deleteOne({ email: this.email });
    }
  }
}
