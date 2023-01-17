import { MongoClient } from "mongodb";
import { ConfigVars } from "../Utils/config-vars";
export abstract class PrimitiveFish {
  public readonly client: MongoClient;
  public readonly configVars: ConfigVars;
  public readonly email: string;
  constructor(config: ConfigVars, mongoClient: MongoClient, user: string) {
    this.configVars = config;
    this.client = mongoClient;
    this.email = user;
  }
}
