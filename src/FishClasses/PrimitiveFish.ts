import { Db } from "mongodb";
export abstract class PrimitiveFish {
  public readonly client: Db;
  public readonly email: string;
  constructor(mongoClient: Db, user: string) {
    this.client = mongoClient;
    this.email = user;
  }
}
