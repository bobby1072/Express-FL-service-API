import { MongoClient, ObjectId } from "mongodb";
export interface IUserMongoDB {
  _id: ObjectId;
  email: string;
  password: string;
  uuid: string;
}
export abstract class PrimitiveUser {
  public readonly client: MongoClient;
  public readonly email: string;
  constructor(mongoClient: MongoClient, mail: string) {
    this.client = mongoClient;
    this.email = mail.toLowerCase();
  }
  protected async checkUserExists(
    emailUser: string
  ): Promise<IUserMongoDB | null> {
    const user = (await this.client
      .db("fish_base")
      .collection("Accounts")
      .findOne({ email: emailUser })) as IUserMongoDB;
    return user;
  }
}
