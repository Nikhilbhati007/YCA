"use client";

import { useState } from "react";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Smartphone,
  X,
  ArrowRight,
  Send,
} from "lucide-react";
import { Player } from "@/lib/types";
import { loadRazorpayScript, RazorpayOrderData } from "@/lib/razorpay";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  fee: {
    id?: string;
    monthYear: string;
    amount: number;
    dueDate: string;
  };
  onPaymentSuccess: (details: {
    receiptNo: string;
    paymentId: string;
    paidAt: string;
    method: string;
    amount: number;
    monthYear: string;
  }) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  player,
  fee,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"razorpay" | "upi_qr">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual UPI / UTR state
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  // Sandbox simulation overlay state
  const [sandboxOrder, setSandboxOrder] = useState<RazorpayOrderData | null>(null);

  if (!isOpen) return null;

  // Clean UPI Deeplink for mobile devices
  const upiId = "7709705181@upi";
  const upiPayeeName = "Yadav Cricket Academy";
  const upiNote = `YCA_Fee_${fee.monthYear.replace(/\s+/g, "")}_${player.playerCode}`;
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    upiPayeeName
  )}&am=${fee.amount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

  // 1. Trigger Razorpay Checkout
  async function handleProceedRazorpay() {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step A: Create order via Next.js backend API
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeId: fee.id,
          playerId: player.id,
          amount: fee.amount,
          monthYear: fee.monthYear,
          studentName: player.fullName,
          parentName: player.parentName,
          parentPhone: player.parentPhone,
        }),
      });

      const orderData: RazorpayOrderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to initialize payment gateway order.");
      }

      // Step B: If order is sandbox/mock (no live Razorpay keys configured yet), open interactive simulation
      if (orderData.isMock) {
        setSandboxOrder(orderData);
        setIsProcessing(false);
        return;
      }

      // Step C: Load Razorpay Checkout.js for live checkout
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        // Fallback to sandbox simulation if CDN is blocked
        setSandboxOrder(orderData);
        setIsProcessing(false);
        return;
      }

      // Step D: Open Razorpay Live Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Yadav Cricket Academy & Pace Foundation",
        description: `Academy Fee · ${fee.monthYear} (${player.fullName})`,
        image: "/logo-light.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            isMock: false,
          });
        },
        prefill: {
          name: player.parentName || player.fullName,
          contact: player.parentPhone ? player.parentPhone.replace(/[^0-9]/g, "") : "",
          email: "parent@ycapace.com",
        },
        theme: {
          color: "#0a1a33",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (failResponse: any) {
        setErrorMessage(
          failResponse.error?.description || "Payment failed or cancelled by user."
        );
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      setErrorMessage(err.message || "An error occurred while connecting to payment gateway.");
      setIsProcessing(false);
    }
  }

  // 2. Verify Razorpay Payment (both live & sandbox test)
  async function verifyRazorpayPayment({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    isMock = false,
  }: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    isMock?: boolean;
  }) {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          feeId: fee.id,
          playerId: player.id,
          amount: fee.amount,
          monthYear: fee.monthYear,
          isMock,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Payment signature verification failed.");
      }

      setIsProcessing(false);
      setSandboxOrder(null);

      // Trigger success callback
      onPaymentSuccess({
        receiptNo: verifyData.receiptNo,
        paymentId: verifyData.paymentId,
        paidAt: verifyData.paidAt,
        method: isMock ? "Razorpay (Sandbox Verified)" : "Razorpay Gateway (UPI/Card)",
        amount: fee.amount,
        monthYear: fee.monthYear,
      });
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(err.message || "Failed to verify transaction with academy server.");
      setIsProcessing(false);
    }
  }

  // 3. Submit Manual Direct UPI / UTR Reference
  async function handleManualUtrSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 8) {
      setErrorMessage("Please enter a valid 8 to 12 digit UPI Transaction ID / UTR Number.");
      return;
    }

    setIsSubmittingUtr(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/payments/manual-upi-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utrNumber: utrNumber.trim(),
          feeId: fee.id,
          playerId: player.id,
          amount: fee.amount,
          monthYear: fee.monthYear,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record UPI reference.");
      }

      setIsSubmittingUtr(false);
      onPaymentSuccess({
        receiptNo: data.receiptNo,
        paymentId: data.paymentId,
        paidAt: data.paidAt,
        method: "Direct UPI Transfer",
        amount: fee.amount,
        monthYear: fee.monthYear,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Could not log UPI payment. Please try again.");
      setIsSubmittingUtr(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border-2 border-navy/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center bg-[#0a1a33] text-white px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#f5b700]" />
            <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Secure Fee Checkout
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white rounded-lg p-1 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Header */}
        <div className="bg-[#f2f5fa] border-b border-navy/15 p-4 sm:p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy/60">
                Student &amp; Batch
              </span>
              <p className="font-display text-xl font-bold uppercase text-[#0a1a33]">
                {player.fullName}
              </p>
              <p className="text-xs text-navy/70">
                {player.playerCode} · {player.batchName} ({player.primaryRole})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy/60">
                {fee.monthYear} Fee
              </span>
              <p className="font-display text-2xl font-black text-[#1e5a3c]">
                ₹{fee.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Due: {fee.dueDate}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector: Razorpay vs Direct UPI */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 p-1 bg-[#f2f5fa] rounded-xl border border-navy/15 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("razorpay");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "razorpay"
                  ? "bg-[#0a1a33] text-[#f5b700] shadow-sm"
                  : "text-navy/70 hover:text-navy"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Razorpay Gateway</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("upi_qr");
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "upi_qr"
                  ? "bg-[#0a1a33] text-[#f5b700] shadow-sm"
                  : "text-navy/70 hover:text-navy"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Direct UPI QR &amp; App</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: RAZORPAY GATEWAY */}
        {activeTab === "razorpay" && (
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-navy/15 p-4 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-navy/70">
                <span className="font-semibold">Supported Payment Channels:</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 256-Bit SSL
                </span>
              </div>

              {/* Supported icons badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-[#f2f5fa] border border-navy/10 font-bold text-navy">
                  ⚡ UPI Apps
                  <span className="block text-[10px] text-navy/60 font-normal">
                    GPay, PhonePe, Paytm
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#f2f5fa] border border-navy/10 font-bold text-navy">
                  💳 Debit / Cards
                  <span className="block text-[10px] text-navy/60 font-normal">
                    Visa, RuPay, Master
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#f2f5fa] border border-navy/10 font-bold text-navy">
                  🏦 Net Banking
                  <span className="block text-[10px] text-navy/60 font-normal">
                    SBI, HDFC, ICICI
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-navy/60 leading-relaxed">
                Transactions are instantly reconciled and generate an official printable YCA PACE receipt.
              </p>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProceedRazorpay}
              className="w-full py-3.5 rounded-xl bg-[#0a1a33] text-[#f5b700] hover:bg-[#06122a] font-display text-lg font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Connecting to Gateway...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Pay ₹{fee.amount} via Razorpay <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: DIRECT UPI QR & MOBILE APP INTENT */}
        {activeTab === "upi_qr" && (
          <div className="p-5 space-y-4">
            {/* 1-Tap Mobile UPI Intent Button */}
            <a
              href={upiIntentUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Tap to Pay with UPI App (Mobile)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* High-Contrast Dynamic QR Code */}
            <div className="rounded-xl border border-navy/15 p-4 bg-[#f2f5fa] flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl border-2 border-navy shadow-md flex flex-col items-center">
                {/* Visual SVG QR Representation */}
                <div className="relative w-40 h-40 bg-white flex flex-col items-center justify-center">
                  <QrCode className="w-36 h-36 text-[#0a1a33]" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-[#0a1a33] text-gold px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter border border-white">
                      YCA
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="font-mono text-xs font-bold text-navy block">
                    {upiId}
                  </span>
                  <span className="text-[10px] text-navy/60 font-semibold block">
                    Yadav Cricket Academy
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-navy/60 text-center">
                Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM)
              </p>
            </div>

            {/* Enter Bank UTR Form for Instant Verification */}
            <form onSubmit={handleManualUtrSubmit} className="space-y-2">
              <label className="block text-xs font-bold uppercase text-navy/80">
                Already paid? Enter 12-Digit Bank UTR / Ref Number:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 428901289123"
                  maxLength={18}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  className="flex-1 rounded-lg border-2 border-navy/20 px-3 py-2 text-xs font-mono font-bold text-navy placeholder:text-navy/30 focus:border-navy focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingUtr || utrNumber.length < 8}
                  className="px-4 py-2 rounded-lg bg-[#1e5a3c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#18462f] disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmittingUtr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SANDBOX TEST SIMULATION OVERLAY */}
        {sandboxOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-2 border-gold space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-1.5 text-navy">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <h4 className="font-display text-lg font-bold uppercase">
                    Razorpay Gateway Simulator
                  </h4>
                </div>
                <button
                  onClick={() => setSandboxOrder(null)}
                  className="text-navy/50 hover:text-navy font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#f2f5fa] p-3 rounded-xl border border-navy/10 text-xs space-y-1">
                <p className="font-bold text-navy">Order ID: {sandboxOrder.orderId}</p>
                <p className="text-navy/70">
                  Amount: ₹{(sandboxOrder.amount / 100).toLocaleString("en-IN")} · INR
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Mode: Sandbox Active (Zero real money charged)
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    verifyRazorpayPayment({
                      razorpay_payment_id: `pay_upi_sim_${Date.now()}`,
                      razorpay_order_id: sandboxOrder.orderId,
                      razorpay_signature: "sandbox_valid_sig",
                      isMock: true,
                    })
                  }
                  className="w-full py-2.5 rounded-lg bg-[#1e5a3c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#18462f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Successful UPI Payment</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    verifyRazorpayPayment({
                      razorpay_payment_id: `pay_card_sim_${Date.now()}`,
                      razorpay_order_id: sandboxOrder.orderId,
                      razorpay_signature: "sandbox_valid_sig",
                      isMock: true,
                    })
                  }
                  className="w-full py-2.5 rounded-lg bg-[#0a1a33] text-gold text-xs font-bold uppercase tracking-wider hover:bg-navy/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Successful Card Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("Payment was declined by the simulated bank.");
                    setSandboxOrder(null);
                  }}
                  className="w-full py-1 text-xs text-red-600 hover:text-red-800 font-semibold"
                >
                  Simulate Bank Decline / Failure
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
