import Link from "next/link"
import { ShieldCheck, ClipboardList, Building2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoMark } from "@/components/brand/logo-mark"
import { SITE } from "@/lib/constants"

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Built for compliance",
    description:
      "Access controls, audit trails, and data handling designed around healthcare data requirements.",
  },
  {
    icon: ClipboardList,
    title: "End-to-end program management",
    description:
      "Scheduling, sample tracking, results, and reporting in a single system of record.",
  },
  {
    icon: Building2,
    title: "Built for organizations",
    description:
      "Role-based access for your team and for every client organization you support.",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              {SITE.name}
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Client Portal</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Admin Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
          <div className="mx-auto flex max-w-2xl flex-col items-start gap-6">
            <Badge
              variant="secondary"
              className="border border-border bg-secondary text-secondary-foreground"
            >
              For corporate health &amp; wellness programs
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {SITE.tagline}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              {SITE.description}
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/login">
                  Go to Client Portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Admin Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
            {trustPoints.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Internal platform &mdash; not for public distribution.</span>
        </div>
      </footer>
    </div>
  )
}
