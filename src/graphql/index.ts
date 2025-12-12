import { userTypeDef } from "./typeDefs/user.typeDef";
import { userResolver } from "./resolvers/user.resolver";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { authResolver } from "./resolvers/auth.resolver";
import { goalTypeDef } from "./typeDefs/goal.typeDef";
import { goalResolver } from "./resolvers/goal.resolver";
import { wrapResolvers } from "./utils/wrapResolvers";

export const typeDefs = [userTypeDef, authTypeDef, goalTypeDef];
export const resolvers = wrapResolvers([
  userResolver,
  authResolver,
  goalResolver,
]);
