"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

export function LoginRightPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col"
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
        <p className="mt-1 mb-8 text-sm text-slate-500">Sign in to your admin console</p>

        {children}
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        © 2026 Strong Path Diagnostics · Nile Technologies Inc.
      </p>
    </motion.div>
  )
}
