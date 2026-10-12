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
      const isUuid = (str?: string) =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      let targetPlayerId: string | null = isUuid(playerId) ? playerId : null;

      if (!targetPlayerId) {
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
        const { data: existingFee } = await supabase
          .from("fees")
          .select("id")
          .eq("player_id", targetPlayerId)
          .eq("month_year", monthYear)
          .limit(1)
          .maybeSingle();

        if (existingFee?.id) {
          await supabase
            .from("fees")
            .update({
              status: "paid",
              payment_mode: "UPI",
              transaction_ref: transactionRef,
              paid_at: paidAt,
              receipt_no: receiptNo,
            })
            .eq("id", existingFee.id);
        } else {
          await supabase.from("fees").insert({
            player_id: targetPlayerId,
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
