import { sign, verify } from "jsonwebtoken";
import { UserPermissions } from "../Common/UserPermissionGroups";
import { ITokenAccountObj } from "../UserClasses/LoginUserClass";
import { ConfigVars } from "./config-vars";
export interface ITokenData {
  user: string;
  iat: number;
  exp: number;
  role: string;
}
export abstract class Token {
  public static encodeToken(userName: string, permissionLevel: string): string {
    const jwt: string = sign(
      {
        user: userName,
        role: permissionLevel,
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
