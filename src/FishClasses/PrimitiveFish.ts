import { ConfigVars } from "../Utils/config-vars";
export abstract class PrimitiveFish {
  public readonly configVars: ConfigVars;
  constructor(config: ConfigVars) {
    this.configVars = config;
  }
}
