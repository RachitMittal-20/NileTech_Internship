import type { Database } from "@/types/database"

export type TestCycleStatus = Database["public"]["Enums"]["test_cycle_status"]

// The pipeline is strictly linear — a cycle can only advance to the next
// stage, never skip ahead or jump backward. Used by both the server actions
// (to reject invalid transitions) and the UI (to render the pipeline and
// decide which action button to show).
export const STATUS_PIPELINE: TestCycleStatus[] = [
  "scheduled",
  "testing",
  "at_lab",
  "results_entry",
  "review",
  "broadcast",
  "complete",
]

export const STATUS_LABEL: Record<TestCycleStatus, string> = {
  scheduled: "Scheduled",
  testing: "Testing",
  at_lab: "At Lab",
  results_entry: "Results Entry",
  review: "Review",
  broadcast: "Broadcast",
  complete: "Complete",
}

export const STATUS_ACTION_LABEL: Record<TestCycleStatus, string> = {
  scheduled: "Start Testing",
  testing: "Send to Lab",
  at_lab: "Begin Results Entry",
  results_entry: "Send to Review",
  review: "Broadcast Results",
  broadcast: "Mark Complete",
  complete: "",
}

export function nextStatus(current: TestCycleStatus): TestCycleStatus | null {
  const index = STATUS_PIPELINE.indexOf(current)
  return index >= 0 && index < STATUS_PIPELINE.length - 1 ? STATUS_PIPELINE[index + 1] : null
}

export function isValidTransition(from: TestCycleStatus, to: TestCycleStatus): boolean {
  return nextStatus(from) === to
}
