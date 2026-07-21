/** Studio branding for order print / PDF — ported from legacy PreviewCard. */

export type OrderPrintStudioBrand = {
  id: string
  name: string
  /** Public path under /public, e.g. /logos/mpf_dark.png */
  logoPath: string
  address: string
  phone: string
  email: string
  website: string
  /** Secondary title line (e.g. Ethnilocal LLC for Mudraa). */
  subtitle?: string
  hideBank?: boolean
}

const JUBILEE_HILLS =
  "1st Floor, Plot No.1108, Road No:55, Opp.Peddammagudi Entrance, CBI Colony, Jubilee Hills, Hyderabad, Telangana, 500033."

export const ORDER_PRINT_STUDIOS: Record<string, OrderPrintStudioBrand> = {
  "61c55048429a4414e8755e69": {
    id: "61c55048429a4414e8755e69",
    name: "Studio Groom2B (by My Perfect Fit)",
    logoPath: "/logos/Groom2BLogo.png",
    address: JUBILEE_HILLS,
    phone: "+91 95151 00372",
    email: "reachgroom2b@gmail.com",
    website: "www.groom2b.in",
  },
  "61d3ef5a2aa36c23004375ec": {
    id: "61d3ef5a2aa36c23004375ec",
    name: "My Perfect Fit",
    logoPath: "/logos/mpf_dark.png",
    address: JUBILEE_HILLS,
    phone: "+91 80083 29992",
    email: "reachus@myperfectfit.co.in",
    website: "www.myperfectfit.co.in",
  },
  "61d3ef622aa36c23004375ed": {
    id: "61d3ef622aa36c23004375ed",
    name: "BLUTAILOR",
    logoPath: "/logos/BlutailorLogo.png",
    address: JUBILEE_HILLS,
    phone: "+91 99597 48025",
    email: "theblutailor@gmail.com",
    website: "www.blutailor.com",
  },
  "6502dd6bf765d205044dbdf8": {
    id: "6502dd6bf765d205044dbdf8",
    name: "MPF Styleclub Fashtech Pvt Ltd",
    logoPath: "/logos/mpfstylelogo.png",
    address: JUBILEE_HILLS,
    phone: "+91 9959032518",
    email: "mpfstyleclub@gmail.com",
    website: "www.mpfstyleclub.com",
  },
  "671a35bc34e8c5e1b317b421": {
    id: "671a35bc34e8c5e1b317b421",
    name: "Mudraa Design (by MPF Group)",
    subtitle: "Ethnilocal LLC",
    logoPath: "/logos/MUDRAALOGO.jpg",
    address: "Ethnilocal LLC, 7582 Muirfield Dr Portage, MI 49024",
    phone: "+1(269)532-6332",
    email: "contactus@mudraadesign.com",
    website: "www.mudraadesign.com",
    hideBank: true,
  },
  "662c9a0bf810788e5bbe59bb": {
    id: "662c9a0bf810788e5bbe59bb",
    name: "WOMEN2.O (by My Perfect Fit)",
    logoPath: "/logos/WOMEN_2.0.png",
    address:
      "SF 201, Second Floor, Road Number 55, CBI Colony, Jubilee Hills, Hyderabad, Telangana, Pincode 500033.",
    phone: "+91 74169 61444",
    email: "reachwomen2o@gmail.com",
    website: "www.women2o.com",
  },
  "6662b3065c2314f01d26ad07": {
    id: "6662b3065c2314f01d26ad07",
    name: "BRIDE2B (by My Perfect Fit)",
    logoPath: "/logos/Bride2B.png",
    address:
      "SF 202, Second Floor, Plot 1108, Road Number 55, Jubilee Hills, Hyderabad, Telangana 500033",
    phone: "+91 8977111685",
    email: "reachbride2b@gmail.com",
    website: "",
  },
  "691c6a791f9631a65cecbe16": {
    id: "691c6a791f9631a65cecbe16",
    name: "POSH HIDES",
    logoPath: "/logos/poshhideLogo.png",
    address:
      "Poshhides Studio, Second Floor, Plot No.1108, Road Number 55, opp. Peddammagudi Entrance, CBI Colony, Jubilee Hills, Hyderabad, Telangana 500033",
    phone: "+91 8977181831",
    email: "Poshhides@gmail.com",
    website: "www.poshhides.com",
  },
  "690b1820593911b70259871e": {
    id: "690b1820593911b70259871e",
    name: "Studio Groom2B Online (by My Perfect Fit)",
    logoPath: "/logos/Groom2BLogo.png",
    address: JUBILEE_HILLS,
    phone: "+91 95151 00372",
    email: "reachgroom2b@gmail.com",
    website: "www.groom2b.in",
  },
  "690b183c593911b70259871f": {
    id: "690b183c593911b70259871f",
    name: "My Perfect Fit Online",
    logoPath: "/logos/mpf_dark.png",
    address: JUBILEE_HILLS,
    phone: "+91 80083 29992",
    email: "reachus@myperfectfit.co.in",
    website: "www.myperfectfit.co.in",
  },
}

/** Default MPF branding when studioId is unknown. */
export const DEFAULT_ORDER_PRINT_STUDIO: OrderPrintStudioBrand =
  ORDER_PRINT_STUDIOS["61d3ef5a2aa36c23004375ec"]!

export function getOrderPrintStudio(
  studioId?: string | null
): OrderPrintStudioBrand {
  const id = studioId?.trim()
  if (id && ORDER_PRINT_STUDIOS[id]) return ORDER_PRINT_STUDIOS[id]!
  return DEFAULT_ORDER_PRINT_STUDIO
}

export const ORDER_PRINT_TERMS = [
  "On confirmation of order, the order cannot be cancelled by the customer.",
  "Advance to be paid at the time of order confirmation. No refund will be paid for the advance amounts.",
  "Although we have all the fabrics available everyday, as there are multiple orders happening simultaneously, there is a chance of stock out. In case the fabric is out of stock, the customer can choose another fabric among the available ones and the difference in the prices would be paid/refunded. In case the customer doesn't like any alternative, he can cancel only the unavailable product from the order.",
  "Goods once sold will not be taken back.",
  "Alterations for the garments would be entertained only upto 7 days from delivery of garments.",
] as const

export const ORDER_PRINT_BANK =
  "MPF Clothing Collections Private Limited, Acc.No: 250201512016, IFSC CODE: INDB0000320, Current account, Indusland Bank, Somajiguda branch, Hyderabad."
