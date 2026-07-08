export function humanizeAuditAction(action: string, entity: string) {
  const readable = action.replace(/_/g, " ")
  const capitalized = readable.charAt(0).toUpperCase() + readable.slice(1)
  return `${capitalized} (${entity})`
}
