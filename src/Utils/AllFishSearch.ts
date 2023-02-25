import { Ifish } from "../FishClasses/FishLogClass";
import allFish from "../Common/allFish.json";
export abstract class AllFishOperations {
  private static readonly allFishData: Ifish[] = allFish;
  public static checkFishMatch(speciesName: string): Ifish | undefined {
    return this.allFishData.find((fishEle: Ifish) => {
      return (
        fishEle.english_name.toLowerCase() === speciesName.toLowerCase() ||
        fishEle.scientific_name.toLowerCase() === speciesName.toLowerCase()
      );
    });
  }
  public static findSimilarFish(fishName: string): Ifish[] | undefined {
    const fishEles: Ifish[] | undefined = this.allFishData.filter(
      (element: Ifish) => {
        return element.english_name
          .toLowerCase()
          .includes(fishName.toLowerCase());
      }
    );
    return fishEles
      ? fishEles.filter((ele: Ifish, index: number) => index <= 5)
      : undefined;
  }
}
