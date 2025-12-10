import { userTypeDef } from "./typeDefs/user.typeDef";
import { userResolver } from "./resolvers/user.resolver";

export const typeDefs = [userTypeDef];
export const resolvers = [userResolver];