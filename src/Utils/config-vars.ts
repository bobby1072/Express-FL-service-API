import * as dotenv from "dotenv";

export abstract class ConfigVars {
  private static getVars(varKey: string): string {
    dotenv.config();
    const enVariable = process.env[`${varKey}`];
    if (!enVariable) throw new Error("Not all env vars present");
    return enVariable;
  }
  public static FISHLOGSK: string = ConfigVars.getVars("FISHLOGSK");
  public static MONGODB_URI: string = ConfigVars.getVars("MONGODB_URI");
}
