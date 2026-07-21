/** Order form constants (legacy EVENT_TYPES / catMap / productAttributeMasters). */

export const ORDER_EVENT_TYPES = [
  { label: "Engagement", value: "ENGAGEMENT" },
  { label: "Wedding", value: "WEDDING" },
  { label: "Reception", value: "RECEPTION" },
  { label: "Sangeet", value: "SANGEET" },
  { label: "Mehndi", value: "MEHNDI" },
  { label: "Haldi", value: "HALDI" },
  { label: "Birthday", value: "BIRTHDAY" },
  { label: "Anniversary", value: "ANNIVERSARY" },
  { label: "Friend / relative wedding", value: "FRIEND_OR_RELATIVE_WEDDING" },
  { label: "Dhoti function", value: "DHOTI_FUNCTION" },
  { label: "Saree function", value: "SAREE_FUNCTION" },
  { label: "House warming", value: "HOUSE_WARMING" },
  { label: "Daily wear", value: "DAILY_WEAR" },
  { label: "Others", value: "OTHERS" },
] as const

/** Product code letter used when generating itemNumber = orderNo + code + index. */
export const ORDER_PRODUCT_CAT_CODES: Array<{ name: string; code: string }> = [
  { name: "full_shirt", code: "F" },
  { name: "half_shirt", code: "H" },
  { name: "blazer", code: "B" },
  { name: "chinos", code: "C" },
  { name: "trouser", code: "T" },
  { name: "suit", code: "U" },
  { name: "sherwani", code: "R" },
  { name: "waistcoat", code: "W" },
  { name: "kurta", code: "K" },
  { name: "sadri", code: "SD" },
  { name: "jodhpuri_top", code: "JD" },
  { name: "indowestern_top", code: "IW" },
  { name: "ethnic_bottom", code: "EB" },
  { name: "puna_pant", code: "PP" },
  { name: "patiyala", code: "PT" },
  { name: "dhoti", code: "DH" },
  { name: "shacket", code: "SK" },
  { name: "chudidaar", code: "CD" },
  { name: "stole", code: "ST" },
]

/** Static product attribute masters (legacy fallback list). */
export const ORDER_PRODUCT_ATTRIBUTE_MASTERS: Array<{
  name: string
  catId: string | null
}> = [
  { name: "full_shirt", catId: "5da7220571762c2a58b27a65" },
  { name: "half_shirt", catId: "5da7220571762c2a58b27a65" },
  { name: "blazer", catId: "5da7220571762c2a58b27a68" },
  { name: "chinos", catId: "5da7220571762c2a58b27a6b" },
  { name: "trouser", catId: "5da7220571762c2a58b27a67" },
  { name: "suit", catId: "5da7220571762c2a58b27a66" },
  { name: "waistcoat", catId: "5da7220571762c2a58b27a6a" },
  { name: "sherwani", catId: "5da7220571762c2a58b27a70" },
  { name: "kurta", catId: "5da7220571762c2a58b27a6e" },
  { name: "jodhpuri_top", catId: "5da7220571762c2a58b27a6c" },
  { name: "indowestern_top", catId: "5da7220571762c2a58b27a6f" },
  { name: "ethnic_bottom", catId: null },
  { name: "sadri", catId: "5da7220571762c2a58b27a6d" },
  { name: "patiyala", catId: "621a34485417ab1e143a5245" },
  { name: "puna_pant", catId: "636f3012feea0816508c5c45" },
  { name: "dhoti", catId: "6036451627e32d7fd776a580" },
  { name: "shacket", catId: null },
  { name: "shoes", catId: "5ebb993abcb3d23714b2ebf4" },
  { name: "belts", catId: "5da7220571762c2a58b27a79" },
  { name: "tie/bows", catId: "5da7220571762c2a58b27a76" },
  { name: "chudidaar", catId: "6036446927e32d7fd776a57f" },
  { name: "others", catId: null },
  { name: "stole", catId: "5da7220571762c2a58b27a74" },
  { name: "pagadi", catId: "5da7220571762c2a58b27a72" },
  { name: "jootis", catId: "5da7220571762c2a58b27a73" },
  { name: "cufflink", catId: "5da7220571762c2a58b27a78" },
  { name: "brooch", catId: "5da7220571762c2a58b27a75" },
  { name: "mala", catId: "600298c1e06beec9b987b8a6" },
]

/** S3 prefix for order payment / item image uploads (legacy S3_ORDERS_IMAGE_UPLOAD). */
export const ORDERS_IMAGE_UPLOAD_PATH = "Images/orders/store"
