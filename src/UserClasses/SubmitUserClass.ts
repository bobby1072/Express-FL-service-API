import { PrimitiveUser } from "./PrimitiveUser";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { hashSync } from "bcryptjs";
import { ConfigVars } from "../Utils/config-vars";
var crypto = require("crypto");
export class SubmitUser extends PrimitiveUser {
  public readonly email: string;
  public readonly password: string;
  constructor(mailName: string, passworders: string, configg: ConfigVars) {
    super();
    const hash = hashSync(passworders, 12);
    this.email = mailName;
    this.password = hash;
    return this;
  }
  public async submitUser(client: MongoClient): Promise<void> {
    if ((await this.checkUserExists(this.email, client)) !== null)
      throw new Error("User already exists");
    else {
      await client.db("fish_base").collection("Accounts").insertOne({
        uuid: uuidv4(),
        email: this.email,
        password: this.password,
      });
    }
  }
}
