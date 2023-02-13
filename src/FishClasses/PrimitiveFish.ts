import { Db } from "mongodb";
export abstract class PrimitiveFish {
  protected readonly client: Db;
  protected readonly email: string;
  constructor(mongoClient: Db, user: string) {
    this.client = mongoClient;
    this.email = user;
  }
}
