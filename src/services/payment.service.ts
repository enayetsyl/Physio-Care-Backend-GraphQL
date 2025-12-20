import Razorpay = require("razorpay");
import crypto = require("crypto");
import { config } from "../config";
import { AppError } from "../utils/errors";

export class PaymentService {
  private static razorpay: any = null;

  private static getRazorpayInstance(): any {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      throw new AppError(
        "Razorpay credentials not configured",
        "RAZORPAY_CONFIG_ERROR",
        500
      );
    }

    if (!this.razorpay) {
      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
    }

    return this.razorpay;
  }

  /**
   * Create a Razorpay order for payment
   * @param amount - Amount in rupees (will be converted to paise)
   * @param receipt - Receipt ID (e.g., appointment ID or unique identifier)
   * @param notes - Optional notes for the order
   */
  static async createOrder(
    amount: number,
    receipt: string,
    notes?: Record<string, string>
  ): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  }> {
    try {
      const razorpay = this.getRazorpayInstance();

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert rupees to paise
        currency: "INR",
        receipt,
        notes,
      });

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);

      // Provide more detailed error message
      const errorMessage = error?.error?.description ||
                          error?.message ||
                          "Failed to create payment order";

      throw new AppError(
        errorMessage,
        "RAZORPAY_ORDER_ERROR",
        500
      );
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param orderId - Razorpay order ID
   * @param paymentId - Razorpay payment ID
   * @param signature - Signature from Razorpay
   * @returns true if signature is valid
   */
  static verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (!config.razorpay.keySecret) {
      throw new AppError(
        "Razorpay secret key not configured",
        "RAZORPAY_CONFIG_ERROR",
        500
      );
    }

    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", config.razorpay.keySecret)
        .update(text)
        .digest("hex");

      return generatedSignature === signature;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param paymentId - Razorpay payment ID
   */
  static async fetchPayment(paymentId: string): Promise<{
    id: string;
    amount: number;
    status: string;
    method: string;
    email?: string;
    contact?: string;
  }> {
    try {
      const razorpay = this.getRazorpayInstance();
      const payment = await razorpay.payments.fetch(paymentId);

      return {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
      };
    } catch (error) {
      console.error("Razorpay payment fetch error:", error);
      throw new AppError(
        "Failed to fetch payment details",
        "RAZORPAY_FETCH_ERROR",
        500
      );
    }
  }

  /**
   * Initiate a refund for a payment
   * @param paymentId - Razorpay payment ID
   * @param amount - Amount to refund in paise (optional, full refund if not provided)
   */
  static async createRefund(
    paymentId: string,
    amount?: number
  ): Promise<{
    id: string;
    paymentId: string;
    amount: number;
    status: string;
  }> {
    try {
      // In development mode, handle test payments
      const isTestPayment = paymentId.startsWith("pay_test");
      const isDevelopment = process.env.NODE_ENV === "development";

      if (isDevelopment && isTestPayment) {
        console.log(
          "⚠️  Development mode: Simulating refund for test payment",
          paymentId
        );
        return {
          id: `refund_test_${Date.now()}`,
          paymentId: paymentId,
          amount: amount || 0,
          status: "processed",
        };
      }

      const razorpay = this.getRazorpayInstance();
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (error) {
      console.error("Razorpay refund error:", error);
      throw new AppError(
        "Failed to process refund",
        "RAZORPAY_REFUND_ERROR",
        500
      );
    }
  }
}
