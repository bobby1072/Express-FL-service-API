import { MongoConnector } from "./Utils/MongoConnectorClass";
import { PrimitiveUser } from "./UserClasses/PrimitiveUser";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import { ConfigVars } from "./Utils/config-vars";
async function main() {
  const configVars = new ConfigVars();
  const user = new PrimitiveUser();
  const client = await new MongoConnector(configVars).connectToMongo();
  new SubmitUser("yoi", "pass").submitUser(client);
}
main();
