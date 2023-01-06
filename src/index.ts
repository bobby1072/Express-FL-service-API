import { MongoConnector } from "./Utils/MongoConnectorClass";
import { PrimitiveUser } from "./UserClasses/PrimitiveUser";
import { SubmitUser } from "./UserClasses/SuBmitUserClass";
import { ConfigVars } from "./Utils/config-vars";
import { LoginUser } from "./UserClasses/LoginUserClass";
async function main() {
  const configVars = new ConfigVars();
  const user = new PrimitiveUser();
  const client = await new MongoConnector(configVars).connectToMongo();
  await new SubmitUser("yoi", "pass", configVars).submitUser(client);
  console.log(await new LoginUser(configVars, "yoi", "pass").login(client));
  await new LoginUser(configVars, "yoi", "pass").deleteUser(client);
}
main();
