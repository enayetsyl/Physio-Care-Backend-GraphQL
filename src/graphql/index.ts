import { userTypeDef } from "./typeDefs/user.typeDef";
import { userResolver } from "./resolvers/user.resolver";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { authResolver } from "./resolvers/auth.resolver";
import { goalTypeDef } from "./typeDefs/goal.typeDef";
import { goalResolver } from "./resolvers/goal.resolver";
import { centerTypeDef } from "./typeDefs/center.typeDef";
import { centerResolver } from "./resolvers/center.resolver";
import { consultantTypeDef } from "./typeDefs/consultant.typeDef";
import { consultantResolver } from "./resolvers/consultant.resolver";
import { appointmentTypeDef } from "./typeDefs/appointment.typeDef";
import { appointmentResolver } from "./resolvers/appointment.resolver";
import { paymentTypeDef } from "./typeDefs/payment.typeDef";
import { paymentResolver } from "./resolvers/payment.resolver";
import { wrapResolvers } from "./utils/wrapResolvers";

export const typeDefs = [
  userTypeDef,
  authTypeDef,
  goalTypeDef,
  centerTypeDef,
  consultantTypeDef,
  appointmentTypeDef,
  paymentTypeDef,
];
export const resolvers = wrapResolvers([
  userResolver,
  authResolver,
  goalResolver,
  centerResolver,
  consultantResolver,
  appointmentResolver,
  paymentResolver,
]);
