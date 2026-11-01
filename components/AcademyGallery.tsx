"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Sparkles, X, ChevronRight, Trophy, Zap, ShieldCheck, Award } from "lucide-react";

interface PhotoItem {
  id: string;
  src: string;
  title: string;
  category: "all" | "pace" | "facilities" | "batches" | "tournaments";
  categoryLabel: string;
  tag: string;
  description: string;
}

const GALLERY_ITEMS: PhotoItem[] = [
  {
    id: "bowling",
    src: "/gallery/bowling.jpg",
    title: "1-on-1 Fast Bowling Biomechanics",
    category: "pace",
    categoryLabel: "Pace Foundation",
    tag: "Release Point & Wrist Cocking",
    description: "Coach Jay Singh guiding a young fast bowler on upright wrist alignment and 11 o'clock release point at the training wickets.",
  },
  {
    id: "turf-nets",
    src: "/gallery/turf-nets.jpg",
    title: "Nets & Practice Lanes",
    category: "facilities",
    categoryLabel: "Facilities",
    tag: "3 Turf + 4 Cemented Nets",
    description: "Multi-lane cricket nets with safety enclosure, target cones, and dedicated batting and bowling practice zones.",
  },
  {
    id: "floodlights",
    src: "/gallery/floodlights.jpg",
    title: "Night Sessions Under Lights",
    category: "facilities",
    categoryLabel: "Night Training",
    tag: "Floodlights · 7:00 – 9:30 PM",
    description: "Night training sessions under high-mast LED floodlights, bringing together players, parents, and coaching staff.",
  },
  {
    id: "fitness-stretching",
    src: "/gallery/fitness-stretching.jpg",
    title: "Fitness, Conditioning & Yoga",
    category: "facilities",
    categoryLabel: "Fitness & Yoga",
    tag: "Agility · Core · Flexibility",
    description: "Comprehensive squad stretching and conditioning under the covered sports arena beneath the academy motto mural.",
  },
  {
    id: "squad",
    src: "/gallery/squad.jpg",
    title: "Cadet & Junior Squads (Girls & Boys)",
    category: "batches",
    categoryLabel: "Batches",
    tag: "U14 & Junior Co-Ed Training",
    description: "Young boys and girls lined up in matching YCA blue jerseys with head coach in center on the outfield.",
  },
  {
    id: "u19-squad",
    src: "/gallery/u19-squad.jpg",
    title: "U19 Match Day Squad in Whites",
    category: "batches",
    categoryLabel: "Batches",
    tag: "Official Match Whites",
    description: "Senior and U19 squad assembled on the Hingna ground ready for 40-over weekend district fixtures.",
  },
  {
    id: "match",
    src: "/gallery/match.jpg",
    title: "Championship Trophy & Medals",
    category: "tournaments",
    categoryLabel: "Achievements",
    tag: "Tournament Winners",
    description: "Academy players and Coach Jay Singh receiving the championship trophy and medals at the tournament ceremony.",
  },
  {
    id: "hero",
    src: "/gallery/hero.jpg",
    title: "Match Walk-Out & Field Leadership",
    category: "batches",
    categoryLabel: "Batches",
    tag: "Coach Jay Singh Leading Squad",
    description: "Coach Jay Singh Yadav in YCA colors walking onto the ground leading the team with discipline and focus.",
  },
  {
    id: "man-of-the-match",
    src: "/gallery/man-of-the-match.jpg",
    title: "Player of the Match Honors",
    category: "tournaments",
    categoryLabel: "Achievements",
    tag: "Individual Excellence",
    description: "Coach Jay Singh awarding the Player of the Match trophy celebrating exceptional match-winning performances.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Photos" },
  { id: "pace", label: "Pace Foundation" },
  { id: "facilities", label: "Ground & Nets" },
  { id: "batches", label: "Squads & Batches" },
  { id: "tournaments", label: "Trophies & Matches" },
];

export default function AcademyGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);

  const filteredItems = selectedCategory === "all"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <section id="gallery" className="bg-[#0b1b36] py-20 text-white">
      <div className="mx-auto w-full max-w-6xl px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-bold tracking-widest uppercase text-gold">
              <Camera className="w-3.5 h-3.5" /> Academy Life & Real Facilities
            </div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold uppercase leading-none tracking-tight">
              Ground, Nets &amp; Match Action
            </h2>
            <p className="mt-3 max-w-xl text-base text-white/70">
              Real action at Yadav Cricket Academy &amp; Pace Foundation on Hingna Road, Nagpur — turf nets, floodlight night practice, biomechanics training, and tournament victories.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  selectedCategory === cat.id
                    ? "bg-gold text-navy shadow-md"
                    : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-navy/80 shadow-lg transition-all duration-300 hover:border-gold hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Photo Container */}
              <div className="relative h-64 w-full overflow-hidden bg-[#0d1f3d]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-gold border border-gold/30">
                    {item.tag}
                  </span>
                </div>

                {/* Bottom title inside photo */}
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                    {item.categoryLabel}
                  </span>
                  <h4 className="font-display text-xl font-bold uppercase text-white leading-tight mt-0.5">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 bg-navy/90">
                <p className="text-xs leading-relaxed text-white/70 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-gold group-hover:underline">
                  <span>View Full Photo</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-navy rounded-2xl overflow-hidden border border-gold/30 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#06122a]">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  {activePhoto.categoryLabel} · {activePhoto.tag}
                </span>
                <h3 className="font-display text-2xl font-bold uppercase text-white">
                  {activePhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-navy transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative w-full h-[60vh] bg-black">
              <Image
                src={activePhoto.src}
                alt={activePhoto.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>

            {/* Modal Description */}
            <div className="p-5 bg-navy border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-white/80 max-w-2xl">
                {activePhoto.description}
              </p>
              <a
                href="#enquiry"
                onClick={() => setActivePhoto(null)}
                className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-2 font-display text-sm font-bold uppercase tracking-wide text-navy hover:brightness-95 shrink-0"
              >
                Join This Batch
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
