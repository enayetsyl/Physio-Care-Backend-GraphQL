import mongoose from "mongoose";
import { GraphQLError } from "graphql";
import { Payment } from "../../models/Payment";
import { PaymentMethod } from "../../models/PaymentMethod";
import { Appointment } from "../../models/Appointment";
import { requireAuth, AuthContext } from "../../middleware/auth.middleware";
import { PaymentService } from "../../services/payment.service";
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../../validators/payment.validator";

// Enum mappings
const paymentMethodTypeMap: Record<
  string,
  "card" | "upi" | "netbanking" | "wallet"
> = {
  CARD: "card",
  UPI: "upi",
  NETBANKING: "netbanking",
  WALLET: "wallet",
};

const reversePaymentMethodTypeMap: Record<
  string,
  "CARD" | "UPI" | "NETBANKING" | "WALLET"
> = {
  card: "CARD",
  upi: "UPI",
  netbanking: "NETBANKING",
  wallet: "WALLET",
};

const savedPaymentMethodTypeMap: Record<string, "card" | "upi" | "bank"> = {
  CARD: "card",
  UPI: "upi",
  BANK: "bank",
};

const reverseSavedPaymentMethodTypeMap: Record<string, "CARD" | "UPI" | "BANK"> = {
  card: "CARD",
  upi: "UPI",
  bank: "BANK",
};

const paymentStatusMap: Record<
  string,
  "pending" | "completed" | "failed" | "refunded"
> = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const reversePaymentStatusMap: Record<
  string,
  "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
> = {
  pending: "PENDING",
  completed: "COMPLETED",
  failed: "FAILED",
  refunded: "REFUNDED",
};

const cardBrandMap: Record<string, "visa" | "mastercard" | "rupay" | "amex"> = {
  VISA: "visa",
  MASTERCARD: "mastercard",
  RUPAY: "rupay",
  AMEX: "amex",
};

const reverseCardBrandMap: Record<string, "VISA" | "MASTERCARD" | "RUPAY" | "AMEX"> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  rupay: "RUPAY",
  amex: "AMEX",
};

export const paymentResolver = {
  Query: {
    payments: async (
      _: unknown,
      { status }: { status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" },
      context: AuthContext
    ) => {
      const user = requireAuth(context);
      const query: Record<string, unknown> = { patientId: user.id };

      if (status) {
        const dbStatus = paymentStatusMap[status];
        if (dbStatus) {
          query.status = dbStatus;
        }
      }

      return Payment.find(query).sort({ createdAt: -1 });
    },

    payment: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid payment ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const payment = await Payment.findOne({ _id: id, patientId: user.id });

      if (!payment) {
        throw new GraphQLError("Payment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return payment;
    },

    paymentStats: async (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context);

      const payments = await Payment.find({ patientId: user.id });

      const stats = {
        totalPaid: 0,
        totalPending: 0,
        totalFailed: 0,
        paymentCount: payments.length,
      };

      payments.forEach((payment) => {
        if (payment.status === "completed") {
          stats.totalPaid += payment.amount;
        } else if (payment.status === "pending") {
          stats.totalPending += payment.amount;
        } else if (payment.status === "failed") {
          stats.totalFailed += payment.amount;
        }
      });

      return stats;
    },

    paymentMethods: async (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context);
      return PaymentMethod.find({ patientId: user.id, isActive: true }).sort({
        isDefault: -1,
        createdAt: -1,
      });
    },

    paymentMethod: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid payment method ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const paymentMethod = await PaymentMethod.findOne({
        _id: id,
        patientId: user.id,
      });

      if (!paymentMethod) {
        throw new GraphQLError("Payment method not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return paymentMethod;
    },
  },

  Mutation: {
    createPaymentOrder: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      // Validate input
      createPaymentOrderSchema.parse(input);

      const { amount, description, appointmentId } = input;

      // Validate appointment if provided
      if (appointmentId) {
        if (!mongoose.Types.ObjectId.isValid(appointmentId as string)) {
          throw new GraphQLError("Invalid appointment ID", {
            extensions: { code: "INVALID_INPUT" },
          });
        }

        const appointment = await Appointment.findOne({
          _id: appointmentId,
          patientId: user.id,
        });

        if (!appointment) {
          throw new GraphQLError("Appointment not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      // Generate unique receipt ID (max 40 chars for Razorpay)
      // Format: rcpt_<last8ofUserId>_<timestamp>
      const userIdShort = user.id.substring(user.id.length - 8);
      const receiptId = `rcpt_${userIdShort}_${Date.now()}`;

      // Create Razorpay order
      const order = await PaymentService.createOrder(
        amount as number,
        receiptId,
        {
          patientId: user.id,
          description: (description as string) || "Payment for PhysioCare",
        }
      );

      // Create payment record in database
      await Payment.create({
        patientId: user.id,
        amount: (amount as number),
        method: "card", // Will be updated when payment is verified
        status: "pending",
        razorpayOrderId: order.id,
        description: description as string,
        appointmentId: appointmentId as string,
      });

      return {
        orderId: order.id,
        amount: (amount as number),
        currency: order.currency,
        receipt: order.receipt,
      };
    },

    verifyPayment: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      // Validate input
      verifyPaymentSchema.parse(input);

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, method } =
        input;

      // Verify signature (skip in development for test payments)
      const isDevelopment = process.env.NODE_ENV === "development";
      const isTestPayment = (razorpayPaymentId as string).startsWith("pay_test");

      if (!isDevelopment || !isTestPayment) {
        const isValid = PaymentService.verifySignature(
          razorpayOrderId as string,
          razorpayPaymentId as string,
          razorpaySignature as string
        );

        if (!isValid) {
          throw new GraphQLError("Invalid payment signature", {
            extensions: { code: "INVALID_SIGNATURE" },
          });
        }
      } else {
        console.log(
          "⚠️  Development mode: Skipping signature verification for test payment"
        );
      }

      // Find payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpayOrderId as string,
        patientId: user.id,
      });

      if (!payment) {
        throw new GraphQLError("Payment record not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Update payment record
      const dbMethod = paymentMethodTypeMap[method as string] || "card";
      payment.status = "completed";
      payment.razorpayPaymentId = razorpayPaymentId as string;
      payment.razorpaySignature = razorpaySignature as string;
      payment.method = dbMethod;
      payment.transactionId = razorpayPaymentId as string;

      await payment.save();

      return payment;
    },

    refundPayment: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid payment ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const payment = await Payment.findOne({ _id: id, patientId: user.id });

      if (!payment) {
        throw new GraphQLError("Payment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (payment.status !== "completed") {
        throw new GraphQLError("Only completed payments can be refunded", {
          extensions: { code: "INVALID_STATUS" },
        });
      }

      if (!payment.razorpayPaymentId) {
        throw new GraphQLError("Payment ID not found", {
          extensions: { code: "MISSING_PAYMENT_ID" },
        });
      }

      // Initiate refund
      await PaymentService.createRefund(payment.razorpayPaymentId);

      // Update payment status
      payment.status = "refunded";
      await payment.save();

      return payment;
    },

    createPaymentMethod: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      // Validate input
      createPaymentMethodSchema.parse(input);

      const { type, last4, bankName, upiId, cardBrand, isDefault } = input;

      // Convert enum type
      const dbType = savedPaymentMethodTypeMap[type as string] || "card";

      // Convert card brand if provided
      let dbCardBrand: "visa" | "mastercard" | "rupay" | "amex" | undefined;
      if (cardBrand) {
        dbCardBrand = cardBrandMap[cardBrand as string];
      }

      const paymentMethod = await PaymentMethod.create({
        patientId: user.id,
        type: dbType,
        last4: last4 as string,
        bankName: bankName as string,
        upiId: upiId as string,
        cardBrand: dbCardBrand,
        isDefault: (isDefault as boolean) || false,
        isActive: true,
      });

      return paymentMethod;
    },

    updatePaymentMethod: async (
      _: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid payment method ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      // Validate input
      updatePaymentMethodSchema.parse(input);

      const paymentMethod = await PaymentMethod.findOneAndUpdate(
        { _id: id, patientId: user.id },
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!paymentMethod) {
        throw new GraphQLError("Payment method not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return paymentMethod;
    },

    deletePaymentMethod: async (
      _: unknown,
      { id }: { id: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid payment method ID", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      const result = await PaymentMethod.deleteOne({
        _id: id,
        patientId: user.id,
      });

      return result.deletedCount > 0;
    },
  },

  Payment: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    patientId: (parent: {
      patientId: mongoose.Types.ObjectId | string;
    }) => {
      return typeof parent.patientId === "string"
        ? parent.patientId
        : parent.patientId.toString();
    },
    appointmentId: (parent: {
      appointmentId?: mongoose.Types.ObjectId | string;
    }) => {
      if (!parent.appointmentId) return null;
      return typeof parent.appointmentId === "string"
        ? parent.appointmentId
        : parent.appointmentId.toString();
    },
    method: (parent: { method: string }) => {
      return reversePaymentMethodTypeMap[parent.method] || "CARD";
    },
    status: (parent: { status: string }) => {
      return reversePaymentStatusMap[parent.status] || "PENDING";
    },
    appointment: async (parent: {
      appointmentId?: mongoose.Types.ObjectId | any;
    }) => {
      if (!parent.appointmentId) return null;

      // Check if already populated
      if (
        parent.appointmentId &&
        typeof parent.appointmentId === "object" &&
        "date" in parent.appointmentId
      ) {
        return parent.appointmentId;
      }

      return Appointment.findById(parent.appointmentId);
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },

  PaymentMethod: {
    id: (parent: { _id: mongoose.Types.ObjectId | string }) => {
      return typeof parent._id === "string"
        ? parent._id
        : parent._id.toString();
    },
    patientId: (parent: {
      patientId: mongoose.Types.ObjectId | string;
    }) => {
      return typeof parent.patientId === "string"
        ? parent.patientId
        : parent.patientId.toString();
    },
    type: (parent: { type: string }) => {
      return reverseSavedPaymentMethodTypeMap[parent.type] || "CARD";
    },
    cardBrand: (parent: { cardBrand?: string }) => {
      if (!parent.cardBrand) return null;
      return reverseCardBrandMap[parent.cardBrand] || null;
    },
    createdAt: (parent: { createdAt: Date }) => {
      return parent.createdAt.toISOString();
    },
    updatedAt: (parent: { updatedAt: Date }) => {
      return parent.updatedAt.toISOString();
    },
  },
};
