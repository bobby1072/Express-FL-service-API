import * as dotenv from "dotenv";
export class ConfigVars {
  public readonly FISHLOGSK: string;
  public readonly MONGODB_URI: string;
  constructor() {
    dotenv.config();
    if (!process.env.FISHLOGSK || !process.env.MONGODB_URI)
      throw new Error("Not all env vars present");
    this.FISHLOGSK = process.env.FISHLOGSK;
    this.MONGODB_URI = process.env.MONGODB_URI;
    return this;
  }
}
