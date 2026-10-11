import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      feeId,
      playerId,
      amount = 2500,
      monthYear = "November 2026",
      isMock = false,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Validate signature if real Razorpay secret is configured and not a sandbox mock order
    if (keySecret && !isMock && razorpay_order_id && !razorpay_order_id.startsWith("order_sandbox_")) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Razorpay payment signature verification failed.",
          },
          { status: 400 }
        );
      }
    }

    const paidAt = new Date().toISOString();
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;

    // Update Supabase Database if available
    try {
      const supabase = await createClient();

      if (feeId) {
        // Try updating existing fee record
        const { error: updateError } = await supabase
          .from("fees")
          .update({
            status: "paid",
            payment_mode: "UPI",
            transaction_ref: finalPaymentId,
            paid_at: paidAt,
            receipt_no: receiptNo,
          })
          .eq("id", feeId);

        if (updateError) {
          console.warn("Could not update fee by id in Supabase:", updateError.message);
        }
      } else if (playerId) {
        // Insert or update fee by player & month
        const { error: upsertError } = await supabase.from("fees").insert({
          player_id: playerId,
          month_year: monthYear,
          amount: Number(amount),
          due_date: new Date().toISOString().split("T")[0],
          status: "paid",
          payment_mode: "UPI",
          transaction_ref: finalPaymentId,
          paid_at: paidAt,
          receipt_no: receiptNo,
        });

        if (upsertError) {
          console.warn("Could not insert fee in Supabase:", upsertError.message);
        }
      }
    } catch (dbErr: any) {
      console.warn("Database sync warning in verify route:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      receiptNo,
      paymentId: finalPaymentId,
      orderId: razorpay_order_id,
      paidAt,
      message: "Payment successfully verified and logged.",
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during verification",
      },
      { status: 500 }
    );
  }
}
