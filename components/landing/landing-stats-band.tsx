"use client"

import { Fragment } from "react"
import { motion } from "framer-motion"

const stats = [
  { value: "2,800+", label: "Employees Tested" },
  { value: "12", label: "Active Clients" },
  { value: "99.8%", label: "Delivery Rate" },
]

export function LandingStatsBand() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 w-full bg-slate-900 py-14"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-6 sm:gap-10">
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 ? <div className="h-10 w-px shrink-0 bg-white/20 sm:h-12" /> : null}
            <div className="min-w-0 text-center">
              <p className="text-2xl font-bold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </motion.section>
  )
}
