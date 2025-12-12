import { userTypeDef } from "./typeDefs/user.typeDef";
import { userResolver } from "./resolvers/user.resolver";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { authResolver } from "./resolvers/auth.resolver";

export const typeDefs = [userTypeDef, authTypeDef];
export const resolvers = [userResolver, authResolver];