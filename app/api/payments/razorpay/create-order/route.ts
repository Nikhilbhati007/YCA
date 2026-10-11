import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      feeId,
      playerId,
      amount = 2500, // INR
      monthYear = "November 2026",
      studentName = "Player",
      parentEmail = "parent@gmail.com",
      parentPhone = "7709705181",
    } = body;

    const amountInPaise = Math.round(Number(amount) * 100);

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // If real Razorpay keys are configured, create real order via Razorpay API
    if (keyId && keySecret && !keyId.includes("placeholder") && !keyId.includes("your-key")) {
      const authHeader =
        "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcp_yca_${Date.now()}`,
          notes: {
            academy: "YCA Pace Foundation Nagpur",
            feeId: feeId || "",
            playerId: playerId || "",
            monthYear,
            studentName,
            parentEmail,
            parentPhone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Razorpay order creation failed:", errorData);
        return NextResponse.json(
          {
            success: false,
            message:
              errorData?.error?.description || "Failed to create Razorpay order.",
          },
          { status: 500 }
        );
      }

      const orderData = await response.json();
      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
        studentName,
        monthYear,
        isMock: false,
      });
    }

    // Fallback: Sandbox / Dev Test Mode Order (Works immediately without keys)
    const mockOrderId = `order_sandbox_${Date.now().toString(36)}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_ycapace_sandbox",
      studentName,
      monthYear,
      isMock: true,
      message:
        "Sandbox mode active. To switch to live Razorpay, set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local",
    });
  } catch (error: any) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error creating order",
      },
      { status: 500 }
    );
  }
}
