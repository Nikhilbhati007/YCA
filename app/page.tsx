import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";
import AcademyGallery from "@/components/AcademyGallery";

// Confirm these with the client; banners show different timings and numbers.
const PHONE = "+91 77097 05181";
const TEL = "+917709705181";
const ADDRESS = "Mahajanwadi, behind Dahi Handi Ground (Bhagiratha Park), Hingna Road, Nagpur";
const SESSIONS = [
  { label: "Morning", time: "6:30 – 9:30 AM" },
  { label: "Evening", time: "4:30 – 7:00 PM" },
  { label: "Under lights", time: "Night sessions" },
];
const BATCHES = ["U12", "U14", "U16", "U19", "U23", "Open"];
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
            <a href="#gallery" className="hover:text-gold">Gallery</a>
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

            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-md">
              <div className="relative h-48 w-full overflow-hidden sm:h-56">
                <Image
                  src="/gallery/hero.jpg"
                  alt="Coach Jay Singh Yadav leading YCA squad onto the ground"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-gold/90 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy">
                    Hingna Road Ground · Nagpur
                  </span>
                  <span className="text-xs text-white/90 font-semibold">Est. 2024</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 border-b border-white/15 pb-4">
                  <Image src="/logo-light.png" alt="YCA PACE crest" width={60} height={66} className="h-auto w-[60px]" />
                  <div>
                    <p className="font-display text-xl font-bold uppercase leading-tight text-white">
                      Yadav Cricket Academy
                    </p>
                    <p className="text-xs font-semibold tracking-wider text-gold uppercase">
                      &amp; Pace Foundation
                    </p>
                  </div>
                </div>
                <ul className="mt-2 divide-y divide-white/10">
                  {SESSIONS.map((s, i) => (
                    <li
                      key={s.label}
                      style={{ "--i": i } as React.CSSProperties}
                      className="rise flex items-baseline justify-between gap-4 py-3 first:pt-2 last:pb-0"
                    >
                      <span className="text-sm font-medium text-white/80">{s.label}</span>
                      <span className="font-display text-2xl font-bold text-gold">{s.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Batches */}
        <section id="batches" className={`${wrap} py-20`}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className={heading}>A batch for every age</h2>
              <p className="mt-4 max-w-lg text-lg text-navy/75">
                Players train with others their own age, boys and girls together, from foundational co-ed drills to competitive 40-over fixtures.
              </p>
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {BATCHES.map((b) => (
              <li
                key={b}
                className={`rounded-lg border-2 border-navy px-5 py-6 font-display text-5xl font-extrabold transition-all hover:scale-105 ${
                  b === "Open" ? "bg-gold text-navy shadow-md" : "bg-white text-navy"
                }`}
              >
                {b}
              </li>
            ))}
          </ul>

          {/* Real Squad Photos Showcase */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-xl border border-navy/20 bg-white shadow-md">
              <div className="relative h-64 w-full overflow-hidden bg-navy/10">
                <Image
                  src="/gallery/squad.jpg"
                  alt="Cadet and Junior squads training in YCA colors"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                    Ages 4 to 14
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase mt-1">
                    Cadet &amp; Junior Girls &amp; Boys Squads
                  </h3>
                </div>
              </div>
              <p className="p-4 text-sm text-navy/75">
                Technical batting stance, high-elbow grip, run-up acceleration, and fielding agility drilled through interactive games and nets.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-navy/20 bg-white shadow-md">
              <div className="relative h-64 w-full overflow-hidden bg-navy/10">
                <Image
                  src="/gallery/u19-squad.jpg"
                  alt="Senior and U19 match day squad in official whites"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                    U16, U19 &amp; Open
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase mt-1">
                    Competitive Match Day Squad in Whites
                  </h3>
                </div>
              </div>
              <p className="p-4 text-sm text-navy/75">
                40-over weekend tournaments, match simulations under pressure, customized fast bowling spells, and fitness benchmarking.
              </p>
            </div>
          </div>
        </section>

        {/* Pace Foundation */}
        <section id="pace" className="stripes bg-turf text-white py-20">
          <div className={`${wrap}`}>
            <div className="max-w-2xl mb-12">
              <div className="inline-block rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/40 mb-3">
                Vidarbha's Specialized Pace Academy
              </div>
              <h2 className={heading}>Pace Foundation</h2>
              <p className="mt-4 text-lg text-white/90">
                Fast bowling is built on line, length, and pure biomechanics. Head Coach Jay Singh Yadav mentors fast bowlers through frame-by-frame video reviews, radar speed monitoring, and specific technical corrections.
              </p>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Real 1-on-1 Biomechanics Photo */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-navy/60 shadow-2xl">
                <div className="relative h-80 w-full sm:h-96">
                  <Image
                    src="/gallery/bowling.jpg"
                    alt="Coach Jay Singh guiding release point biomechanics at training wickets"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <span className="rounded bg-gold px-2.5 py-1 text-xs font-bold uppercase text-navy">
                      Live Coaching
                    </span>
                    <h3 className="font-display text-2xl font-bold uppercase mt-2">
                      High Arm Release &amp; Seam Presentation
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Coach Jay Singh working on the upright seam angle and consistent 11 o'clock release point at the academy wickets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pitch Target Zones Diagram */}
              <div className="rounded-2xl border border-white/20 bg-black/30 p-8 text-center backdrop-blur-sm">
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-gold mb-2">
                  Target Lengths Mastery
                </h3>
                <p className="text-xs text-white/75 mb-6 max-w-sm mx-auto">
                  Every bowler drills the corridor of uncertainty with radar tracking and video verification.
                </p>
                <svg viewBox="0 0 260 440" role="img" aria-label="Pitch diagram showing yorker, full, good length and short zones" className="mx-auto w-full max-w-xs drop-shadow-lg">
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
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section id="facilities" className={`${wrap} py-20`}>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <h2 className={heading}>What you get</h2>
              <p className="mt-4 text-lg text-navy/75">
                World-class practice infrastructure built for round-the-clock skill acceleration on Hingna Road, Nagpur.
              </p>
              <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 text-base sm:text-lg">
                {OFFER.map((o) => (
                  <li key={o} className="flex items-center gap-3 border-b border-navy/15 pb-3">
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rotate-45 bg-gold" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Net & Fitness Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative h-60 rounded-xl overflow-hidden shadow-lg border border-navy/20">
                <Image
                  src="/gallery/turf-nets.jpg"
                  alt="Cricket practice nets"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase tracking-wider">
                  Turf &amp; Net Practice
                </span>
              </div>

              <div className="relative h-60 rounded-xl overflow-hidden shadow-lg border border-navy/20">
                <Image
                  src="/gallery/fitness-stretching.jpg"
                  alt="Fitness, agility and yoga training"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase tracking-wider">
                  Conditioning &amp; Agility
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <AcademyGallery />

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
