/**
 * Fallback WhatsApp copy when getTemplatesByCCType returns nothing.
 * Placeholders: {name}, {stylistName}
 */

export const DEFAULT_WHATSAPP_TEMPLATES: Record<string, string> = {
  FIRST_ORDER_FOLLOWUP: `Hi {name}, this is {stylistName} from MyPerfectFit. Hope you're loving your first order! Do you have a moment to share how the experience has been, or is there anything we can help with? We'd love to plan your next outfit together. – Team MyPerfectFit`,

  DELIVERY_FOLLOWUP: `Hi {name}, hope you've received your recent order from MyPerfectFit. This is {stylistName} checking in — how was the fit and finish? Happy to arrange any alterations or help you plan your next piece. – Team MyPerfectFit`,

  RENEWAL_FOLLOWUP: `Hi {name}, it's been a while! This is {stylistName} from MyPerfectFit. We've got some new styles and fabrics we think you'll love. Can we schedule a quick styling session this week? – Team MyPerfectFit`,

  BIRTHDAY: `Happy Birthday {name}! Wishing you a wonderful year ahead from all of us at MyPerfectFit. We've got a little something special for you — let's plan a styling session. – Team MyPerfectFit`,

  TOUCH_BASE_CC: `Hi {name}, this is {stylistName} from MyPerfectFit. Just checking in — is there anything we can help you with today? – Team MyPerfectFit`,

  CURRENT_CC: `Hi {name}, this is {stylistName} from MyPerfectFit. Following up on your styling journey — how can we support you this week? – Team MyPerfectFit`,

  NEW_CC: `Hi {name}, welcome! This is {stylistName} from MyPerfectFit. Excited to style you — shall we schedule a quick intro call? – Team MyPerfectFit`,

  PORTFOLIO_CC: `Hi {name}, this is {stylistName} from MyPerfectFit. We'd love to feature your look in our portfolio — are you open to a short chat? – Team MyPerfectFit`,

  __GENERIC__: `Hi {name}, this is {stylistName} from MyPerfectFit. Just checking in — is there anything we can help you with today? – Team MyPerfectFit`,
}

export function getDefaultWhatsappTemplate(ccType?: string | null): string {
  if (ccType && DEFAULT_WHATSAPP_TEMPLATES[ccType]) {
    return DEFAULT_WHATSAPP_TEMPLATES[ccType]
  }
  return DEFAULT_WHATSAPP_TEMPLATES.__GENERIC__
}

export function fillWhatsappTemplate(
  template: string,
  opts: { name?: string | null; stylistName?: string | null }
) {
  return template
    .replaceAll("{name}", opts.name?.trim() || "there")
    .replaceAll("{stylistName}", opts.stylistName?.trim() || "your stylist")
}

export function openWhatsAppWithText(
  countryCode: string | null | undefined,
  phone: string | null | undefined,
  text: string
) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  window.open(url, "_blank", "noopener,noreferrer")
}
