import { Db } from "mongodb";
import { Collections } from "../Common/CollectionNames";
import { UserPermissions } from "../Common/UserPermissionGroups";
import { ITokenData } from "../Utils/TokenClass";
import { IUserMongoDB } from "./PrimitiveUser";
export class AdminUser {
  private readonly client: Db;
  private static isUserAdmin(user: ITokenData): boolean {
    if (user.role === UserPermissions.adminUser) {
      return true;
    } else return false;
  }
  constructor(mongoClient: Db, user: ITokenData) {
    const decodedToke = AdminUser.isUserAdmin(user);
    if (!decodedToke) throw new Error("User is not admin");
    this.client = mongoClient;
  }
  public async pullBackAllUsers(): Promise<IUserMongoDB[]> {
    const allUsers = await this.client
      .collection(Collections.account)
      .find({})
      .toArray();
    return allUsers.map((ele: any) => {
      return ele as IUserMongoDB;
    });
  }
  public async deleteUser(username: string): Promise<void> {
    await this.client
      .collection(Collections.catches)
      .deleteMany({ "properties.Username": username });
    await this.client
      .collection(Collections.account)
      .deleteOne({ email: username });
  }
  public async deleteAllUserCatches(username: string): Promise<void> {
    await this.client
      .collection(Collections.catches)
      .deleteMany({ "properties.Username": username });
  }
}
