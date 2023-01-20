import { ConfigVars } from "./config-vars";
import { Db, MongoClient } from "mongodb";
export class MongoConnector {
  private readonly configs: ConfigVars;
  public readonly client: MongoClient;
  constructor(configVarObject: ConfigVars) {
    this.configs = configVarObject;
    this.client = new MongoClient(this.configs.MONGODB_URI);
    return this;
  }
  public async connectToMongo(): Promise<Db> {
    try {
      await this.client.connect();
      return this.client.db("fish_base");
    } catch (error) {
      throw new Error(`Connection to mongo failed`);
    }
  }
}
