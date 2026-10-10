import DashboardShell from "@/components/DashboardShell";

const CHILD = { name: "Aarav Sharma", batch: "U14", session: "Morning", id: "YCA-0042" };
const ATTENDANCE = "PPPPAPPPPPPAPPPPPPPPPP"; // P = present, A = absent
const MATCHES = [
  { date: "04 Oct", level: "Academy", vs: "Hingna Colts", bat: "34 (28)", bowl: "2/21" },
  { date: "27 Sep", level: "Inter-academy", vs: "Nagpur Strikers", bat: "12 (15)", bowl: "1/30" },
  { date: "13 Sep", level: "Academy", vs: "Practice match", bat: "51 (40)", bowl: "0/18" },
];
const NOTICES = [
  { title: "Diwali break", text: "No sessions from 20 to 23 October." },
  { title: "Match day", text: "U14 reports at 6:30 AM on Sunday." },
];

const card = "rounded-lg border-2 border-navy bg-white p-5";
const label = "font-display text-lg font-semibold uppercase tracking-wide text-navy/60";

export default function ParentDashboard() {
  const present = [...ATTENDANCE].filter((c) => c === "P").length;
  const pct = Math.round((present / ATTENDANCE.length) * 100);

  return (
    <DashboardShell role="Parent">
      <h1 className="font-display text-5xl font-bold uppercase leading-none">{CHILD.name}</h1>
      <p className="mt-2 text-navy/70">
        {CHILD.batch} batch · {CHILD.session} · Player ID {CHILD.id}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className={card}>
          <h2 className={label}>Attendance</h2>
          <p className="mt-1 font-display text-6xl font-extrabold">{pct}%</p>
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Sessions this month">
            {[...ATTENDANCE].map((c, i) => (
              <span
                key={i}
                title={c === "P" ? "Present" : "Absent"}
                className={`h-5 w-5 rounded-sm ${c === "P" ? "bg-turf" : "bg-ball"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-navy/60">Green present, red absent. Last {ATTENDANCE.length} sessions.</p>
        </section>

        <section className={card}>
          <h2 className={label}>Fees</h2>
          <p className="mt-1 font-display text-4xl font-extrabold text-turf">October: Paid</p>
          <p className="mt-1 text-navy/70">Paid by UPI</p>
          <p className="mt-4 font-display text-2xl font-bold">November: Due 5 Nov</p>
        </section>

        <section className={card}>
          <h2 className={label}>Coach remark</h2>
          <p className="mt-2 text-lg">
            Good rhythm in the run-up. Keep working on landing the ball on a good length.
          </p>
          <p className="mt-3 text-sm text-navy/60">Updated 4 Oct</p>
        </section>
      </div>

      <section className={`${card} mt-4`}>
        <h2 className={label}>Recent matches</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead className="border-b-2 border-navy text-sm uppercase text-navy/60">
              <tr>
                <th className="py-2">Date</th>
                <th>Level</th>
                <th>Against</th>
                <th>Batting</th>
                <th>Bowling</th>
              </tr>
            </thead>
            <tbody>
              {MATCHES.map((m) => (
                <tr key={m.date} className="border-b border-navy/10">
                  <td className="py-3">{m.date}</td>
                  <td>{m.level}</td>
                  <td>{m.vs}</td>
                  <td className="font-semibold">{m.bat}</td>
                  <td className="font-semibold">{m.bowl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${card} mt-4`}>
        <h2 className={label}>Announcements</h2>
        <ul className="mt-3 space-y-3">
          {NOTICES.map((n) => (
            <li key={n.title}>
              <p className="font-semibold">{n.title}</p>
              <p className="text-navy/75">{n.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
