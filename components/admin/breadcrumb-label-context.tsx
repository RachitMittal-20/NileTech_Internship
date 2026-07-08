"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const BreadcrumbLabelContext = createContext<{
  label: string | null
  setLabel: (label: string | null) => void
} | null>(null)

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null)
  return (
    <BreadcrumbLabelContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  )
}

export function useBreadcrumbLabelContext() {
  return useContext(BreadcrumbLabelContext)
}

// Lets a dynamic-route page (e.g. /admin/organisations/[id]) override the
// last breadcrumb segment with a human-readable name instead of a raw id.
export function SetBreadcrumbLabel({ label }: { label: string }) {
  const ctx = useBreadcrumbLabelContext()

  useEffect(() => {
    ctx?.setLabel(label)
    return () => ctx?.setLabel(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label])

  return null
}
