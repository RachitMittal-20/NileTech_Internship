"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { fadeUp } from "@/lib/motion"

export function AdminPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduced ? false : fadeUp.initial}
        animate={fadeUp.animate}
        exit={reduced ? { opacity: 1 } : fadeUp.exit}
        transition={reduced ? { duration: 0 } : fadeUp.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
