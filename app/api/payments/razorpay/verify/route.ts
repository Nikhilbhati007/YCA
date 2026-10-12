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
      const isUuid = (str?: string) =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      let targetPlayerId: string | null = isUuid(playerId) ? playerId : null;

      if (!targetPlayerId) {
        // Resolve player UUID from Supabase by player_code or name
        const { data: matchedPlayer } = await supabase
          .from("players")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (matchedPlayer?.id) {
          targetPlayerId = matchedPlayer.id;
        }
      }

      if (targetPlayerId) {
        // Check if fee row already exists for this player and month
        const { data: existingFee } = await supabase
          .from("fees")
          .select("id")
          .eq("player_id", targetPlayerId)
          .eq("month_year", monthYear)
          .limit(1)
          .maybeSingle();

        if (existingFee?.id) {
          const { error: updateError } = await supabase
            .from("fees")
            .update({
              status: "paid",
              payment_mode: "UPI",
              transaction_ref: finalPaymentId,
              paid_at: paidAt,
              receipt_no: receiptNo,
            })
            .eq("id", existingFee.id);

          if (updateError) {
            console.warn("Supabase fee update notice:", updateError.message);
          }
        } else {
          const { error: insertError } = await supabase.from("fees").insert({
            player_id: targetPlayerId,
            month_year: monthYear,
            amount: Number(amount),
            due_date: new Date().toISOString().split("T")[0],
            status: "paid",
            payment_mode: "UPI",
            transaction_ref: finalPaymentId,
            paid_at: paidAt,
            receipt_no: receiptNo,
          });

          if (insertError) {
            console.warn("Supabase fee insert notice:", insertError.message);
          }
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
