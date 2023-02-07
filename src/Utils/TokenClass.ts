import { sign, verify } from "jsonwebtoken";
import { ConfigVars } from "./config-vars";
interface ITokenData {
  user: string;
  iat: number;
  exp: number;
}
export abstract class Token {
  public static encodeToken(userName: string): string {
    const jwt: string = sign(
      {
        user: userName,
      },
      ConfigVars.FISHLOGSK,
      { algorithm: "HS256", expiresIn: "1h" }
    );
    return jwt;
  }
  public static decodeToken(token: string): ITokenData {
    if (token.includes("Bearer ")) token = token.replace("Bearer ", "");
    const decodedToken = verify(token, ConfigVars.FISHLOGSK) as ITokenData;
    return decodedToken;
  }
}
