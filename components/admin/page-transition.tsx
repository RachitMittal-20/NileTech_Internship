"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

import { fadeUp } from "@/lib/motion"

export function AdminPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : fadeUp.initial}
      animate={fadeUp.animate}
      transition={reduced ? { duration: 0 } : fadeUp.transition}
    >
      {children}
    </motion.div>
  )
}
