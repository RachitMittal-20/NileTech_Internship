"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/brand/logo-mark"
import { SITE } from "@/lib/constants"

export function LandingNavbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            {SITE.name}
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Client Portal</Link>
          </Button>
          <Button
            asChild
            className="rounded-lg bg-[#0B1D3A] px-4 py-2 text-sm text-white transition-colors hover:bg-teal-700"
          >
            <Link href="/login">Admin Sign In</Link>
          </Button>
        </nav>
      </div>
    </motion.header>
  )
}
