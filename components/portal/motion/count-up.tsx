"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

// Animates a number from 0 to `value` on mount. Renders the final value
// immediately when the user prefers reduced motion.
export function CountUp({
  value,
  duration = 900,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0)
  const frame = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [value, duration, prefersReducedMotion])

  return (
    <span className={className} suppressHydrationWarning>
      {display.toLocaleString()}
    </span>
  )
}
