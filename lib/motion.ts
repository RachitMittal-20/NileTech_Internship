export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const

export const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
} as const

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const

export const slideLeft = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const

export const spring = { type: "spring", stiffness: 300, damping: 28 } as const
