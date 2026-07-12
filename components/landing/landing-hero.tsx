"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SITE } from "@/lib/constants"

export function LandingHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl px-6 py-28 text-center"
    >
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-medium text-teal-700">
        <span className="size-1.5 animate-pulse rounded-full bg-teal-500" />
        For corporate health &amp; wellness programs
      </span>

      <h1 className="text-5xl leading-tight font-bold tracking-tight text-slate-900 md:text-6xl">
        {SITE.tagline}
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">{SITE.description}</p>

      <div className="mt-8 flex justify-center gap-3">
        <Button
          size="lg"
          asChild
          className="rounded-full bg-teal-600 text-white hover:bg-teal-700"
        >
          <Link href="/login">
            Go to Client Portal
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href="/login">Admin Sign In</Link>
        </Button>
      </div>

      <p className="mt-10 text-xs tracking-widest text-slate-400 uppercase">
        Acme Manufacturing · Northwind Logistics · Meridian Health
      </p>
    </motion.section>
  )
}
