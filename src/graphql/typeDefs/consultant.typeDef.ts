export const consultantTypeDef = `#graphql
  type Consultant {
    id: ID!
    name: String!
    specialty: String!
    experience: String!
    rating: Float!
    centerId: ID!
    center: Center
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    # Get all consultants (optionally filtered by centerId or specialty)
    consultants(centerId: ID, specialty: String): [Consultant!]!

    # Get a specific consultant by ID
    consultant(id: ID!): Consultant
  }
`;
