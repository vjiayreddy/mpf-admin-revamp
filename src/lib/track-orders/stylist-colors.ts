export type StylistColorEntry = { _id: string; name: string; color: string }

export const STYLIST_COLOR_CODE: StylistColorEntry[] = [
  { _id: "5de75fa5a72f8129f42bba29", name: "Ajit Jagannathan", color: "#2E4053" },
  { _id: "5de75fa5a72f8129f42bba2a", name: "Sushil Kumar", color: "#8E44AD" },
  { _id: "656980ad9e759b7a11f493c1", name: "Fatema Shabbir", color: "#2980B9" },
  { _id: "5f4e0bbb64f22f5fcad9c8ef", name: "Aparna P.V", color: "#16A085" },
  { _id: "66e2c30830a6f09bfcfcd57e", name: "Anisha T Stylist", color: "#27AE60" },
  { _id: "66e2c24a30a6f09bfcfcd57d", name: "Aparna P.V", color: "#D35400" },
  { _id: "66e2bfb930a6f09bfcfcd576", name: "Madhuri Mallesh", color: "#C0392B" },
  { _id: "65697ff89e759b7a11f493be", name: "Iwin Stylist", color: "#7F8C8D" },
  { _id: "665806a81575eaabfd3ce3e5", name: "Sunita Singh", color: "#1ABC9C" },
  { _id: "5f4e0f1e64f22f5fcad9c8f1", name: "Aditya", color: "#3498DB" },
  { _id: "5f8207b654a9f41a08e02614", name: "Monika Bharati", color: "#9B59B6" },
  { _id: "5f820bd654a9f41a08e02616", name: "Jigyasa Singh", color: "#34495E" },
  { _id: "5f820cb654a9f41a08e02618", name: "Shalvin Stylist", color: "#E74C3C" },
  { _id: "5f820d7c54a9f41a08e0261a", name: "Mannan", color: "#16A085" },
  { _id: "6033908b27e32d7fd776a56b", name: "Meghana M", color: "#2C3E50" },
  { _id: "63b7e302feea0816508c5c5d", name: "Divya Komrabathina", color: "#E67E22" },
  { _id: "603391f027e32d7fd776a56c", name: "R. Srikar", color: "#95A5A6" },
  { _id: "63b7e734feea0816508c5c5e", name: "Bhavana Nandamuru", color: "#D35400" },
  { _id: "6033929927e32d7fd776a56d", name: "Deepa Sekharan", color: "#8E44AD" },
  { _id: "641943196d1b741578d0f629", name: "Ritika Rajan", color: "#2980B9" },
  { _id: "63b7e78efeea0816508c5c5f", name: "Vaishnavi Sheri", color: "#2E4053" },
  { _id: "6033931527e32d7fd776a56e", name: "Ananya Raj Stylist", color: "#8E44AD" },
  { _id: "641943736d1b741578d0f62a", name: "Ananya Mittal", color: "#2980B9" },
  { _id: "61330bcda6eddf03e04488e3", name: "Priya Jaiswal", color: "#16A085" },
  { _id: "6279f4299347431a80a4e06b", name: "Supriya Soni", color: "#84aa7c" },
  { _id: "630490aefe714c1b44fd777d", name: "Sumedha MA", color: "#d9cc04" },
  { _id: "61330c27a6eddf03e04488e4", name: "Spoorthy D", color: "#b8a16f" },
]

const FALLBACK = "#CAD3C8"

export function getStylistColorCode(stylistId?: string | null): string {
  if (!stylistId) return FALLBACK
  const found = STYLIST_COLOR_CODE.find((s) => s._id === stylistId)
  if (found) return found.color
  let hash = 0
  for (let i = 0; i < stylistId.length; i++) {
    hash = (hash * 31 + stylistId.charCodeAt(i)) >>> 0
  }
  const palette = [
    "#2E4053","#8E44AD","#2980B9","#16A085","#27AE60","#D35400","#C0392B","#7F8C8D",
  ]
  return palette[hash % palette.length]
}
