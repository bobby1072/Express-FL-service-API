import { Db, ObjectId } from "mongodb";
import { Collections } from "../Common/CollectionNames";
export interface IUserMongoDB {
  _id: ObjectId;
  email: string;
  password: string;
  uuid: string;
  role: string;
}
export abstract class PrimitiveUser {
  protected readonly client: Db;
  protected readonly email: string;
  constructor(mongoClient: Db, mail: string) {
    this.client = mongoClient;
    this.email = mail.toLowerCase();
  }
  protected async checkUserExists(
    emailUser: string
  ): Promise<IUserMongoDB | null> {
    const user = (await this.client
      .collection(Collections.account)
      .findOne({ email: emailUser })) as IUserMongoDB;
    return user;
  }
}
