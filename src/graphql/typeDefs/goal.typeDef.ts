export const goalTypeDef = `#graphql
  type Goal {
    id: ID!
    patientId: ID!
    name: String!
    duration: String!
    type: String!
    progress: Int!
    priority: Priority!
    status: GoalStatus!
    current: Float
    target: Float
    unit: String
    latestAchievement: String
    targetDate: String
    lastUpdated: String
    createdAt: String!
    updatedAt: String!
  }

  enum Priority {
    high
    medium
    low
  }

  enum GoalStatus {
    active
    completed
  }

  input CreateGoalInput {
    name: String!
    duration: String!
    type: String!
    priority: Priority!
    target: Float
    unit: String
    targetDate: String
  }

  input UpdateGoalInput {
    name: String
    progress: Int
    current: Float
    target: Float
    latestAchievement: String
    status: GoalStatus
  }

  extend type Query {
    # Get all goals for the current user (optionally filtered by status)
    goals(status: GoalStatus): [Goal!]!

    # Get a specific goal by ID
    goal(id: ID!): Goal
  }

  extend type Mutation {
    # Create a new goal
    createGoal(input: CreateGoalInput!): Goal!

    # Update an existing goal
    updateGoal(id: ID!, input: UpdateGoalInput!): Goal!

    # Delete a goal
    deleteGoal(id: ID!): Boolean!
  }
`;
