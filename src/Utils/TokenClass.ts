import { sign, verify, JwtPayload } from "jsonwebtoken";
import { ConfigVars } from "./config-vars";
interface ITokenData {
  user: string;
  iat: number;
  exp: number;
}
export class Token {
  public readonly configVars: ConfigVars;
  constructor(config: ConfigVars) {
    this.configVars = config;
  }
  public encodeToken(userName: string): string {
    const jwt: string = sign(
      {
        user: userName,
      },
      this.configVars.FISHLOGSK,
      { algorithm: "HS256", expiresIn: "1h" }
    );
    return jwt;
  }
  public decodeToken(token: string): ITokenData {
    const decodedToken = verify(token, this.configVars.FISHLOGSK) as ITokenData;
    return decodedToken;
  }
}
