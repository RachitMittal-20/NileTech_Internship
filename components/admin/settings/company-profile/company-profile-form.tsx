"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateCompanyProfile, uploadCompanyLogo } from "@/lib/actions/company-profile"
import {
  companyProfileFormSchema,
  type CompanyProfileFormValues,
} from "@/lib/validations/company-profile"
import type { CompanyProfile } from "@/lib/data/company-profile"

export function CompanyProfileForm({ company }: { company: CompanyProfile }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, startSave] = useTransition()
  const [isUploading, startUpload] = useTransition()
  const [logoUrl, setLogoUrl] = useState(company.logoUrl)
  const [error, setError] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)

  const [values, setValues] = useState<CompanyProfileFormValues>({
    name: company.name,
    contactEmail: company.contactEmail ?? "",
    contactPhone: company.contactPhone ?? "",
    address: company.address ?? "",
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = companyProfileFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form for errors.")
      return
    }

    startSave(async () => {
      const result = await updateCompanyProfile(company.id, parsed.data)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success("Company profile saved.")
      router.refresh()
    })
  }

  function onLogoSelected(file: File | undefined) {
    if (!file) return
    setLogoError(null)
    startUpload(async () => {
      const formData = new FormData()
      formData.set("file", file)
      const result = await uploadCompanyLogo(company.id, formData)
      if (result.error) {
        setLogoError(result.error)
        toast.error(result.error)
        return
      }
      toast.success("Logo updated.")
      if (result.logoUrl) setLogoUrl(result.logoUrl)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-lg">
          <AvatarImage src={logoUrl ?? undefined} alt={values.name} className="object-contain" />
          <AvatarFallback className="rounded-lg text-lg">{values.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => onLogoSelected(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {logoUrl ? "Replace logo" : "Upload logo"}
          </Button>
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or SVG. Used in PDFs and emails.</p>
          {logoError ? (
            <p role="alert" className="text-xs text-destructive">
              {logoError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company-name">Company name</Label>
        <Input
          id="company-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-email">Contact email</Label>
          <Input
            id="company-email"
            type="email"
            value={values.contactEmail}
            onChange={(e) => setValues((v) => ({ ...v, contactEmail: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-phone">Contact phone</Label>
          <Input
            id="company-phone"
            type="tel"
            value={values.contactPhone}
            onChange={(e) => setValues((v) => ({ ...v, contactPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company-address">Address</Label>
        <Textarea
          id="company-address"
          rows={2}
          value={values.address}
          onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-fit cursor-pointer" disabled={isSaving}>
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  )
}
