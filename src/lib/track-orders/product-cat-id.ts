/**
 * Resolve product category id for styling config.
 * Prefer itemCatId from the API; fall back to legacy name→catId map.
 */
export function resolveProductCatId(
  itemName?: string | null,
  itemCatId?: string | null
): string | null {
  const fromItem = itemCatId?.trim()
  if (fromItem) return fromItem

  const product = (itemName || "").toLowerCase().replace(/ /g, "_")
  switch (product) {
    case "full_shirt":
    case "half_shirt":
      return "5da7220571762c2a58b27a65"
    case "chinos":
      return "5da7220571762c2a58b27a6b"
    case "trouser":
      return "5da7220571762c2a58b27a67"
    case "blazer":
      return "5da7220571762c2a58b27a68"
    case "indowestern_top":
      return "5da7220571762c2a58b27a6f"
    case "jodhpuri_top":
      return "5da7220571762c2a58b27a6c"
    case "kurta":
      return "5da7220571762c2a58b27a6e"
    case "suit":
      return "5da7220571762c2a58b27a66"
    case "sadri":
      return "5da7220571762c2a58b27a6d"
    case "sherwani":
      return "5da7220571762c2a58b27a70"
    case "waistcoat":
      return "5da7220571762c2a58b27a6a"
    case "dhoti":
      return "6036451627e32d7fd776a580"
    case "patiyala":
      return "621a34485417ab1e143a5245"
    case "chudidaar":
      return "6036446927e32d7fd776a57f"
    case "puna_pant":
      return "636f3012feea0816508c5c45"
    case "pagadi":
      return "5da7220571762c2a58b27a72"
    case "shoes":
      return "5ebb993abcb3d23714b2ebf4"
    case "jootis":
      return "5da7220571762c2a58b27a73"
    case "stole":
      return "5da7220571762c2a58b27a74"
    case "kurta_shirt":
      return "69ce636f4fb3649d8cc497a1"
    case "gurka_pant":
      return "69c63bfd8aee6d261a428f25"
    default:
      return null
  }
}

export function hasStyleDesign(
  styleDesign?: {
    styleAttributes?: unknown[] | null
    note?: string | null
  } | null
): boolean {
  if (!styleDesign) return false
  if (styleDesign.note?.trim()) return true
  return (styleDesign.styleAttributes?.length ?? 0) > 0
}
