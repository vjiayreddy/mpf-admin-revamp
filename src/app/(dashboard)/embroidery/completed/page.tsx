import { redirect } from "next/navigation"

/** Old completed route → list filtered to completed emb status. */
export default function EmbroideryCompletedRedirectPage() {
  redirect("/embroidery?embStatus=COMPLETED&orderStatus=ALL")
}
