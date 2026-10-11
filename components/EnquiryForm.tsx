"use client";

import { useState } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const WHATSAPP = "917709705181";
const BATCHES = ["U14", "U16", "U19", "U23", "Open", "Not sure yet"];

const field =
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy focus:border-navy focus:outline-none";

export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [batch, setBatch] = useState(BATCHES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.from("enquiries").insert({
          player_name: name,
          contact_phone: phone || WHATSAPP,
          age: parseInt(age, 10) || 12,
          preferred_batch: batch,
          status: "new",
          notes: "Captured via website trial booking form.",
        });
      }
    } catch (err) {
      console.warn("Could not record enquiry to Supabase:", err);
    } finally {
      setIsSubmitting(false);
      const text = `Hello Jay Sir, I want to book a cricket trial session at YCA PACE Nagpur.\nPlayer name: ${name}\nAge: ${age}\nPhone: ${phone}\nBatch: ${batch}`;
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  return (
    <form onSubmit={send} className="rounded-lg bg-white p-6 text-navy shadow-xl">
      <label className="block font-semibold">
        Player name *
        <input
          required
          placeholder="e.g. Atharva Joshi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
      </label>

      <label className="mt-4 block font-semibold">
        WhatsApp / Contact Phone *
        <input
          required
          type="tel"
          placeholder="e.g. +91 98220 12345"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={field}
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block font-semibold">
          Player age *
          <input
            required
            inputMode="numeric"
            placeholder="e.g. 13"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={field}
          />
        </label>
        <label className="block font-semibold">
          Batch
          <select value={batch} onChange={(e) => setBatch(e.target.value)} className={field}>
            {BATCHES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-md bg-gold px-5 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95 disabled:opacity-50 transition-all shadow-sm"
      >
        {isSubmitting ? "Saving & Opening WhatsApp..." : "Book Trial via WhatsApp"}
      </button>

      <p className="mt-3 text-xs text-navy/70 leading-relaxed">
        Your enquiry is saved in the academy records and opens WhatsApp with Head Coach Jay Singh Yadav directly.
      </p>
    </form>
  );
}
