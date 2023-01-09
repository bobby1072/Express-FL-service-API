import { sign, verify, JwtPayload } from "jsonwebtoken";
import { ConfigVars } from "./config-vars";
export class Token {
  public readonly configVars: ConfigVars;
  constructor(config: ConfigVars) {
    this.configVars = config;
  }
  public encodeToken(userName: string): string {
    const jwt: string = sign(
      { user: userName, exp: Math.floor(new Date().getTime() / 1000) },
      this.configVars.FISHLOGSK
    );
    return jwt;
  }
  public decodeToken(token: string): string | JwtPayload {
    const decodedToken = verify(token, this.configVars.FISHLOGSK);
    return decodedToken;
  }
}
