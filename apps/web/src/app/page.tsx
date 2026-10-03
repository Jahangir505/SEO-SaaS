import { Activity, FileBarChart, Gauge, Search } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { SystemStatusCard } from '@/features/system-status';

const pillars = [
  {
    icon: Search,
    title: 'Audit',
    text: 'Crawl your site and surface technical and on-page issues.',
  },
  {
    icon: Gauge,
    title: 'Optimize',
    text: 'Prioritized, explainable fixes with a transparent score.',
  },
  {
    icon: Activity,
    title: 'Track',
    text: 'Keyword rankings, Search Console and Analytics over time.',
  },
  { icon: FileBarChart, title: 'Grow', text: 'Client-ready, white-label reports for agencies.' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 content-start items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <section className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">AI-powered SEO platform</p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Audit. Optimize. Track. Grow.
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">
              SEOFlow helps small businesses, freelancers and agencies find what’s holding their
              websites back — and fix it.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 rounded-lg border bg-card p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <SystemStatusCard />
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} SEOFlow
        </div>
      </footer>
    </div>
  );
}
