import { MongoConnector } from "./Utils/MongoConnectorClass";
import { PrimitiveUser } from "./UserClasses/PrimitiveUser";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import { ConfigVars } from "./Utils/config-vars";
import { LoginUser } from "./UserClasses/LoginUserClass";
async function main(): Promise<void> {
  const configVars = new ConfigVars();
  const client = await new MongoConnector(configVars).connectToMongo();
  await new SubmitUser("yoi", "pass").submitUser(client);
  console.log(await new LoginUser(configVars, "yoi", "pass").login(client));
  await new LoginUser(configVars, "yoi", "pass").deleteUser(client);
}
main();
