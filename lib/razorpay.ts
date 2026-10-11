/**
 * Razorpay Payment Gateway Client Utilities
 * Handles dynamic script loading, checkout initialization, and type definitions
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOrderData {
  success: boolean;
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  isMock?: boolean;
  studentName?: string;
  monthYear?: string;
  message?: string;
}

export interface RazorpayVerificationResult {
  success: boolean;
  receiptNo: string;
  paymentId: string;
  orderId?: string;
  paidAt: string;
  message?: string;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay checkout.js script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
