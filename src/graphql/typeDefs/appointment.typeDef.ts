export const appointmentTypeDef = `#graphql
  type Appointment {
    id: ID!
    patientId: ID!
    consultantId: ID!
    centerId: ID!
    consultant: Consultant
    center: Center
    date: String!
    time: String!
    type: AppointmentType!
    status: AppointmentStatus!
    bookingFee: Float!
    createdAt: String!
    updatedAt: String!
  }

  enum AppointmentType {
    IN_PERSON
    ONLINE
  }

  enum AppointmentStatus {
    booked
    completed
    cancelled
  }

  input CreateAppointmentInput {
    consultantId: ID!
    centerId: ID!
    date: String!
    time: String!
    type: AppointmentType!
    bookingFee: Float
  }

  input UpdateAppointmentInput {
    date: String
    time: String
    type: AppointmentType
    status: AppointmentStatus
    bookingFee: Float
  }

  extend type Query {
    # Get all appointments for the current user (optionally filtered by status)
    appointments(status: AppointmentStatus): [Appointment!]!

    # Get a specific appointment by ID
    appointment(id: ID!): Appointment

    # Check if a time slot is available for a consultant
    checkAvailability(consultantId: ID!, date: String!, time: String!): Boolean!
  }

  extend type Mutation {
    # Create a new appointment
    createAppointment(input: CreateAppointmentInput!): Appointment!

    # Update an existing appointment
    updateAppointment(id: ID!, input: UpdateAppointmentInput!): Appointment!

    # Cancel an appointment
    cancelAppointment(id: ID!): Appointment!
  }
`;
