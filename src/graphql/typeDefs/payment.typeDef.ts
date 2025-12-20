export const paymentTypeDef = `#graphql
  type Payment {
    id: ID!
    patientId: ID!
    amount: Float!
    method: PaymentMethodType!
    status: PaymentStatus!
    transactionId: String
    razorpayOrderId: String
    razorpayPaymentId: String
    description: String
    appointmentId: ID
    appointment: Appointment
    failureReason: String
    createdAt: String!
    updatedAt: String!
  }

  type PaymentMethod {
    id: ID!
    patientId: ID!
    type: SavedPaymentMethodType!
    last4: String
    bankName: String
    upiId: String
    cardBrand: CardBrand
    isDefault: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PaymentOrder {
    orderId: String!
    amount: Float!
    currency: String!
    receipt: String!
  }

  type PaymentStats {
    totalPaid: Float!
    totalPending: Float!
    totalFailed: Float!
    paymentCount: Int!
  }

  enum PaymentMethodType {
    CARD
    UPI
    NETBANKING
    WALLET
  }

  enum SavedPaymentMethodType {
    CARD
    UPI
    BANK
  }

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  enum CardBrand {
    VISA
    MASTERCARD
    RUPAY
    AMEX
  }

  input CreatePaymentOrderInput {
    amount: Float!
    description: String
    appointmentId: ID
  }

  input VerifyPaymentInput {
    razorpayOrderId: String!
    razorpayPaymentId: String!
    razorpaySignature: String!
    method: PaymentMethodType!
  }

  input CreatePaymentMethodInput {
    type: SavedPaymentMethodType!
    last4: String
    bankName: String
    upiId: String
    cardBrand: CardBrand
    isDefault: Boolean
  }

  input UpdatePaymentMethodInput {
    isDefault: Boolean
    isActive: Boolean
  }

  extend type Query {
    # Get all payments for current user
    payments(status: PaymentStatus): [Payment!]!

    # Get single payment by ID
    payment(id: ID!): Payment

    # Get payment statistics for current user
    paymentStats: PaymentStats!

    # Get all saved payment methods for current user
    paymentMethods: [PaymentMethod!]!

    # Get single payment method by ID
    paymentMethod(id: ID!): PaymentMethod
  }

  extend type Mutation {
    # Create a Razorpay order for payment
    createPaymentOrder(input: CreatePaymentOrderInput!): PaymentOrder!

    # Verify and complete payment
    verifyPayment(input: VerifyPaymentInput!): Payment!

    # Initiate refund for a payment
    refundPayment(id: ID!): Payment!

    # Save a new payment method
    createPaymentMethod(input: CreatePaymentMethodInput!): PaymentMethod!

    # Update payment method (set as default, deactivate)
    updatePaymentMethod(id: ID!, input: UpdatePaymentMethodInput!): PaymentMethod!

    # Delete a payment method
    deletePaymentMethod(id: ID!): Boolean!
  }
`;
