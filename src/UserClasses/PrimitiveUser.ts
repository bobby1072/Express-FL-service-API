import { MongoClient, ObjectId } from "mongodb";
export interface IUserMongoDB {
  _id: ObjectId;
  email: string;
  password: string;
  uuid: string;
}
export abstract class PrimitiveUser {
  protected async checkUserExists(
    emailUser: string,
    client: MongoClient
  ): Promise<IUserMongoDB | null> {
    const user = (await client
      .db("fish_base")
      .collection("Accounts")
      .findOne({ email: emailUser })) as IUserMongoDB;
    return user;
  }
}
