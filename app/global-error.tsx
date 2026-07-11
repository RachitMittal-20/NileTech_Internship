"use client"

import { useEffect } from "react"

// Catches errors thrown by the root layout itself (very rare — most errors
// are caught by the nested app/error.tsx / app/admin/error.tsx /
// app/portal/error.tsx instead). Next.js requires this file to render its
// own <html>/<body> since it replaces the root layout entirely when active.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#0f1f38",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#5b6b82", maxWidth: "24rem" }}>
              An unexpected error occurred. Try reloading the page — if it keeps happening, contact
              support.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              borderRadius: "0.5rem",
              backgroundColor: "#0b2545",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
