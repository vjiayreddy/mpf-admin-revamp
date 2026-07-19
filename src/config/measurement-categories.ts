/** Legacy MEASUREMENT_CATEGORIES / categories list (catIds + display names). */

export const MEASUREMENT_CATEGORIES = {
  SHIRT: "5da7220571762c2a58b27a65",
  TROUSER: "5da7220571762c2a58b27a67",
  GURKA_PANT: "69c63bfd8aee6d261a428f25",
  SUIT: "5da7220571762c2a58b27a66",
  BLAZER: "5da7220571762c2a58b27a68",
  WAISTCOAT: "5da7220571762c2a58b27a6a",
  CHINOS: "5da7220571762c2a58b27a6b",
  INDOWESTERN: "5da7220571762c2a58b27a6f",
  KURTA: "5da7220571762c2a58b27a6e",
  KURTA_SHIRT: "69ce636f4fb3649d8cc497a1",
  JODHPURI: "5da7220571762c2a58b27a6c",
  SHERWANI: "5da7220571762c2a58b27a70",
  SADARI: "5da7220571762c2a58b27a6d",
  POONA_PANT: "636f3012feea0816508c5c45",
  DHOTI: "6036451627e32d7fd776a580",
  PAGDI: "5da7220571762c2a58b27a72",
  PATYALA: "621a34485417ab1e143a5245",
  JOOTIS: "5da7220571762c2a58b27a73",
  CHUDIDAR: "6036446927e32d7fd776a57f",
  SHOES: "5ebb993abcb3d23714b2ebf4",
} as const

export type MeasurementCategoryId =
  (typeof MEASUREMENT_CATEGORIES)[keyof typeof MEASUREMENT_CATEGORIES]

export type MeasurementCategoryListItem = {
  name: string
  value: string
  catImage?: string | null
}

export const MEASUREMENT_CATEGORY_LIST: MeasurementCategoryListItem[] = [
  {
    name: "Shirts",
    value: MEASUREMENT_CATEGORIES.SHIRT,
    catImage: "/images/products/Shirt.png",
  },
  {
    name: "Trousers",
    value: MEASUREMENT_CATEGORIES.TROUSER,
    catImage: "/images/products/Trouser.png",
  },
  {
    name: "Gurka Pant",
    value: MEASUREMENT_CATEGORIES.GURKA_PANT,
    catImage: null,
  },
  {
    name: "Suits",
    value: MEASUREMENT_CATEGORIES.SUIT,
    catImage: null,
  },
  {
    name: "Blazers",
    value: MEASUREMENT_CATEGORIES.BLAZER,
    catImage: "/images/products/Blazer.png",
  },
  {
    name: "Waistcoats",
    value: MEASUREMENT_CATEGORIES.WAISTCOAT,
    catImage: "/images/products/Waistcoat.png",
  },
  {
    name: "Chinos",
    value: MEASUREMENT_CATEGORIES.CHINOS,
    catImage: "/images/products/Chinos.png",
  },
  {
    name: "Indo Western",
    value: MEASUREMENT_CATEGORIES.INDOWESTERN,
    catImage: "/images/products/Indowestern.jpg",
  },
  {
    name: "Kurta",
    value: MEASUREMENT_CATEGORIES.KURTA,
    catImage: "/images/products/Kurta.png",
  },
  {
    name: "Kurta Shirt",
    value: MEASUREMENT_CATEGORIES.KURTA_SHIRT,
    catImage:
      "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/Categories/KurtaShirt/icon-kurta_shirt.png",
  },
  {
    name: "Jodhpuris",
    value: MEASUREMENT_CATEGORIES.JODHPURI,
    catImage: "/images/products/Jodhpuri.png",
  },
  {
    name: "Sherwanis",
    value: MEASUREMENT_CATEGORIES.SHERWANI,
    catImage: "/images/products/Sherwani.png",
  },
  {
    name: "Sadris",
    value: MEASUREMENT_CATEGORIES.SADARI,
    catImage: "/images/products/Sadari1.png",
  },
  {
    name: "Poona Pant",
    value: MEASUREMENT_CATEGORIES.POONA_PANT,
    catImage: null,
  },
  {
    name: "Dhoti",
    value: MEASUREMENT_CATEGORIES.DHOTI,
    catImage: "/images/products/Dhoti.png",
  },
  {
    name: "Pagdi",
    value: MEASUREMENT_CATEGORIES.PAGDI,
    catImage: "/images/products/Pagadi.png",
  },
  {
    name: "Patiyala",
    value: MEASUREMENT_CATEGORIES.PATYALA,
    catImage: "/images/products/Patiyala.png",
  },
  {
    name: "Jootis",
    value: MEASUREMENT_CATEGORIES.JOOTIS,
    catImage: "/images/products/Jootis.png",
  },
  {
    name: "Chudidar",
    value: MEASUREMENT_CATEGORIES.CHUDIDAR,
    catImage: "/images/products/Chudidaar.png",
  },
  {
    name: "Shoes",
    value: MEASUREMENT_CATEGORIES.SHOES,
    catImage: "/images/products/Shoes.png",
  },
]

export function getMeasurementCategoryMeta(catId?: string | null) {
  if (!catId) return null
  return MEASUREMENT_CATEGORY_LIST.find((c) => c.value === catId) ?? null
}
