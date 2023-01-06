import { sign, Secret, verify } from "jsonwebtoken";
import { ConfigVars } from "./config-vars";
export class Token {
  public encodeToken(config: ConfigVars, userName: string): string {
    const jwt: string = sign(
      { user: userName, exp: Math.floor(new Date().getTime() / 1000) },
      config.FISHLOGSK
    );
    return jwt;
  }
  public decodeToken(config: ConfigVars, token: string) {
    const decodedToken = verify(token, config.FISHLOGSK);
    return decodedToken;
  }
}
