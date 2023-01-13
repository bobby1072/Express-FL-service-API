import { FindCursor, MongoClient, ObjectId, WithId } from "mongodb";
import { ConfigVars } from "../Utils/config-vars";
import { IGeoJson } from "./FishLogClass";
import { PrimitiveFish } from "./PrimitiveFish";
export interface IGeoJsonWithRecordId extends IGeoJson {
  recordId: number;
}
class FishLoadOperations extends PrimitiveFish {
  constructor(config: ConfigVars, client: MongoClient, mail: string) {
    super(config, client, mail);
  }
  private sortResult(geoJs: any) {
    let recordCount = 1;
    return geoJs.map((ele: any): IGeoJsonWithRecordId => {
      const newEle: any = ele;
      delete newEle._id;
      newEle.recordId = recordCount;
      recordCount++;
      return newEle;
    });
  }
  public async getOwnCatches(): Promise<IGeoJsonWithRecordId[]> {
    return this.sortResult(
      await this.client
        .db("fish_base")
        .collection("catch")
        .find({ "properties.Username": this.email })
        .toArray()
    );
  }
}
export default FishLoadOperations;
