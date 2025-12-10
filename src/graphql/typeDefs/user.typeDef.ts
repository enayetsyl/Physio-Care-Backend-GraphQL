export const userTypeDef = `#graphql
     type User {
       id: ID!
       name: String!
       mobile: String!
       email: String!
       dateOfBirth: String
       gender: Gender
       age: Int
       weight: Float
       height: Float
       bloodGroup: BloodGroup
       isActive: Boolean!
       createdAt: String!
       updatedAt: String!
     }
   
     enum Gender {
       male
       female
       other
     }
   
     enum BloodGroup {
       A_POSITIVE
       A_NEGATIVE
       B_POSITIVE
       B_NEGATIVE
       AB_POSITIVE
       AB_NEGATIVE
       O_POSITIVE
       O_NEGATIVE
     }
   
     input CreateUserInput {
       name: String!
       mobile: String!
       email: String!
       dateOfBirth: String
       gender: Gender
     }
   
     input UpdateUserInput {
       name: String
       email: String
       dateOfBirth: String
       gender: Gender
       age: Int
       weight: Float
       height: Float
       bloodGroup: BloodGroup
     }
   
     type Query {
       # Get current user profile
       me: User
   
       # Get user by ID (admin)
       user(id: ID!): User
   
       # Get all users (admin)
       users: [User!]!
     }
   
     type Mutation {
       # Update current user profile
       updateProfile(input: UpdateUserInput!): User!
     }
   `;