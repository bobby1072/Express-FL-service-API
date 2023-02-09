import { ConfigVars } from "./config-vars";
import { Db, MongoClient } from "mongodb";
export abstract class MongoConnector {
  private static client: MongoClient = new MongoClient(ConfigVars.MONGODB_URI);
  public static async connectToMongo(): Promise<Db> {
    try {
      await MongoConnector.client.connect();
      return MongoConnector.client.db("fish_base");
    } catch (error) {
      throw new Error(`Connection to mongo failed`);
    }
  }
}
