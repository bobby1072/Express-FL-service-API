import { ObjectID } from "bson";
import { MongoClient } from "mongodb";
import { ConfigVars } from "../Utils/config-vars";
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
  public readonly client: MongoClient;
  public readonly email: string;
  public readonly species: string;
  public readonly weight: number;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly season: "Summer" | "Winter" | "Autumn" | "Spring";
  public readonly date: string;
  constructor(
    username: string,
    species: string,
    weight: number,
    latitude: number,
    longitude: number,
    season: string,
    date: string,
    config: ConfigVars,
    mongoClient: MongoClient
  ) {
    super(config);
    this.email = username;
    this.species = species;
    this.weight = weight;
    this.latitude = latitude;
    this.longitude = longitude;
    this.client = mongoClient;
    this.date = date;
    if (
      season === "Summer" ||
      season === "Winter" ||
      season === "Autumn" ||
      season === "Spring"
    )
      this.season = season;
    else throw new Error("Invalid Season given");
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
        Season: this.season,
        Date: this.date,
      },
    };
  }
  public async submitCatch(): Promise<void> {
    await this.client
      .db("fish_base")
      .collection("catch")
      .insertOne(this.createJson());
  }
  public async deleteCatch(): Promise<void> {
    await this.client
      .db("fish_base")
      .collection("catch")
      .deleteOne(this.createJson());
  }
}
