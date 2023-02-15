import { compareSync, hashSync } from "bcryptjs";
export abstract class PasswordHash {
  public static hashPassword(passworders: string): string {
    const hash = hashSync(passworders, 12);
    return hash;
  }
  public static comparePassword(checkPass: string, hashPass: string): boolean {
    return compareSync(checkPass, hashPass);
  }
}
