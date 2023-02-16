import { Db } from "mongodb";
import { PrimitiveUser } from "./PrimitiveUser";
import { Token } from "../Utils/TokenClass";
import { ExceptionMessage } from "../Common/ExceptionMessages";
import { PasswordHash } from "../Utils/PasswordHash";
import { Collections } from "../Common/CollectionNames";
export interface ITokenAccountObj {
  email: string;
  id: string;
  token: string;
}
export class LoginUser extends PrimitiveUser {
  private readonly password: string;
  constructor(mail: string, pass: string, mongoClient: Db) {
    super(mongoClient, mail);
    this.password = pass;
  }
  public async login(): Promise<undefined | ITokenAccountObj> {
    const account = await this.checkUserExists(this.email);
    if (!account) throw new Error(ExceptionMessage.invalidUser);
    if (PasswordHash.comparePassword(this.password, account.password))
      return {
        email: account.email,
        id: account.uuid,
        token: Token.encodeToken(account.email, account.role),
      };
    else return undefined;
  }
  public async updatePassword(newPassword: string): Promise<void> {
    if (!(await this.login())) {
      throw new Error(ExceptionMessage.invalidPassword);
    } else {
      await this.client
        .collection(Collections.account)
        .updateOne(
          { email: this.email },
          { $set: { password: PasswordHash.hashPassword(newPassword) } }
        );
    }
  }
  public async deleteUser(): Promise<void> {
    if (!(await this.login()))
      throw new Error(ExceptionMessage.invalidPassword);
    else {
      await this.client
        .collection(Collections.catches)
        .deleteMany({ "properties.Username": this.email });
      await this.client
        .collection(Collections.account)
        .deleteOne({ email: this.email });
    }
  }
}
