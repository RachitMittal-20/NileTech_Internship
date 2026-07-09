import "server-only"

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"

// Single source of truth for turning a report Document into bytes — used by
// both the preview route handlers and the email attachment, so what an
// admin previews is guaranteed to be exactly what gets sent.
export async function renderReportToBuffer(
  document: ReactElement<DocumentProps>
): Promise<Buffer> {
  return renderToBuffer(document)
}
