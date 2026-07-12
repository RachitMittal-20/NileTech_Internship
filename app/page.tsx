import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingStatsBand } from "@/components/landing/landing-stats-band"
import { LandingFeatures } from "@/components/landing/landing-features"
import { SITE } from "@/lib/constants"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingNavbar />

      <main className="flex-1">
        <LandingHero />
        <LandingStatsBand />
        <LandingFeatures />
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </footer>
    </div>
  )
}
