import { Db, ObjectId } from "mongodb";
export interface IUserMongoDB {
  _id: ObjectId;
  email: string;
  password: string;
  uuid: string;
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
      .collection("Accounts")
      .findOne({ email: emailUser })) as IUserMongoDB;
    return user;
  }
}
