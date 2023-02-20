export abstract class ExceptionMessage {
  public static readonly internalServerError: string = "Internal server error";
  public static readonly invalidSeason: string = "Invalid season given";
  public static readonly invalidWeight: string = "Invalid weight given";
  public static readonly invalidBody: string = "Invalid body given";
  public static readonly invalidDate: string = "Invalid date given";
  public static readonly invalidLatitude: string = "Invalid latitude given";
  public static readonly invalidLongitude: string = "Invalid longitude given";
  public static readonly invalidEmail: string = "Invalid email given";
  public static readonly invalidSpecies: string = "Invalid species given";
  public static readonly invalidDeleteArray: string =
    "Please provide valid Array to delete";
  public static readonly invalidGeoJson: string =
    "Please provide valid GeoJson catches to delete";
  public static readonly invalidSearchOptions: string =
    "Please give valid search options";
  public static readonly invalidUser: string = "User doesn't Exist";
  public static readonly invalidPassword: string = "Password incorrect";
  public static readonly invalidEnv: string = "Not all env vars present";
  public static readonly invalidMongoConnection: string =
    "Connection to mongo failed";
  public static readonly invalidUserExists: string = "User already exists";
  public static readonly userNotAdmin: string = "User is not admin";
  public static readonly noTarget: string = "No target given";
}
