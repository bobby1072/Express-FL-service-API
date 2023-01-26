import { Db } from "mongodb";
import { IPullCatchReqBody } from "..";
import { PrimitiveFish } from "./PrimitiveFish";
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
export class FishLogOperations extends PrimitiveFish {
  public readonly species: string;
  public readonly weight: number;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly Season: "Summer" | "Winter" | "Autumn" | "Spring";
  public readonly date: Date;
  constructor(username: string, catchObj: any, mongoClient: Db) {
    super(mongoClient, username);
    if (!Number(catchObj.Weight)) throw new Error("Invalid weight given");
    if (!Number(catchObj.Latitude)) throw new Error("Invalid latitude given");
    if (!Number(catchObj.Longitude)) throw new Error("Invalid longitude given");
    if (!this.isValidCatchBody(catchObj)) throw new Error("Invalid body given");
    if (!this.isValidDate(catchObj.Date.slice(0, 10)))
      throw new Error("Invalid date given");
    if (!this.isValidSpecies(catchObj.Species))
      throw new Error("Invalid species given");
    if (!this.isValidSeason(catchObj.Season))
      throw new Error("Invalid Season given");
    this.species = catchObj.Species;
    this.weight = catchObj.Weight;
    this.latitude = catchObj.Latitude;
    this.longitude = catchObj.Longitude;
    this.date = new Date(catchObj.Date);
    this.Season = catchObj.Season as "Summer" | "Winter" | "Autumn" | "Spring";
  }
  private isValidSeason(seas: string): boolean {
    if (
      seas === "Summer" ||
      seas === "Winter" ||
      seas === "Autumn" ||
      seas === "Spring"
    )
      return true;
    else return false;
  }
  private isValidSpecies(speciesName: string): boolean {
    const alphabet = "abcdefghijklmnopqrstuvwxyz ";
    const capitalAlphabet = alphabet.toUpperCase();
    let valid = true;
    speciesName.split("").forEach((ele) => {
      if (!alphabet.includes(ele) && !capitalAlphabet.includes(ele))
        valid = false;
    });
    return valid;
  }
  private isValidCatchBody(catchObj: any): catchObj is IPullCatchReqBody {
    return (
      "Species" in catchObj &&
      "Weight" in catchObj &&
      "Latitude" in catchObj &&
      "Longitude" in catchObj &&
      "Season" in catchObj &&
      "Date" in catchObj
    );
  }
  private isValidDate(dateString: string): boolean {
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
        Date: this.date.toISOString(),
      },
    };
  }
  public async submitCatch(): Promise<void> {
    await this.client.collection("catch").insertOne(this.createJson());
  }
  public async deleteCatch(): Promise<void> {
    await this.client.collection("catch").deleteOne(this.createJson());
  }
}
