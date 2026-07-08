"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createEmployee, updateEmployee } from "@/lib/actions/employees"
import { employeeFormSchema, type EmployeeFormValues } from "@/lib/validations/employee"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

const emptyValues = (defaultOrgId?: string): EmployeeFormValues => ({
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  employeeCode: "",
  orgId: defaultOrgId ?? "",
})

function toFormValues(employee: Tables<"employees">): EmployeeFormValues {
  return {
    fullName: employee.full_name,
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    dob: employee.dob ?? "",
    employeeCode: employee.employee_code ?? "",
    orgId: employee.org_id,
  }
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  organisations,
  lockedOrgId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Tables<"employees"> | null
  organisations: { id: string; name: string }[]
  lockedOrgId?: string
  onSuccess?: (id: string) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = Boolean(employee)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employee ? toFormValues(employee) : emptyValues(lockedOrgId),
  })

  useEffect(() => {
    if (open) {
      form.reset(employee ? toFormValues(employee) : emptyValues(lockedOrgId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee])

  function onSubmit(values: EmployeeFormValues) {
    startTransition(async () => {
      const result = employee
        ? await updateEmployee(employee.id, values)
        : await createEmployee(values)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? "Employee updated." : "Employee added.")
      onOpenChange(false)
      router.refresh()
      if (result.id) onSuccess?.(result.id)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this employee's details." : "Add a new employee to an organization."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orgId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={Boolean(lockedOrgId)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organisations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full cursor-pointer justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="size-4" />
                            {field.value ? format(parseISO(field.value), "MMM d, yyyy") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                          }
                          disabled={{ after: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee code</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isEdit ? "Save changes" : "Add employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function useEmployeeFormDialog() {
  const [open, setOpen] = useState(false)
  const [employee, setEmployee] = useState<Tables<"employees"> | null>(null)

  return {
    open,
    employee,
    openCreate: () => {
      setEmployee(null)
      setOpen(true)
    },
    openEdit: (emp: Tables<"employees">) => {
      setEmployee(emp)
      setOpen(true)
    },
    setOpen,
  }
}
