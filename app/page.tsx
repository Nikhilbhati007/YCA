import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";

// Confirm these with the client; banners show different timings and numbers.
const PHONE = "+91 77097 05181";
const TEL = "+917709705181";
const ADDRESS = "Mahajanwadi, behind Dahi Handi Ground (Bhagiratha Park), Hingna Road, Nagpur";
const SESSIONS = [
  { label: "Morning", time: "6:30 – 9:30 AM" },
  { label: "Evening", time: "4:30 – 7:00 PM" },
  { label: "Under lights", time: "Night sessions" },
];
const BATCHES = ["U14", "U16", "U19", "U23", "Open"];
const OFFER = [
  "Turf and cemented pitches",
  "Night sessions under lights",
  "Skill analysis on video",
  "One-on-one coaching",
  "Weight loss and weight gain training",
  "Nutrition sessions",
  "Yoga and meditation",
  "Summer camp for girls and boys",
];

const wrap = "mx-auto w-full max-w-6xl px-5";
const heading = "font-display text-5xl font-bold uppercase leading-none sm:text-6xl";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 bg-navy/95 text-white backdrop-blur">
        <div className={`${wrap} flex items-center justify-between py-3`}>
          <a href="#top" className="flex items-center gap-3">
            <Image src="/logo-light.png" alt="" width={40} height={44} className="h-auto w-10" />
            <span className="font-display text-2xl font-bold tracking-wide">YCA PACE</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#batches" className="hover:text-gold">Batches</a>
            <a href="#pace" className="hover:text-gold">Pace Foundation</a>
            <a href="#facilities" className="hover:text-gold">Facilities</a>
            <a href="#enquiry" className="hover:text-gold">Contact</a>
          </nav>
          <a
            href="/login"
            className="rounded-md border-2 border-gold px-4 py-1.5 font-semibold text-gold hover:bg-gold hover:text-navy"
          >
            Login
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="stripes relative overflow-hidden bg-navy text-white">
          <div className={`${wrap} grid items-center gap-12 py-16 lg:grid-cols-[1.25fr_1fr] lg:py-24`}>
            <div>
              <h1 className="font-display text-[clamp(4rem,12vw,9rem)] font-extrabold uppercase leading-[0.86]">
                Train.<br />Perform.<br />Progress.
              </h1>
              <p className="mt-7 max-w-md text-lg text-white/80">
                Cricket coaching for girls and boys from age 4, on Hingna Road, Nagpur.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#enquiry"
                  className="rounded-md bg-gold px-6 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95"
                >
                  Book a trial
                </a>
                <a
                  href={`tel:${TEL}`}
                  className="rounded-md border-2 border-white/40 px-6 py-3 font-display text-xl font-bold uppercase tracking-wide hover:border-white"
                >
                  Call {PHONE}
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-black/30 p-6">
              <div className="flex items-center gap-4 border-b border-white/15 pb-5">
                <Image src="/logo-light.png" alt="Yadav Cricket Academy and Pace Foundation logo" width={72} height={79} className="h-auto w-[72px]" />
                <p className="font-display text-xl font-semibold uppercase leading-tight">
                  Yadav Cricket Academy<br />&amp; Pace Foundation
                </p>
              </div>
              <ul>
                {SESSIONS.map((s, i) => (
                  <li
                    key={s.label}
                    style={{ "--i": i } as React.CSSProperties}
                    className="rise flex items-baseline justify-between gap-4 border-b border-white/10 py-4 last:border-0"
                  >
                    <span className="text-white/70">{s.label}</span>
                    <span className="font-display text-3xl font-bold text-gold">{s.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Batches */}
        <section id="batches" className={`${wrap} py-20`}>
          <h2 className={heading}>A batch for every age</h2>
          <p className="mt-4 max-w-lg text-lg text-navy/75">
            Players train with others their own age, boys and girls together.
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
            {BATCHES.map((b) => (
              <li
                key={b}
                className={`rounded-lg border-2 border-navy px-5 py-8 font-display text-6xl font-extrabold ${
                  b === "Open" ? "bg-gold" : "bg-white"
                }`}
              >
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Pace Foundation */}
        <section id="pace" className="stripes bg-turf text-white">
          <div className={`${wrap} grid items-center gap-12 py-20 md:grid-cols-2`}>
            <div>
              <h2 className={heading}>Pace Foundation</h2>
              <p className="mt-5 max-w-md text-lg text-white/85">
                Fast bowling is built on line and length. Our pace programme works on the run-up, the
                release and where the ball pitches, and every session is reviewed on video so
                feedback is specific.
              </p>
              <p className="mt-4 max-w-md text-white/70">
                Soon, parents will see each bowler&apos;s progress in their own login.
              </p>
            </div>
            <svg viewBox="0 0 260 440" role="img" aria-label="Pitch diagram showing yorker, full, good length and short zones" className="mx-auto w-full max-w-xs">
              <rect x="70" y="20" width="90" height="400" rx="4" fill="#2f7a50" />
              <rect x="70" y="230" width="90" height="70" fill="#F5B700" fillOpacity="0.9" />
              <g stroke="#fff" strokeWidth="2">
                <line x1="55" y1="40" x2="175" y2="40" />
                <line x1="55" y1="400" x2="175" y2="400" />
              </g>
              <g stroke="#fff" strokeWidth="1" strokeOpacity="0.5">
                <line x1="70" y1="360" x2="160" y2="360" />
                <line x1="70" y1="300" x2="160" y2="300" />
                <line x1="70" y1="230" x2="160" y2="230" />
              </g>
              <path d="M115 48 L115 265" stroke="#fff" strokeWidth="2" strokeDasharray="6 6" fill="none" />
              <path d="M115 265 Q125 320 115 385" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="115" cy="265" r="8" fill="#B3202A" stroke="#fff" strokeWidth="2" />
              <g fill="#fff" fontSize="15" fontWeight="600">
                <text x="172" y="385">Yorker</text>
                <text x="172" y="335">Full</text>
                <text x="172" y="270" fill="#F5B700">Good length</text>
                <text x="172" y="140">Short</text>
              </g>
            </svg>
          </div>
        </section>

        {/* Facilities */}
        <section id="facilities" className={`${wrap} py-20`}>
          <h2 className={heading}>What you get</h2>
          <ul className="mt-10 grid gap-x-12 gap-y-4 text-xl sm:grid-cols-2">
            {OFFER.map((o) => (
              <li key={o} className="flex items-center gap-4 border-b border-navy/15 pb-4">
                <span aria-hidden className="h-3 w-3 shrink-0 rotate-45 bg-gold" />
                {o}
              </li>
            ))}
          </ul>
        </section>

        {/* Enquiry */}
        <section id="enquiry" className="bg-navy text-white">
          <div className={`${wrap} grid gap-12 py-20 md:grid-cols-2`}>
            <div>
              <h2 className={heading}>Book a trial session</h2>
              <p className="mt-5 max-w-md text-lg text-white/80">
                Tell us who is playing and which batch fits. Or call and speak to Jay Singh Yadav.
              </p>
              <p className="mt-8 font-display text-4xl font-bold text-gold">
                <a href={`tel:${TEL}`}>{PHONE}</a>
              </p>
              <p className="mt-3 max-w-sm text-white/75">{ADDRESS}</p>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <footer className="bg-[#06122a] text-white/70">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-4 py-8`}>
          <div className="flex items-center gap-3">
            <Image src="/logo-light.png" alt="" width={36} height={40} className="h-auto w-9" />
            <span>Yadav Cricket Academy &amp; Pace Foundation, est. 2024</span>
          </div>
          <a href="/login" className="hover:text-gold">Login</a>
        </div>
      </footer>
    </>
  );
}
