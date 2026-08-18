import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tomo School — Student Context Engine',
  description: 'Every classroom generated from what the system already knows about that student.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-30 border-b border-paper-rule bg-paper/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-6">
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="text-[15px] font-semibold tracking-tight text-ink">Tomo School</span>
              <span className="hidden text-[12.5px] text-ink-mute sm:inline">Student Context Engine</span>
            </Link>

            <nav className="ml-auto flex items-center gap-1 text-[13px]">
              <NavLink href="/">Students</NavLink>
              <NavLink href="/compare">Compare</NavLink>
              <NavLink href="/debug">Debug</NavLink>
            </nav>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-[1180px] px-6 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-[1180px] px-6 pb-10 pt-4">
          <p className="text-[11.5px] leading-relaxed text-ink-mute">
            Curriculum content extracted from <em>Learning Elementary Physics, Class 7</em> (ICSE), Chapter 2 —
            Force and Pressure : Motion, pp. 29–42. Generated tutor content is illustrative and pending human
            approval; it is not approved teaching material.
          </p>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-paper-card hover:text-ink"
    >
      {children}
    </Link>
  );
}
