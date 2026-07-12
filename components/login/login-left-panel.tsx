"use client"

import { Fragment } from "react"
import { motion } from "framer-motion"
import { ClipboardList, Zap, Send, Building2 } from "lucide-react"

import { LogoMark } from "@/components/brand/logo-mark"

const blobTransition = {
  duration: 18,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
} as const

const features = [
  {
    icon: ClipboardList,
    title: "Test Management",
    description: "Cycle creation, scheduling, and roster tracking.",
  },
  {
    icon: Zap,
    title: "Auto Classification",
    description: "Critical value alerts, flagged automatically.",
  },
  {
    icon: Send,
    title: "One-Click Broadcast",
    description: "Results to HR instantly, no manual steps.",
  },
  {
    icon: Building2,
    title: "B2B Client Portal",
    description: "Self-service access for every organization.",
  },
]

const stats = [
  { value: "2,800+", label: "Employees Tested" },
  { value: "12", label: "Active Clients" },
  { value: "99.8%", label: "Delivery Rate" },
]

const trustPills = ["🔒 HIPAA-Ready", "✓ Encrypted", "⚡ Real-time"]

export function LoginLeftPanel() {
  return (
    <div className="relative h-full min-h-screen overflow-hidden bg-[#0B1D3A]">
      <motion.div
        className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={blobTransition}
      />
      <motion.div
        className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={blobTransition}
      />

      <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <LogoMark className="text-white" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Strong Path Diagnostics
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl leading-tight font-bold text-white">
            Precision diagnostics,
            <br />
            now streamlined.
          </h1>
          <blockquote className="mt-4 border-l-2 border-teal-400 pl-4 text-sm text-slate-300 italic">
            From scheduling to broadcast — one platform.
          </blockquote>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm"
              >
                <Icon className="size-4 text-teal-400" strokeWidth={1.75} />
                <p className="mt-1.5 text-xs font-bold text-white">{title}</p>
                <p className="text-xs text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-6">
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 ? <div className="h-8 w-px bg-white/20" /> : null}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {trustPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-300"
              >
                {pill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
