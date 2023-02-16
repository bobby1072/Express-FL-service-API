import { Collections } from "../Common/CollectionNames";
import { ExceptionMessage } from "../Common/ExceptionMessages";
import { IGeoJson } from "./FishLogClass";
import { PrimitiveFish } from "./PrimitiveFish";
export interface IGeoJsonWithRecordId extends IGeoJson {
  recordId: number;
}
export interface IGetCatchesArgs {
  "properties.Username"?: string;
  "properties.Species"?: string;
  "properties.Season"?: string;
  "properties.Date"?: string;
}
class FishLoadOperations extends PrimitiveFish {
  private sortResult(geoJs: any): IGeoJsonWithRecordId[] {
    let recordCount = 1;
    return geoJs.map((ele: any): IGeoJsonWithRecordId => {
      const newEle: any = ele;
      delete newEle._id;
      newEle.recordId = recordCount;
      recordCount++;
      return newEle;
    });
  }
  private validateOptions(options: any): options is IGetCatchesArgs {
    return (
      ("properties.Username" in options &&
        options["properties.Username"] === this.email) ||
      "properties.Species" in options ||
      "properties.Season" in options ||
      "properties.Date" in options
    );
  }
  public async getCatches(options?: any): Promise<IGeoJsonWithRecordId[]> {
    if (options && !this.validateOptions(options))
      throw new Error(ExceptionMessage.invalidSearchOptions);
    return this.sortResult(
      await this.client
        .collection(Collections.catches)
        .find(options ? options : {})
        .toArray()
    );
  }
}
export default FishLoadOperations;
