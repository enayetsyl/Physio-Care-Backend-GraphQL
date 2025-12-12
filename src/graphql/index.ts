import { userTypeDef } from "./typeDefs/user.typeDef";
import { userResolver } from "./resolvers/user.resolver";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { authResolver } from "./resolvers/auth.resolver";
import { wrapResolvers } from "./utils/wrapResolvers";

export const typeDefs = [userTypeDef, authTypeDef];
export const resolvers = wrapResolvers([userResolver, authResolver]);
