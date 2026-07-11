"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

// Wraps each portal page's content so it fades in and slides up slightly on
// route change. Keyed by pathname so the animation retriggers on navigation.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
