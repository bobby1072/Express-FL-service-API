import { Ifish } from "../FishClasses/FishLogClass";
import allFish from "../FishClasses/allFish.json";
export abstract class AllFishOperations {
  private static readonly allFishData: Ifish[] = allFish;
  public static FindSimilarFish(fishName: string): Ifish[] | undefined {
    const fishEles: Ifish[] | undefined = this.allFishData.filter(
      (element: Ifish) => {
        return element.english_name.includes(fishName);
      }
    );
    return fishEles
      ? fishEles.filter((ele: Ifish, index: number) => index <= 5)
      : undefined;
  }
}
