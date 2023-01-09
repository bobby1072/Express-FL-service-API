import { PrimitiveUser } from "./PrimitiveUser";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { hashSync } from "bcryptjs";
var crypto = require("crypto");
export class SubmitUser extends PrimitiveUser {
  public readonly password: string;
  constructor(mailName: string, passworders: string, client: MongoClient) {
    super(client, mailName);
    const hash = hashSync(passworders, 12);
    if (!this.validateEmail(mailName.toLowerCase()))
      throw new Error("Invalid email given");
    this.password = hash;
    return this;
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
      throw new Error("User already exists");
    else {
      await this.client.db("fish_base").collection("Accounts").insertOne({
        uuid: uuidv4(),
        email: this.email,
        password: this.password,
      });
    }
  }
}
