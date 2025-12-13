export const centerTypeDef = `#graphql
  type Center {
    id: ID!
    name: String!
    address: String!
    city: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    # Get all centers (optionally filtered by city)
    centers(city: String): [Center!]!

    # Get a specific center by ID
    center(id: ID!): Center
  }
`;
