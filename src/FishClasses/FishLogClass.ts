import { Db } from "mongodb";
import { IPullCatchReqBody } from "..";
import { AllFishOperations } from "../Utils/AllFishSearch";
import { ExceptionMessage } from "../Common/ExceptionMessages";
import { PrimitiveFish } from "./PrimitiveFish";
import { Collections } from "../Common/CollectionNames";
export interface Ifish {
  scientific_name: string;
  taxocode: string;
  a3_code: string;
  isscaap: number;
  english_name: string;
}
interface Geometry {
  type: string;
  coordinates: number[];
}
interface Properties {
  Username: string;
  Species: string;
  Weight: number;
  Season: string;
  Date: string;
}
export interface IGeoJson {
  type: string;
  geometry: Geometry;
  properties: Properties;
}
export class FishOpErrors extends Error {
  public readonly similarFish?: Ifish[];
  public constructor(message: string, similarFish?: Ifish[]) {
    super(message);
    similarFish ? (this.similarFish = similarFish) : null;
  }
}
export class FishLogOperations extends PrimitiveFish {
  private readonly species: string;
  private readonly weight: number;
  private readonly latitude: number;
  private readonly longitude: number;
  private readonly Season: "Summer" | "Winter" | "Autumn" | "Spring";
  private readonly date: string;
  constructor(username: string, catchObj: any, mongoClient: Db) {
    super(mongoClient, username);
    if (!FishLogOperations.isValidCatchBody(catchObj))
      throw new FishOpErrors(ExceptionMessage.invalidBody);
    if (!Number(catchObj.Weight))
      throw new FishOpErrors(ExceptionMessage.invalidWeight);
    if (!Number(catchObj.Latitude))
      throw new FishOpErrors(ExceptionMessage.invalidLatitude);
    if (!Number(catchObj.Longitude))
      throw new FishOpErrors(ExceptionMessage.invalidLongitude);
    if (!FishLogOperations.isValidDate(catchObj.Date.slice(0, 10)))
      throw new FishOpErrors(ExceptionMessage.invalidDate);
    if (!FishLogOperations.isValidSpecies(catchObj.Species))
      throw new FishOpErrors(
        ExceptionMessage.invalidSpecies,
        AllFishOperations.findSimilarFish(catchObj.Species)
      );
    if (!FishLogOperations.isValidSeason(catchObj.Season))
      throw new FishOpErrors(ExceptionMessage.invalidSeason);
    this.species = catchObj.Species;
    this.weight = catchObj.Weight;
    this.latitude = catchObj.Latitude;
    this.longitude = catchObj.Longitude;
    this.date = new Date(catchObj.Date).toISOString().slice(0, 10);
    this.Season = catchObj.Season as "Summer" | "Winter" | "Autumn" | "Spring";
  }
  private static isValidSeason(seas: string): boolean {
    if (
      seas === "Summer" ||
      seas === "Winter" ||
      seas === "Autumn" ||
      seas === "Spring"
    )
      return true;
    else return false;
  }
  private static isValidSpecies(speciesName: string): boolean {
    const alphabet = "abcdefghijklmnopqrstuvwxyz ";
    const capitalAlphabet = alphabet.toUpperCase();
    let valid = true;
    speciesName.split("").forEach((ele) => {
      if (!alphabet.includes(ele) && !capitalAlphabet.includes(ele))
        valid = false;
    });
    const foundFish: Ifish | undefined =
      AllFishOperations.checkFishMatch(speciesName);
    if (!foundFish) {
      valid = false;
    }
    return valid;
  }
  private static isValidCatchBody(
    catchObj: any
  ): catchObj is IPullCatchReqBody {
    return (
      "Species" in catchObj &&
      "Weight" in catchObj &&
      "Latitude" in catchObj &&
      "Longitude" in catchObj &&
      "Season" in catchObj &&
      "Date" in catchObj
    );
  }
  private static isValidDate(dateString: string): boolean {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    var d = new Date(dateString);
    var dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0, 10) === dateString;
  }
  private createJson(): IGeoJson {
    return {
      type: "Catch",
      geometry: {
        type: "Marker",
        coordinates: [this.latitude, this.longitude],
      },
      properties: {
        Username: this.email,
        Species: this.species,
        Weight: this.weight,
        Season: this.Season,
        Date: this.date,
      },
    };
  }
  public async submitCatch(): Promise<void> {
    await this.client
      .collection(Collections.catches)
      .insertOne(this.createJson());
  }
  public async deleteCatch(): Promise<void> {
    await this.client
      .collection(Collections.catches)
      .deleteOne(this.createJson());
  }
}
