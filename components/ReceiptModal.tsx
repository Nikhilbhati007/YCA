"use client";

import { Printer, Download, CheckCircle2, ShieldCheck, X, Database } from "lucide-react";
import { Player } from "@/lib/types";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    receiptNo: string;
    studentName: string;
    playerCode: string;
    batchName: string;
    monthYear: string;
    amount: number;
    paymentMode: string;
    transactionRef: string;
    paidAt: string;
  };
}

export default function ReceiptModal({
  isOpen,
  onClose,
  receiptData,
}: ReceiptModalProps) {
  if (!isOpen) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border-2 border-navy/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center bg-[#0a1a33] text-white px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display text-lg font-bold uppercase tracking-wider text-gold">
              Official Fee Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white rounded-lg p-1 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0">
          {/* Academy Letterhead */}
          <div className="text-center border-b-2 border-navy/15 pb-5">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1e5a3c]/10 text-[#1e5a3c] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified YCA Pace Transaction
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <Database className="w-3 h-3 text-emerald-600" /> Synced to Supabase Cloud
              </div>
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-[#0a1a33] tracking-wide">
              Yadav Cricket Academy
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[#f5b700] bg-navy px-3 py-0.5 rounded inline-block mt-1">
              Pace Foundation · Nagpur
            </p>
            <p className="text-xs text-navy/70 mt-1">
              Mahajanwadi, Hingna Road, Nagpur, Maharashtra · Ph: +91 77097 05181
            </p>
          </div>

          {/* Receipt Meta Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#f2f5fa] p-4 rounded-xl border border-navy/15">
            <div>
              <span className="text-navy/60 block font-semibold uppercase text-[10px]">
                Receipt Number
              </span>
              <span className="font-mono font-bold text-navy text-sm">
                {receiptData.receiptNo}
              </span>
            </div>
            <div className="text-right">
              <span className="text-navy/60 block font-semibold uppercase text-[10px]">
                Payment Date &amp; Time
              </span>
              <span className="font-mono font-semibold text-navy">
                {new Date(receiptData.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-navy/60 block font-semibold uppercase text-[10px]">
                Payment Mode
              </span>
              <span className="font-bold text-[#1e5a3c] inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {receiptData.paymentMode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-navy/60 block font-semibold uppercase text-[10px]">
                Gateway Ref / UTR
              </span>
              <span className="font-mono text-[11px] font-bold text-navy truncate block max-w-[170px] ml-auto">
                {receiptData.transactionRef}
              </span>
            </div>
          </div>

          {/* Student Breakdown Table */}
          <div className="rounded-xl border border-navy/15 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0a1a33] text-white text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Student &amp; Batch Description</th>
                  <th className="py-2.5 px-4 text-right">Fee Period</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10 text-navy bg-white">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-sm text-[#0a1a33]">
                      {receiptData.studentName}
                    </p>
                    <p className="text-[11px] text-navy/60">
                      ID: {receiptData.playerCode} · Batch: {receiptData.batchName}
                    </p>
                    <p className="text-[10px] text-navy/50 mt-0.5">
                      Ground &amp; Turf Pitch Training, Video Biomechanics
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {receiptData.monthYear}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                    ₹{receiptData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-[#f2f5fa] border-t-2 border-navy/20 font-bold text-navy">
                <tr>
                  <td colSpan={2} className="py-3 px-4 uppercase text-xs">
                    Total Amount Paid
                  </td>
                  <td className="py-3 px-4 text-right font-display text-xl text-[#1e5a3c]">
                    ₹{receiptData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Authorization Stamp */}
          <div className="flex items-center justify-between pt-3 border-t border-navy/15 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-navy/50 uppercase block">
                Status
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> PAID IN FULL
              </span>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-[#0a1a33] text-sm tracking-wide">
                Jay Singh Yadav
              </div>
              <p className="text-[10px] font-bold uppercase text-navy/60">
                Head Coach &amp; Academy Director
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-[#f2f5fa] border-t border-navy/15 px-6 py-4 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-navy/20 text-xs font-bold uppercase text-navy hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-[#0a1a33] text-gold font-display text-sm font-bold uppercase tracking-wider hover:bg-navy/90 flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gold" />
            <span>Print / Save PDF Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
