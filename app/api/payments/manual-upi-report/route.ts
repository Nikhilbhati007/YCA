import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      utrNumber,
      feeId,
      playerId,
      amount = 2500,
      monthYear = "November 2026",
    } = body;

    const cleanUtr = String(utrNumber || "").trim().toUpperCase();

    if (!cleanUtr || cleanUtr.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Bank UPI Transaction Reference / UTR Number (minimum 8-12 digits).",
        },
        { status: 400 }
      );
    }

    const paidAt = new Date().toISOString();
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionRef = `UTR-${cleanUtr}`;

    // Update Supabase if available
    try {
      const supabase = await createClient();

      if (feeId) {
        await supabase
          .from("fees")
          .update({
            status: "paid",
            payment_mode: "UPI",
            transaction_ref: transactionRef,
            paid_at: paidAt,
            receipt_no: receiptNo,
          })
          .eq("id", feeId);
      } else if (playerId) {
        await supabase.from("fees").insert({
          player_id: playerId,
          month_year: monthYear,
          amount: Number(amount),
          due_date: new Date().toISOString().split("T")[0],
          status: "paid",
          payment_mode: "UPI",
          transaction_ref: transactionRef,
          paid_at: paidAt,
          receipt_no: receiptNo,
        });
      }
    } catch (dbErr: any) {
      console.warn("Database sync warning in manual UPI route:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      receiptNo,
      paymentId: transactionRef,
      paidAt,
      message: "UPI transaction reference recorded successfully.",
    });
  } catch (error: any) {
    console.error("Error recording manual UPI payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to record UPI payment.",
      },
      { status: 500 }
    );
  }
}
