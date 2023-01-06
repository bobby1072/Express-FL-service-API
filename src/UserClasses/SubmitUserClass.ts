import { PrimitiveUser } from "./PrimitiveUser";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
var crypto = require("crypto");
export class SubmitUser extends PrimitiveUser {
  public readonly email: string;
  public readonly password: string;
  constructor(mailName: string, passworders: string) {
    super();
    const hash = crypto
      .createHash("sha256")
      .update(passworders)
      .digest("base64");
    this.email = mailName;
    this.password = hash;
  }
  public async submitUser(client: MongoClient): Promise<void> {
    if (this.checkUserExists(this.email, client) !== null)
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
