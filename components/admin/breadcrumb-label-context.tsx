"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type LabelMap = Record<string, string>

const BreadcrumbLabelContext = createContext<{
  labels: LabelMap
  setLabel: (segment: string, label: string | null) => void
} | null>(null)

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<LabelMap>({})

  function setLabel(segment: string, label: string | null) {
    setLabels((prev) => {
      if (label === null) {
        if (!(segment in prev)) return prev
        const next = { ...prev }
        delete next[segment]
        return next
      }
      return { ...prev, [segment]: label }
    })
  }

  return (
    <BreadcrumbLabelContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  )
}

export function useBreadcrumbLabelContext() {
  return useContext(BreadcrumbLabelContext)
}

// Lets a dynamic-route page (e.g. /admin/organisations/[id] or
// /admin/test-cycles/[id]/roster) override a specific raw URL segment (an
// id) with a human-readable name instead of showing the raw id/segment.
export function SetBreadcrumbLabel({ segment, label }: { segment: string; label: string }) {
  const ctx = useBreadcrumbLabelContext()

  useEffect(() => {
    ctx?.setLabel(segment, label)
    return () => ctx?.setLabel(segment, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, label])

  return null
}
