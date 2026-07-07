"use client"

import { useEffect, useState } from "react"

import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/browser"
import type { Tables } from "@/types/database"

type Profile = Tables<"profiles">

export function useProfile() {
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const supabase = createClient()

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, userLoading])

  return { profile, loading: userLoading || loading }
}
