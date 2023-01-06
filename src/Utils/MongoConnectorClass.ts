import { ConfigVars } from "./config-vars";
import { MongoClient } from "mongodb";
export class MongoConnector {
  public readonly configs: ConfigVars;
  constructor(configVarObject: ConfigVars) {
    this.configs = configVarObject;
    return this;
  }
  public async connectToMongo(): Promise<MongoClient> {
    const client: MongoClient = new MongoClient(this.configs.MONGODB_URI);
    try {
      await client.connect();
      return client;
    } catch (error) {
      throw new Error(`Connection to mongo failed`);
    }
  }
}
