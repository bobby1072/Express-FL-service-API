import { Db } from "mongodb";
import { IGeoJson } from "./FishLogClass";
import { PrimitiveFish } from "./PrimitiveFish";
export interface IGeoJsonWithRecordId extends IGeoJson {
  recordId: number;
}
class FishLoadOperations extends PrimitiveFish {
  constructor(client: Db, mail: string) {
    super(client, mail);
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
        .collection("catch")
        .find({ "properties.Username": this.email })
        .toArray()
    );
  }
}
export default FishLoadOperations;
