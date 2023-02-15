import { PrimitiveUser } from "./PrimitiveUser";
import { Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { ExceptionMessage } from "../Utils/ExceptionMessages";
import { PasswordHash } from "../Utils/PasswordHash";
export class SubmitUser extends PrimitiveUser {
  private readonly password: string;
  constructor(mailName: string, passworders: string, client: Db) {
    super(client, mailName);
    if (!this.validateEmail(mailName.toLowerCase()))
      throw new Error(ExceptionMessage.invalidEmail);
    const hash = PasswordHash.hashPassword(passworders);
    this.password = hash;
  }
  private validateEmail(email: string) {
    return email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }
  public async submitUser(): Promise<void> {
    if ((await this.checkUserExists(this.email)) !== null)
      throw new Error(ExceptionMessage.invalidUserExists);
    else {
      await this.client.collection("Accounts").insertOne({
        uuid: uuidv4(),
        email: this.email,
        password: this.password,
      });
    }
  }
}
