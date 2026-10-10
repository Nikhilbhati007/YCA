import Image from "next/image";
import Link from "next/link";

export default function DashboardShell({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-light.png" alt="" width={36} height={40} className="h-auto w-9" />
            <span className="font-display text-xl font-bold tracking-wide">
              YCA PACE <span className="text-gold">· {role}</span>
            </span>
          </Link>
          <Link href="/login" className="rounded-md border border-white/40 px-3 py-1.5 text-sm hover:border-white">
            Log out
          </Link>
        </div>
      </header>
      <div className="bg-gold/25 px-5 py-1.5 text-center text-sm font-semibold">
        Preview with sample data. Names and numbers are not real.
      </div>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
