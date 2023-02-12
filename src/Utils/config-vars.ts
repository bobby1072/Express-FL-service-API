import * as dotenv from "dotenv";
import { ExceptionMessage } from "./ExceptionMessages";

export abstract class ConfigVars {
  private static getVars(varKey: string): string {
    dotenv.config();
    const enVariable = process.env[`${varKey}`];
    if (!enVariable) throw new Error(ExceptionMessage.invalidEnv);
    return enVariable;
  }
  public static FISHLOGSK: string = ConfigVars.getVars("FISHLOGSK");
  public static MONGODB_URI: string = ConfigVars.getVars("MONGODB_URI");
}
