"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { saveSampleResult } from "@/lib/actions/results"
import { classify, type ClassificationResult, type ResultValues } from "@/lib/classification"
import type { ResultsSample, ResultsTestType } from "@/lib/data/results"

export type SampleSaveStatus = "idle" | "saving" | "saved" | "error"

const SAVE_DEBOUNCE_MS = 600

export function useResultsState(cycleId: string, samples: ResultsSample[], testTypes: ResultsTestType[]) {
  const testTypeById = useMemo(() => new Map(testTypes.map((t) => [t.id, t])), [testTypes])

  const [valuesBySample, setValuesBySample] = useState<Record<string, ResultValues>>(() =>
    Object.fromEntries(samples.map((s) => [s.sample_id, s.result?.values ?? {}]))
  )
  const [statusBySample, setStatusBySample] = useState<Record<string, SampleSaveStatus>>({})

  const valuesRef = useRef(valuesBySample)
  valuesRef.current = valuesBySample

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const scheduleSave = useCallback(
    (sampleId: string) => {
      if (timers.current[sampleId]) clearTimeout(timers.current[sampleId])

      timers.current[sampleId] = setTimeout(async () => {
        setStatusBySample((prev) => ({ ...prev, [sampleId]: "saving" }))
        const result = await saveSampleResult(cycleId, sampleId, valuesRef.current[sampleId] ?? {})
        setStatusBySample((prev) => ({ ...prev, [sampleId]: result.error ? "error" : "saved" }))
        if (result.error) toast.error(result.error)
      }, SAVE_DEBOUNCE_MS)
    },
    [cycleId]
  )

  const updateField = useCallback(
    (sampleId: string, fieldKey: string, value: ResultValues[string]) => {
      setValuesBySample((prev) => ({
        ...prev,
        [sampleId]: { ...prev[sampleId], [fieldKey]: value },
      }))
      scheduleSave(sampleId)
    },
    [scheduleSave]
  )

  const applyOverride = useCallback((sampleId: string, classification: "clear" | "flagged", reason: string) => {
    setValuesBySample((prev) => ({
      ...prev,
      [sampleId]: {
        ...prev[sampleId],
        _override: {
          classification,
          reason,
          overriddenBy: "",
          overriddenAt: new Date().toISOString(),
        },
      },
    }))
  }, [])

  function getClassification(sampleId: string, testTypeId: string): ClassificationResult | null {
    const values = valuesBySample[sampleId]
    if (!values) return null
    const testType = testTypeById.get(testTypeId)
    if (!testType) return null
    return classify(values, testType.rules, testType.fields)
  }

  return {
    valuesBySample,
    statusBySample,
    updateField,
    applyOverride,
    getClassification,
  }
}
