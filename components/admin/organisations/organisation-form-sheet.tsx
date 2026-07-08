"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createOrganisation, updateOrganisation } from "@/lib/actions/organisations"
import {
  CONTRACT_TYPE_LABEL,
  organisationFormSchema,
  type OrganisationFormValues,
} from "@/lib/validations/organisation"
import type { Tables } from "@/types/database"

const emptyValues: OrganisationFormValues = {
  name: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  contractType: "",
  billingNotes: "",
}

function toFormValues(org: Tables<"organisations">): OrganisationFormValues {
  const billingNotes =
    org.billing_details && typeof org.billing_details === "object" && !Array.isArray(org.billing_details)
      ? String((org.billing_details as Record<string, unknown>).notes ?? "")
      : ""

  return {
    name: org.name,
    contactName: org.contact_name ?? "",
    contactEmail: org.contact_email ?? "",
    contactPhone: org.contact_phone ?? "",
    address: org.address ?? "",
    contractType: (org.contract_type as OrganisationFormValues["contractType"]) ?? "",
    billingNotes,
  }
}

export function OrganisationFormSheet({
  open,
  onOpenChange,
  organisation,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisation?: Tables<"organisations"> | null
  onSuccess?: (id: string) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = Boolean(organisation)

  const form = useForm<OrganisationFormValues>({
    resolver: zodResolver(organisationFormSchema),
    defaultValues: organisation ? toFormValues(organisation) : emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(organisation ? toFormValues(organisation) : emptyValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, organisation])

  function onSubmit(values: OrganisationFormValues) {
    startTransition(async () => {
      const result = organisation
        ? await updateOrganisation(organisation.id, values)
        : await createOrganisation(values)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? "Organization updated." : "Organization created.")
      onOpenChange(false)
      router.refresh()
      if (result.id) onSuccess?.(result.id)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit organization" : "New organization"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this organization's details."
              : "Add a new client organization to Strong Path."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 px-4 pb-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Manufacturing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="123 Main St, Springfield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract type</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a contract type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CONTRACT_TYPE_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing details</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Billing notes, PO references, invoicing cadence..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-2 flex-row justify-end gap-2 px-0">
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
                {isEdit ? "Save changes" : "Create organization"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export function useOrganisationFormSheet() {
  const [open, setOpen] = useState(false)
  const [organisation, setOrganisation] = useState<Tables<"organisations"> | null>(null)

  return {
    open,
    organisation,
    openCreate: () => {
      setOrganisation(null)
      setOpen(true)
    },
    openEdit: (org: Tables<"organisations">) => {
      setOrganisation(org)
      setOpen(true)
    },
    setOpen,
  }
}
