import { Db } from "mongodb";
import { Collections } from "../Common/CollectionNames";
import { ExceptionMessage } from "../Common/ExceptionMessages";
import { UserPermissions } from "../Common/UserPermissionGroups";
import { LoginUser } from "./LoginUserClass";
import { IUserMongoDB } from "./PrimitiveUser";
export class AdminUser extends LoginUser {
  private readonly targetName?: string;
  constructor(
    mail: string,
    pass: string,
    mongoClient: Db,
    role: string,
    target?: string
  ) {
    super(mail, pass, mongoClient);
    if (!AdminUser.isUserAdmin(role))
      throw new Error(ExceptionMessage.userNotAdmin);
    if (target) this.targetName = target;
  }
  private static isUserAdmin(role: string): boolean {
    if (role === UserPermissions.adminUser) {
      return true;
    } else return false;
  }
  public async pullBackAllUsers(): Promise<IUserMongoDB[]> {
    if (!(await this.login())) {
      throw new Error(ExceptionMessage.invalidPassword);
    } else {
      const allUsers = await this.client
        .collection(Collections.account)
        .find({})
        .toArray();
      return allUsers.map((ele: any) => {
        return ele as IUserMongoDB;
      });
    }
  }
  public async deleteUserAdmin(): Promise<void> {
    if (!this.targetName) throw new Error(ExceptionMessage.noTarget);
    if (!(await this.login())) {
      throw new Error(ExceptionMessage.invalidPassword);
    } else {
      await Promise.all([
        this.client
          .collection(Collections.catches)
          .deleteMany({ "properties.Username": this.targetName }),
        this.client
          .collection(Collections.account)
          .deleteOne({ email: this.targetName }),
      ]);
    }
  }
  public async deleteAllUserCatchesAdmin(): Promise<void> {
    if (!this.targetName) throw new Error(ExceptionMessage.noTarget);
    if (!(await this.login())) {
      throw new Error(ExceptionMessage.invalidPassword);
    } else {
      await this.client
        .collection(Collections.catches)
        .deleteMany({ "properties.Username": this.targetName });
    }
  }
  public async updateUser(option: string, newVal: string) {
    if (option !== "email" && option !== "role" && option !== "password")
      throw new Error(ExceptionMessage.invalidOptions);
    if (!this.targetName) throw new Error(ExceptionMessage.noTarget);
    if (!(await this.login())) {
      throw new Error(ExceptionMessage.invalidPassword);
    } else {
      if (option === "email") {
        await Promise.all([
          this.client
            .collection(Collections.catches)
            .updateMany(
              { "properties.Username": this.targetName },
              { $set: { [option]: newVal } }
            ),
          this.client
            .collection(Collections.account)
            .updateOne(
              { email: this.targetName },
              { $set: { [option]: newVal } }
            ),
        ]);
      } else {
        await this.client
          .collection(Collections.account)
          .updateOne(
            { email: this.targetName },
            { $set: { [option]: newVal } }
          );
      }
    }
  }
}
