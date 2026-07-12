"use client"

import { motion } from "framer-motion"
import { ShieldCheck, ClipboardList, Building2 } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Built for compliance",
    description:
      "Access controls, audit trails, and data handling designed around healthcare data requirements.",
  },
  {
    icon: ClipboardList,
    title: "End-to-end program management",
    description:
      "Scheduling, sample tracking, results, and reporting in a single system of record.",
  },
  {
    icon: Building2,
    title: "Built for organizations",
    description:
      "Role-based access for your team and for every client organization you support.",
  },
]

export function LandingFeatures() {
  return (
    <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-20 md:grid-cols-3">
      {features.map(({ icon: Icon, title, description }, index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-4 w-fit rounded-xl bg-teal-50 p-2.5">
            <Icon className="size-5 text-teal-600" strokeWidth={1.75} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
        </motion.div>
      ))}
    </section>
  )
}
