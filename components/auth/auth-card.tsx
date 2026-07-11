import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoMark } from "@/components/brand/logo-mark"

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="animate-gradient-drift flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Strong Path Diagnostics
          </span>
        </div>

        <Card className="w-full border-border shadow-sm">
          <CardHeader className="gap-1.5 text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  )
}
