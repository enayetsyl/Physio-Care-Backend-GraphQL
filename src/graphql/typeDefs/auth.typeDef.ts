export const authTypeDef = `#graphql
     type AuthPayload {
       token: String!
       user: User!
     }
   
     type Mutation {
       # Send OTP to mobile number
       sendOTP(mobile: String!): Boolean!
   
       # Verify OTP and create/login user
       verifyOTP(mobile: String!, otp: String!, userDetails: CreateUserInput): AuthPayload!
   
       # Refresh token (optional)
       refreshToken: AuthPayload!
     }
   `;