"use client"

import { LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/actions/logout"
import type { Tables } from "@/types/database"

function initials(name: string | null) {
  if (!name) return "C"
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function PortalUserMenu({ profile }: { profile: Tables<"profiles"> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 cursor-pointer gap-2 px-2"
          aria-label={profile.full_name ?? "Account"}
        >
          <Avatar className="size-7">
            {/* bg-accent/text-accent-foreground (teal/white) fails WCAG AA
                contrast (~3.7:1) at this text size — primary/primary-foreground
                (navy/white) matches the admin UserMenu's avatar and passes. */}
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {profile.full_name ?? "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{profile.full_name ?? "Account"}</span>
          <span className="text-xs font-normal text-muted-foreground">Client Administrator</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
