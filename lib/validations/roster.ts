import { z } from "zod"

export const saveSampleCellSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  testTypeId: z.string().uuid(),
  vialReference: z.string().trim().max(200, "Vial reference is too long."),
})

export const setEmployeeAbsentSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  absent: z.boolean(),
})
