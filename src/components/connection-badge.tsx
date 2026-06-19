export function ConnectionBadge({ configured }: { readonly configured: boolean }) {
  if (configured) {
    return null
  }

  return (
    <span className="inline-flex items-center rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700">
      Local preview
    </span>
  )
}
