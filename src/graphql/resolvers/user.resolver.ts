import { User } from "../../models";
   import { GraphQLError } from "graphql";

   // Helper to map blood group enum
   const bloodGroupMap: Record<string, string> = {
     "A+": "A_POSITIVE",
     "A-": "A_NEGATIVE",
     "B+": "B_POSITIVE",
     "B-": "B_NEGATIVE",
     "AB+": "AB_POSITIVE",
     "AB-": "AB_NEGATIVE",
     "O+": "O_POSITIVE",
     "O-": "O_NEGATIVE",
   };

   const reverseBloodGroupMap: Record<string, string> = {
     A_POSITIVE: "A+",
     A_NEGATIVE: "A-",
     B_POSITIVE: "B+",
     B_NEGATIVE: "B-",
     AB_POSITIVE: "AB+",
     AB_NEGATIVE: "AB-",
     O_POSITIVE: "O+",
     O_NEGATIVE: "O-",
   };

   export const userResolver = {
     Query: {
       me: async (
         _: unknown,
         __: unknown,
         context: { user?: { id: string } }
       ) => {
         if (!context.user) {
           throw new GraphQLError("Not authenticated", {
             extensions: { code: "UNAUTHENTICATED" },
           });
         }

         const user = await User.findById(context.user.id);
         if (!user) {
           throw new GraphQLError("User not found", {
             extensions: { code: "NOT_FOUND" },
           });
         }

         return user;
       },

       user: async (_: unknown, { id }: { id: string }) => {
         const user = await User.findById(id);
         if (!user) {
           throw new GraphQLError("User not found", {
             extensions: { code: "NOT_FOUND" },
           });
         }
         return user;
       },

       users: async () => {
         return User.find({ isActive: true });
       },
     },

     Mutation: {
       updateProfile: async (
         _: unknown,
         { input }: { input: Record<string, unknown> },
         context: { user?: { id: string } }
       ) => {
         if (!context.user) {
           throw new GraphQLError("Not authenticated", {
             extensions: { code: "UNAUTHENTICATED" },
           });
         }

         // Convert blood group enum to DB format
         if (input.bloodGroup) {
           input.bloodGroup = reverseBloodGroupMap[input.bloodGroup as string];
         }

         const user = await User.findByIdAndUpdate(
           context.user.id,
           { $set: input },
           { new: true, runValidators: true }
         );

         if (!user) {
           throw new GraphQLError("User not found", {
             extensions: { code: "NOT_FOUND" },
           });
         }

         return user;
       },
     },

     User: {
       id: (parent: { _id: string }) => parent._id.toString(),
       bloodGroup: (parent: { bloodGroup?: string }) => {
         return parent.bloodGroup ? bloodGroupMap[parent.bloodGroup] : null;
       },
       createdAt: (parent: { createdAt: Date }) =>
         parent.createdAt.toISOString(),
       updatedAt: (parent: { updatedAt: Date }) =>
         parent.updatedAt.toISOString(),
       dateOfBirth: (parent: { dateOfBirth?: Date }) => {
         return parent.dateOfBirth ? parent.dateOfBirth.toISOString() : null;
       },
     },
   };