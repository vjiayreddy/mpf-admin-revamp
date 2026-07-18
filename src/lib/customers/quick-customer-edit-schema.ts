import { z } from "zod"

export const quickCustomerEditSchema = z.object({
  stylistId: z.string(),
  ccDueDate: z.string(),
  userStatus: z.string(),
  customerSegment: z.string(),
  customerType: z.string(),
  isStyleClubMember: z.enum(["YES", "NO"]),
  remarks: z.string(),
})

export type QuickCustomerEditFormValues = z.infer<typeof quickCustomerEditSchema>
