"use client";

import { useState } from "react";

const WHATSAPP = "917709705181";
const BATCHES = ["U14", "U16", "U19", "U23", "Open", "Not sure yet"];

const field =
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy focus:border-navy";

export default function EnquiryForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [batch, setBatch] = useState(BATCHES[0]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hello, I want to book a trial at YCA PACE.\nPlayer name: ${name}\nAge: ${age}\nBatch: ${batch}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <form onSubmit={send} className="rounded-lg bg-white p-6 text-navy shadow-xl">
      <label className="block font-semibold">
        Player name
        <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </label>
      <label className="mt-4 block font-semibold">
        Player age
        <input
          required
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={field}
        />
      </label>
      <label className="mt-4 block font-semibold">
        Batch
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className={field}>
          {BATCHES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-gold px-5 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95"
      >
        Send on WhatsApp
      </button>
      <p className="mt-3 text-sm text-navy/70">
        This opens WhatsApp with your details filled in. The academy replies to you there.
      </p>
    </form>
  );
}
