import { ConfigVars } from "./config-vars";
import { MongoClient } from "mongodb";
export class MongoConnector {
  public readonly configs: ConfigVars;
  public readonly client: MongoClient;
  constructor(configVarObject: ConfigVars) {
    this.configs = configVarObject;
    this.client = new MongoClient(this.configs.MONGODB_URI);
    return this;
  }
  public async connectToMongo(): Promise<MongoClient> {
    try {
      await this.client.connect();
      return this.client;
    } catch (error) {
      throw new Error(`Connection to mongo failed`);
    }
  }
}
