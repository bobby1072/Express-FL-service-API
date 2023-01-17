import { MongoClient } from "mongodb";
export abstract class PrimitiveFish {
  public readonly client: MongoClient;
  public readonly email: string;
  constructor(mongoClient: MongoClient, user: string) {
    this.client = mongoClient;
    this.email = user;
  }
}
